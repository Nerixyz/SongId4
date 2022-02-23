import wait from 'sleep-promise';

const REC_LENGTH = 5;
/**
 * @param {HTMLMediaElement} media
 * @param recLength
 * @returns {Promise<Blob>}
 */
export default async function record(media, recLength = REC_LENGTH) {
  recLength = recLength * 1000;
  if (media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || media.paused) {
    return Promise.reject({ msg: 'Media is paused or has no data' });
  }
  /** @type {MediaStream} */
  let stream;
  if (media.captureStream) {
    stream = media.captureStream();
  } else if (media.mozCaptureStream) {
    stream = media.mozCaptureStream();
  }

  // to keep the audio playing
  if (globalThis.songId4AudioCtx) {
    const { audioCtx, source } = globalThis.songId4AudioCtx;
    source.disconnect();
    const newSource = audioCtx.createMediaStreamSource(stream);
    newSource.connect(audioCtx.destination);
    globalThis.songId4AudioCtx.source = newSource;
  } else {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(audioCtx.destination);
    globalThis.songId4AudioCtx = { audioCtx, source };
  }

  // Only take in the AUDIO. Video is useless but it can be sent too. This saves the server's bandwidth and our time.
  const pureAudioStream = new MediaStream(stream.getAudioTracks());
  const recorder = new MediaRecorder(pureAudioStream);

  const data = [];

  recorder.ondataavailable = event => data.push(event.data);

  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = () => reject({ message: 'Security', url: media.src });
  });

  const started = new Promise((resolve, reject) => {
    try {
      recorder.start();
      resolve();
    } catch (e) {
      reject({ message: 'Security', url: media.src });
    }
  });

  const recorded = wait(recLength).then(() => recorder.state === 'recording' && recorder.stop());

  await Promise.all([started, stopped, recorded]);
  return new Blob(data);
}
