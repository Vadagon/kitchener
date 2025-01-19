"use strict";

import { authenticateWithAirtable, isTokenDataOk, refreshAccessToken } from "./bg/oauth";

import { storeError } from "./bg/utils";
import { checkForChangesAndMakeSound } from "./bg/functions";

function main() {
  chrome.storage.local.get("airtableTokenData", (result) => {
    if (result.airtableTokenData) {
      const tokenData = result.airtableTokenData;
      var tokenIsOk = isTokenDataOk(tokenData);
      if (!tokenIsOk) return;
      if (tokenData.bases.length === 0) {
        storeError("No bases found.");
      } else {
        checkForChangesAndMakeSound(tokenData);
      }
    }
  });
}



chrome.alarms.create("checkAirtableChanges", { periodInMinutes: 0.1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkAirtableChanges") {
    main();
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'authenticate') {
    authenticateWithAirtable()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }));
  } else if (request.action === 'getBasesList') {
    chrome.storage.local.get("airtableTokenData", (result) => {
      if (result.airtableTokenData) {
        sendResponse(result.airtableTokenData);
      }
    });
  }
  return true; // Will respond asynchronously.
});