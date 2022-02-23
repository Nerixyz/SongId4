/** @type {HTMLInputElement} */
const extendedRecordLength = document.getElementById('len');
const host = document.getElementById('host');
const key = document.getElementById('key');
const secret = document.getElementById('secret');

for (const el of [extendedRecordLength, host, key, secret]) {
  el.addEventListener('change', save);
}

async function save() {
  /** @type {StorageState} */
  const state = {
    extendedRecordLength: Math.min(extendedRecordLength.valueAsNumber, 15).toString(),
    host: host.value,
    key: key.value,
    secret: secret.value,
  };
  await browser.storage.sync.set(state);
}

(async function restore() {
  /** @type {StorageState} */
  const values = await browser.storage.sync.get();
  extendedRecordLength.value = values.extendedRecordLength || '';
  host.value = values.host || '';
  key.value = values.key || '';
  secret.value = values.secret || '';
})();
