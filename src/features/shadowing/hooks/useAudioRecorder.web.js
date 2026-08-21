import { useRef, useState, useCallback } from 'react';

function getSupportedMimeType() {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export function useAudioRecorder() {
  const [status, setStatus] = useState('idle'); // idle | requesting | recording | recorded | error
  const [audioUri, setAudioUri] = useState(null);
  const [stream, setStream] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const startPromise = useRef(null);
  const stopRequested = useRef(false);

  const start = useCallback(() => {
    stopRequested.current = false;
    setStatus('requesting');

    startPromise.current = (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(s);
        chunks.current = [];

        const mimeType = getSupportedMimeType();
        const recorder = mimeType ? new MediaRecorder(s, { mimeType }) : new MediaRecorder(s);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks.current, { type: mimeType || 'audio/webm' });
          setAudioUri(URL.createObjectURL(blob));
          setStatus('recorded');
          s.getTracks().forEach((t) => t.stop());
          setStream(null);
        };

        mediaRecorder.current = recorder;
        recorder.start();

        if (stopRequested.current) {
          recorder.stop();
        } else {
          setStatus('recording');
        }
      } catch (err) {
        console.error('[useAudioRecorder] getUserMedia failed:', err);
        setStatus('error');
      }
    })();
  }, []);

  const stop = useCallback(async () => {
    stopRequested.current = true;
    if (startPromise.current) await startPromise.current;
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setAudioUri(null);
    setStatus('idle');
    stopRequested.current = false;
  }, []);

  return { status, audioUri, stream, start, stop, reset };
}