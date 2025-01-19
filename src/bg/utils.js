// Utility Functions
export function generateRandomString(length = 64) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => String.fromCharCode(b))
        .map((char) => char.charCodeAt(0).toString(36))
        .join("")
        .substring(0, length);
}

export async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export function storeError(error, erro1) {
    console.error(error, erro1);
    chrome.storage.local.set({ error: error + erro1.toString() }, () => {
        console.log('All records stored locally by Order ID');
    });
}
export async function playSound() {
    const offscreenUrl = chrome.runtime.getURL('audio.html');
    const offscreenDoc = await chrome.offscreen.hasDocument();
    if (offscreenDoc) {
        await chrome.offscreen.closeDocument();
    }
    await chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'notification',
    });
}


export function filterRecords(allRecords) {
    return allRecords.filter(record => !!record.get('Order Updated Post Kitchen Notification'));
}
