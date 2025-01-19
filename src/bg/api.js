import { filterRecords, storeError } from "./utils";

export async function getAllRows(base) {
  let allRecords = [];
  await new Promise((resolve, reject) => {
    const requestedLastDate = new Date();
    requestedLastDate.setDate(requestedLastDate.getDate() - 500);

    base('Orders').select({
      view: "Grid view",
      fields: ['Order Updated Post Kitchen Notification'],
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
  const filteredRecords = filterRecords(allRecords);
  return filteredRecords;
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
      storeError("Error fetching bases:", data.error);
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
    storeError("Failed to fetch bases:", error);
  }
}