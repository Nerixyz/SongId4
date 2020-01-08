import wait from 'sleep-promise';

const recLength = 5 * 1000;
export default function record(media) {
	console.log(media);
	if (
		media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
		|| media.paused
	) {
		return;
	}
	let stream;
	if (media.captureStream) {
		stream = media.captureStream()
	} else if (media.mozCaptureStream) {
		stream = media.mozCaptureStream()
	}

	// to keep the audio playing.. just terrible quality though. terrible.
	const audioCtx = window.songIdContext || new AudioContext()
	if (!window.songIdContext) {
		try {
			const source = audioCtx.createMediaStreamSource(stream)
			source.connect(audioCtx.destination)
		} catch(e) {}
	}
	window.songIdContext = audioCtx;

	// Only take in the AUDIO. Video is useless but it can be sent too. This saves the server's bandwith and our time.
	const pureAudioStream = new MediaStream(stream.getAudioTracks())
	const recorder = new MediaRecorder(pureAudioStream);

	const data = [];

	recorder.ondataavailable = event => data.push(event.data)

	const stopped = new Promise((resolve, reject) => {
		recorder.onstop = resolve;
		recorder.onerror = () => reject({ message: 'Security', url: media.src });
	});

	const started = new Promise((resolve, reject) => {
		try {
			recorder.start()
			resolve()
		} catch (e) {
			reject({ message: 'Security', url: media.src })
		}
	})

	const recorded = wait(recLength).then(
		() => recorder.state == "recording" && recorder.stop()
	);

	console.log(started, stopped, recorded)

	return Promise.all([
		started,
		stopped,
		recorded
	])
		.then(() => {
			// Do something with blob!
			return new Blob(data)
		})
}
