import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer/';
import secret from '../../secret';
import http from 'http';
import crypto from 'crypto';
import qs from 'querystring';
import styled from 'styled-components';

async function arrayBuffer(blob) {
	if (blob.arrayBuffer) {
		return blob.arrayBuffer()
	} else {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()

			function onLoadEnd (e) {
				reader.removeEventListener('loadend', onLoadEnd, false)
				if (e.error) reject(e.error)
				else resolve(Buffer.from(reader.result))
			}

			reader.addEventListener('loadend', onLoadEnd, false)
			reader.readAsArrayBuffer(blob)
		})
	}
}

const gettingStoredSecrets = browser.storage.sync.get();

function create_sign(data, secret_key) {
	return crypto.createHmac('sha1', secret_key).update(data).digest().toString('base64');
}

function recognize(host, access_key, secret_key, query_data, query_type) {
	return new Promise((resolve, reject) => {
		var http_method = "POST"
		var http_uri = "/v1/identify"
		var data_type = query_type
		var signature_version = "1"
		var current_data = new Date();
		var minutes = current_data.getTimezoneOffset();
		var timestamp = parseInt(current_data.getTime() / 1000) + minutes * 60 + '';
		var sample_bytes = query_data.length + '';

		var options = {
			hostname: host,
			port: 80,
			path: http_uri,
			method: http_method,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			// "is not a valid url" without this added.
			protocol: 'http:'
		};

		var string_to_sign = http_method + "\n" + http_uri + "\n" + access_key + "\n" + data_type + "\n" + signature_version + "\n" + timestamp;
		var sign = create_sign(string_to_sign, secret_key);
		var post_data = {
			'access_key': access_key,
			'sample_bytes': sample_bytes,
			'sample': query_data.toString('base64'),
			'timestamp': timestamp,
			'signature': sign,
			'data_type': data_type,
			'signature_version': signature_version,
		};

		var content = qs.stringify(post_data);

		var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				resolve(chunk);
			});
		});

		req.on('error', function(e) {
			console.log('SONG IDENTIFIER: problem with request: ' + e.message);
			reject(e);
		});

		req.write(content);
		req.end();
	});
}

const host = secret.host;
const your_access_key = secret.key;
const your_access_secret = secret.secret;
const data_type = 'audio';

const YOUTUBE = query => `https://www.youtube.com/results?search_query=${query}`
const SOUNDCLOUD = query => `https://soundcloud.com/search?q=${query}`
const GOOGLE = query => `https://www.google.com/search?q=${query}`

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

export default ({ blob }) => {
	const [status, setStatus] = useState('Extracting...');
	const [showLinks, setShowLinks] = useState(false);

	useEffect(() => {
		(async () => {

			try {
				const arrayBuffer = await blob.arrayBuffer();

				const secrets = await gettingStoredSecrets;
				setStatus('Fetching...')

				const response = await recognize(
					secrets.host || host,
					secrets.key || your_access_key,
					secrets.secret || your_access_secret,
					Buffer.from(arrayBuffer),
					data_type
				).then(r => JSON.parse(r));

				if (!response.metadata) {
					setStatus(`${response.status.msg}`);
					return;
				}

				const song = response.metadata.music[0];
				const artist = song.artists && song.artists[0] && song.artists[0].name;

				setStatus(`${song.title || 'N/A'} - ${artist || 'N/A'}`)
				setShowLinks(true);
			} catch(e) {
				setStatus(`Error: ${e}`);
			}
		})()
	}, [blob]);

	return (
		<Level>
			<span>{status}</span>
			{showLinks && (
				<HorizontalList>
					<Link href={YOUTUBE(status)}>YouTube</Link>
					<Link href={SOUNDCLOUD(status)}>SoundCloud</Link>
					<Link href={GOOGLE(status)}>Google</Link>
				</HorizontalList>
			)}
		</Level>
	)
};
