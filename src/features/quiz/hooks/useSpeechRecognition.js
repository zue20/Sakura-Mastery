
import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const isSecureCtx = typeof window !== 'undefined' ? window.isSecureContext : true;


const isIOS =
  typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

const isStandalonePWA =
  typeof window !== 'undefined' &&
  (window.navigator.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches);

const isIOSInstalledPWA = isIOS && isStandalonePWA;

export function useSpeechRecognition({ lang = 'ja-JP' } = {}) {
  const hasApi = !!SpeechRecognitionAPI;

  const [isSupported] = useState(hasApi && isSecureCtx && !isIOSInstalledPWA);

  const [unavailableReason] = useState(
    !hasApi
      ? 'unsupported-browser'
      : !isSecureCtx
      ? 'insecure-connection'
      : isIOSInstalledPWA
      ? 'ios-installed-pwa'
      : null
  );

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef('');
  const latestAlternativesRef = useRef([]);

  const finalTranscriptRef = useRef('');

  const manualStopRef = useRef(true);

  const restartCountRef = useRef(0);
  const restartWindowStartRef = useRef(0);
  const MAX_RESTARTS_PER_WINDOW = 4;
  const RESTART_WINDOW_MS = 5000;

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
        const now = Date.now();
        if (now - restartWindowStartRef.current > RESTART_WINDOW_MS) {
          restartWindowStartRef.current = now;
          restartCountRef.current = 0;
        }
        restartCountRef.current += 1;

        if (restartCountRef.current > MAX_RESTARTS_PER_WINDOW) {
          // Ending on its own this fast, this many times, means something
          // is structurally rejecting start() (e.g. an environment our
          // static isSupported check didn't catch) — stop looping.
          manualStopRef.current = true;
          setIsListening(false);
          setError('recognition-restart-loop');
          setTranscript(latestTranscriptRef.current);
          setAlternatives(latestAlternativesRef.current);
          return;
        }

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
    restartCountRef.current = 0;
    restartWindowStartRef.current = Date.now();

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