browser.browserAction.onClicked.addListener(() => {
  // Basically injects into the attention-bar iframes too.
  // Guess this is not great, but it's not life-threatening either..
  browser.tabs.executeScript({
    file: '/dist/index.js',
    allFrames: true,
  });
});

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToString(buffer) {
  const view = new Uint8Array(buffer);
  let string = '';
  for (let i = 0; i < view.byteLength; i++) {
    string += String.fromCharCode(view[i]);
  }
  return btoa(string);
}

/**
 * @param {string} key
 * @param {string} string
 * @returns {Promise<string>}
 */
async function signString(key, string) {
  // here we're always in a secure context
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, [
    'sign',
  ]);
  const buffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(string));
  return bufferToString(buffer);
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (typeof message !== 'object' || message.type !== 'sign') return false;
  signString(message.key, message.string).then(sendResponse);
  return true;
});
