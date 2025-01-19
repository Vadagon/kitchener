import Airtable from "airtable";
import { playSound, storeError } from "./utils";
import { getAllRows } from "./api";

export function checkForChangesAndMakeSound(tokenData) {
    var base = new Airtable({ apiKey: tokenData.access_token }).base(tokenData.bases[0].id);
    getAllRows(base).then(allRecords => {
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