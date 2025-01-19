import { generateCodeChallenge, generateRandomString } from "./utils";

// Constants
const CLIENT_ID = "b91a2cb4-bf74-4614-bf84-35ea2337b69d";
const REDIRECT_URI = chrome.identity.getRedirectURL("oauth");
const AUTH_BASE_URL = "https://airtable.com/oauth2/v1/authorize";
const TOKEN_URL = "https://airtable.com/oauth2/v1/token";

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
        console.error("OAuth Error:", chrome.runtime.lastError.message);
        return;
      }

      const urlParams = new URLSearchParams(new URL(redirectedUrl).search);
      const authCode = urlParams.get("code");
      const returnedState = urlParams.get("state");

      if (returnedState !== state) {
        console.error("State mismatch. Possible CSRF attack!");
        return;
      }

      console.log("Authorization Code:", authCode);
      await exchangeCodeForToken(authCode, codeVerifier);
    });
  } catch (error) {
    console.error("Authentication Error:", error);
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
      console.error("Token Exchange Error:", data.error);
    } else {
      console.log(data);
      console.log("Access Token:", data.access_token);
      storeToken(data);
    }
  } catch (error) {
    console.error("Token Exchange Failed:", error);
  }
}

function storeToken(data, refreshed = false) {
  var _tokenData = { ...data, refreshedAt: new Date().toISOString() };
  if(!refreshed){
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
      const response = await fetch('https://api.airtable.com/v0/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });
      const data = await response.json();
      if (data.error) {
        console.error("Token Refresh Error:", data.error);
        reject(data.error);
      } else {
        console.log("New Access Token:", data.access_token);
        storeToken(data, true);
        resolve(data);
      }
    } catch (error) {
      console.error("Token Refresh Failed:", error);
      reject(error);
    }
  });
}

export async function getBases(accessToken) {
  try {
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error fetching bases:", data.error);
    } else {
      console.log("Bases:", data.bases);
      // Store the bases data along with the token data
      chrome.storage.local.get("airtableTokenData", (result) => {
        const updatedData = {
          ...result.airtableTokenData,
          bases: data.bases
        };
        chrome.storage.local.set({ airtableTokenData: updatedData }, () => {
          console.log("Bases data stored successfully");
        });
      });
    }
  } catch (error) {
    console.error("Failed to fetch bases:", error);
  }
}