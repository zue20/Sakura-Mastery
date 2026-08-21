import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const isSecureCtx = typeof window !== 'undefined' ? window.isSecureContext : true;

export function useSpeechRecognition({ lang = 'ja-JP' } = {}) {
  const hasApi = !!SpeechRecognitionAPI;

  const [isSupported] = useState(hasApi && isSecureCtx);

  const [unavailableReason] = useState(
    !hasApi ? 'unsupported-browser' : !isSecureCtx ? 'insecure-connection' : null
  );

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef('');
  const latestAlternativesRef = useRef([]);

  // Accumulates FINAL results across automatic session restarts — mobile
  // Chrome frequently fires `onend` early even with continuous:true, and
  // each new session's `event.results` starts from index 0 again, so
  // without this the transcript from before a restart would be lost.
  const finalTranscriptRef = useRef('');

  // false while we intend to keep listening (so `onend` should trigger an
  // auto-restart); true once the caller explicitly calls stop().
  const manualStopRef = useRef(true);

  const startSession = useCallback(() => {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? '';
        if (result.isFinal) {
          finalTranscriptRef.current += text;
        } else {
          interim += text;
        }
      }

      const combined = (finalTranscriptRef.current + interim).trim();
      latestTranscriptRef.current = combined;
      setTranscript(combined);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult) {
        const alts = [];
        for (let j = 0; j < lastResult.length; j++) {
          if (lastResult[j]?.transcript) alts.push(lastResult[j].transcript);
        }
        latestAlternativesRef.current = alts;
        setAlternatives(alts);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' fires constantly on mobile during brief pauses between
      // words — it is not fatal, `onend` (below) decides whether to restart.
      if (event.error !== 'no-speech') {
        setError(event.error ?? 'recognition-error');
      }
    };

    recognition.onend = () => {
      if (!manualStopRef.current) {
        // The session ended on its own (mobile quirk) but the user hasn't
        // stopped recording — start a fresh session and keep going. Final
        // results captured so far are preserved in finalTranscriptRef.
        startSession();
        return;
      }
      setIsListening(false);
      setTranscript(latestTranscriptRef.current);
      setAlternatives(latestAlternativesRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      setError(unavailableReason ?? 'unsupported');
      return;
    }
    setTranscript('');
    setAlternatives([]);
    setError(null);
    latestTranscriptRef.current = '';
    latestAlternativesRef.current = [];
    finalTranscriptRef.current = '';
    manualStopRef.current = false;

    setIsListening(true);
    startSession();
  }, [isSupported, unavailableReason, startSession]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setAlternatives([]);
    setError(null);
    latestTranscriptRef.current = '';
    latestAlternativesRef.current = [];
    finalTranscriptRef.current = '';
  }, []);

  return { isSupported, unavailableReason, isListening, transcript, alternatives, error, start, stop, reset };
}