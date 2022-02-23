import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

/**
 * @typedef {{
 *   status: {
 *     code: number,
 *     msg: string,
 *   },
 *   metadata?: {
 *     music: Array<{artists?: string[], title?: string}>
 *   }
 * }} ACRResponse
 */

/**
 * @typedef {{key?: string, host?: string, extendedRecordLength?: string, secret?: string}} StorageState
 */

async function getArrayBuffer(blob) {
  if ('function' === typeof blob.arrayBuffer) {
    return blob.arrayBuffer();
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      function onLoadEnd(e) {
        reader.removeEventListener('loadend', onLoadEnd, false);
        if (e.error) reject(e.error);
        else resolve(reader.result);
      }

      reader.addEventListener('loadend', onLoadEnd, false);
      reader.readAsArrayBuffer(blob);
    });
  }
}

/** @type {Promise<StorageState> }*/
const gettingStoredSecrets = browser.storage.sync.get();

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
  if (!('subtle' in crypto)) {
    // HTTP context
    return await browser.runtime.sendMessage({ type: 'sign', key, string });
  }
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, [
    'sign',
  ]);
  const buffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(string));
  return bufferToString(buffer);
}

/**
 *
 * @param {string} host
 * @param {string} accessKey
 * @param {string} secretKey
 * @param {Blob} sample
 * @param {string} dataType
 * @returns {Promise<ACRResponse>}
 */
async function recognize({ host, accessKey, secretKey, sample, dataType }) {
  const now = (new Date().getTime() / 1000) | 0;
  const signatureVersion = '1';
  const uri = '/v1/identify';
  const signature = await signString(secretKey, ['POST', uri, accessKey, dataType, signatureVersion, now].join('\n'));

  const form = new FormData();
  form.append('sample', sample);
  form.append('access_key', accessKey);
  form.append('sample_bytes', sample.size.toString());
  form.append('timestamp', now.toString());
  form.append('signature', signature);
  form.append('data_type', dataType);
  form.append('signature_version', signatureVersion);

  const baseUrl = host.startsWith('http') ? host : `https://${host}`;
  return fetch(baseUrl.endsWith('/') ? `${baseUrl}${uri.substring(1)}` : `${baseUrl}${uri}`, {
    method: 'POST',
    body: form,
  }).then(x => x.json());
}

const YOUTUBE = query => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
const SOUNDCLOUD = query => `https://soundcloud.com/search?q=${encodeURIComponent(query)}`;
const GOOGLE = query => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

const HorizontalList = styled.div`
  display: inline-flex;
  flex-flow: row;
`;

const Link = styled.a`
  color: lightgrey;
  padding: 0 1rem;
`;

const Level = styled.div`
  display: flex;
  flex: 2;
  justify-content: space-between;
`;

const LevelFlex = styled.span`
  display: flex;
`;

/**
 * @param {Blob | undefined} blob
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export default ({ blob, children }) => {
  const [status, setStatus] = useState('Extracting...');
  const [showLinks, setShowLinks] = useState(false);
  const [goAgain, setShowGoAgain] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!blob) return;
        const storage = await gettingStoredSecrets;
        setStatus('Fetching...');

        const response = await recognize({
          host: storage.host,
          accessKey: storage.key,
          dataType: 'audio',
          sample: blob,
          secretKey: storage.secret,
        });

        if (!response.metadata) {
          if (response.status && response.status.code === 3003) {
            setStatus('Default account limit exceeded for today. Check options page.');
          } else {
            setStatus(`${response.status.msg}`);
            setShowGoAgain(true);
          }
          return;
        }
        setShowGoAgain(false);

        const song = response.metadata.music[0];
        const artist = song.artists && song.artists[0] && song.artists[0].name;

        setStatus(`${artist || 'N/A'} - ${song.title || 'N/A'}`);
        setShowLinks(true);
      } catch (e) {
        setStatus(`Error: ${e}`);
      }
    })();
  }, [blob]);

  return (
    <Level>
      <span>{status}</span>
      <LevelFlex>{goAgain ? children : null}</LevelFlex>
      {showLinks && (
        <HorizontalList>
          <Link href={YOUTUBE(status)} target="_blank">
            YouTube
          </Link>
          <Link href={SOUNDCLOUD(status)} target="_blank">
            SoundCloud
          </Link>
          <Link href={GOOGLE(status)} target="_blank">
            Google
          </Link>
        </HorizontalList>
      )}
    </Level>
  );
};
