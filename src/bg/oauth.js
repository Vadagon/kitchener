import Airtable from "airtable";
import { generateCodeChallenge, generateRandomString, storeError } from "./utils";
import { getBases } from "./api";

// Constants
const CLIENT_ID = "b91a2cb4-bf74-4614-bf84-35ea2337b69d";
const REDIRECT_URI = chrome.identity.getRedirectURL("oauth");
const AUTH_BASE_URL = "https://airtable.com/oauth2/v1/authorize";
const TOKEN_URL = "https://airtable.com/oauth2/v1/token";
const TOKEN_REFRESH_URL = 'https://api.airtable.com/oauth2/v1/token';
// OAuth Flow
export async function authenticateWithAirtable() {
  try {
    const state = generateRandomString();
    const codeVerifier = generateRandomString();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const scopes = ["data.records:read", "user.email:read", "schema.bases:read", "webhook:manage"].join(" ");

    const authUrl = `${AUTH_BASE_URL}?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    console.log("Auth URL:", authUrl);

    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, async (redirectedUrl) => {
      if (chrome.runtime.lastError) {
        storeError("OAuth Error:", chrome.runtime.lastError.message);
        return;
      }

      const urlParams = new URLSearchParams(new URL(redirectedUrl).search);
      const authCode = urlParams.get("code");
      const returnedState = urlParams.get("state");

      if (returnedState !== state) {
        storeError("State mismatch. Possible CSRF attack!");
        return;
      }

      console.log("Authorization Code:", authCode);
      await exchangeCodeForToken(authCode, codeVerifier);
    });
  } catch (error) {
    storeError("Authentication Error:", error);
  }
}

export async function exchangeCodeForToken(authCode, codeVerifier) {
  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        code: authCode,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();

    if (data.error) {
      storeError("Token Exchange Error:", data.error);
    } else {
      console.log(data);
      console.log("Access Token:", data.access_token);
      storeToken(data);
    }
  } catch (error) {
    storeError("Token Exchange Failed:", error);
  }
}

function storeToken(data, refreshed = false) {
  var _tokenData = { ...data, refreshedAt: new Date().toISOString() };
  if (!refreshed) {
    _tokenData.retrievedAt = new Date().toISOString();
  }
  chrome.storage.local.set({ airtableTokenData: _tokenData }, () => {
    console.log("Token data stored successfully");
    getBases(data.access_token);
  });
}

export function refreshAccessToken(refreshToken) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(TOKEN_REFRESH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          refresh_token: refreshToken
        })
      });
      const data = await response.json();
      if (data.error) {
        storeError("Token Refresh Error:", data.error);
        reject(data.error);
      } else {
        console.log("New Access Token:", data.access_token);
        storeToken(data, true);
        resolve(data);
      }
    } catch (error) {
      storeError("Token Refresh Failed:", error);
      reject(error);
    }
  });
}



export function isTokenDataOk(tokenData) {
  const now = new Date();
  const refreshExpiresIn = (tokenData.refresh_expires_in && tokenData.retrievedAt) ? new Date(new Date(tokenData.retrievedAt).getTime() + tokenData.refresh_expires_in * 1000) : null;
  const expiresIn = (tokenData.expires_in && tokenData.refreshedAt) ? new Date(new Date(tokenData.refreshedAt).getTime() + tokenData.expires_in * 1000) : null;

  if (!refreshExpiresIn || now >= refreshExpiresIn) {
    console.log("Refresh token expired, re-authenticating...");
    authenticateWithAirtable();
  } else if (!expiresIn || now >= expiresIn) {
    console.log("Access token expired, renewing token...");
    refreshAccessToken(tokenData.refresh_token).catch(() => {
      // authenticateWithAirtable();
    });
  }
  return true;
}