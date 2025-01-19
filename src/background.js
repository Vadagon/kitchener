"use strict";

import { authenticateWithAirtable, getBases, refreshAccessToken } from "./bg/oauth";
import Airtable from "airtable";
import { playSound, storeError } from "./bg/utils";

// Configure Airtable
var base;

// // Function to get rows with 'order updated' not empty
// function getRowsWithOrderUpdated() {
//   base('WIP Odyssey Database 2.0').select({
//     filterByFormula: "NOT({order updated} = '')"
//   }).eachPage((records, fetchNextPage) => {
//     records.forEach(record => {
//       console.log('Retrieved', record.get('order updated'));
//     });
//     fetchNextPage();
//   }, (err) => {
//     if (err) { storeError(err); return; }
//   });
// }
// Function to get all rows from the selected table
async function getAllRows() {
  let allRecords = [];
  await new Promise((resolve, reject) => {
    const requestedLastDate = new Date();
    requestedLastDate.setDate(requestedLastDate.getDate() - 500);

    base('Orders').select({
      view: "Grid view",
      fields: ['Order Updated Post Kitchen Notification', 'fldujBflajusBDTCE'],
      maxRecords: 200
    }).eachPage((records, fetchNextPage) => {
      allRecords = allRecords.concat(records);
      fetchNextPage();
    }, (err) => {
      if (err) {
        storeError(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
  const filteredRecords = allRecords.filter(record => !!record.get('Order Updated Post Kitchen Notification'));
  return filteredRecords;
}

// Event Listener
chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get("airtableTokenData", (result) => {
    if (result.airtableTokenData) {
      const tokenData = result.airtableTokenData;
      const now = new Date();
      const refreshExpiresIn = (tokenData.refresh_expires_in && tokenData.retrievedAt) ? new Date(new Date(tokenData.retrievedAt).getTime() + tokenData.refresh_expires_in * 1000) : null;
      const expiresIn = (tokenData.expires_in && tokenData.refreshedAt) ? new Date(new Date(tokenData.refreshedAt).getTime() + tokenData.expires_in * 1000) : null;
      if (!refreshExpiresIn || now >= refreshExpiresIn) {
        console.log("Refresh token expired, re-authenticating...");
        authenticateWithAirtable();
      } else if (!expiresIn || now >= expiresIn) {
        console.log("Access token expired, renewing token...");
        // Add your token renewal logic here
        refreshAccessToken(tokenData.refresh_token).catch(() => {
          authenticateWithAirtable();
        });
      } else {
        console.log("Token already exists:", tokenData);
        if (tokenData.bases.length === 0) {
          storeError("No bases found.");
        } else {
          base = new Airtable({ apiKey: tokenData.access_token }).base(tokenData.bases[0].id);
          // getRowsWithOrderUpdated();
          // getAllRows(tokenData.bases[0].id);
          getAllRows(tokenData.bases[0].id).then(allRecords => {
            const recordsById = allRecords.reduce((acc, record) => {
              acc[record.id] = { ...record.fields, id: record.id };
              return acc;
            }, {});
            chrome.storage.local.get('recordsById', (result) => {
              const oldRecordsById = result.recordsById || {};
              const newRecords = Object.keys(recordsById).filter(id => !oldRecordsById[id]);
              console.log(
                'oldRecordsById: ' + Object.keys(oldRecordsById).length, oldRecordsById,
                'recordsById: ' + Object.keys(recordsById).length, recordsById,
                'newRecords: ' + Object.keys(newRecords).length, newRecords);
              if (newRecords.length > 0 && Object.keys(oldRecordsById).length > 0) {
                console.log('New records added:', newRecords);
                playSound();
              }
              chrome.storage.local.set({ recordsById: recordsById }, () => {
                console.log('All records stored locally by Order ID');
              });
            });
          }).catch(err => {
            storeError('Error retrieving records: ' + err);
          });
        }
      }
    } else {
      authenticateWithAirtable();
    }
  });
});
