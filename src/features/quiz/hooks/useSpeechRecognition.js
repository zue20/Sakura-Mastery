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

// Safari needs a beat between the mic permission being granted and the
// recognizer actually capturing audio — starting immediately is a known
// cause of the first attempt silently missing the first word or two.
const IOS_MIC_WARMUP_MS = 350;

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

  // Tracks whether ANY restart in the current session ever produced a
  // final transcript — if the loop trips and this is still false, it's
  // not a flaky-mobile-ending problem, it's the recognizer never
  // capturing anything at all (Siri disabled, or the dictation language
  // pack for `lang` isn't installed on-device).
  const everGotResultRef = useRef(false);

  const startSession = useCallback(() => {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    // Continuous mode is the less reliable path on WebKit — single-shot
    // sessions chained via onend (below) behave the same from the
    // caller's perspective but fail less often on iOS/iPadOS.
    recognition.continuous = !isIOS;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? '';
        if (result.isFinal) {
          finalTranscriptRef.current += text;
          if (text.trim()) everGotResultRef.current = true;
        } else {
          interim += text;
          if (text.trim()) everGotResultRef.current = true;
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
      // 'no-speech' fires constantly on mobile during brief pauses
      // between words — not fatal, onend (below) decides on restarting.
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
          manualStopRef.current = true;
          setIsListening(false);
          // Distinguish "kept restarting but never once captured audio"
          // from a generic flaky loop — the former points at a device
          // setting (Siri off, or `lang`'s dictation pack not
          // installed), not a code bug, and needs different UI copy.
          setError(
            everGotResultRef.current ? 'recognition-restart-loop' : 'recognition-never-captured'
          );
          setTranscript(latestTranscriptRef.current);
          setAlternatives(latestAlternativesRef.current);
          return;
        }

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

  const start = useCallback(async () => {
    if (!isSupported) {
      setError(unavailableReason ?? 'unsupported');
      return false;
    }
    setTranscript('');
    setAlternatives([]);
    setError(null);
    latestTranscriptRef.current = '';
    latestAlternativesRef.current = [];
    finalTranscriptRef.current = '';
    everGotResultRef.current = false;
    manualStopRef.current = false;
    restartCountRef.current = 0;
    restartWindowStartRef.current = Date.now();

    setIsListening(true);

    if (isIOS && navigator.mediaDevices?.getUserMedia) {
      try {
        // Requesting the stream directly ensures the permission prompt
        // (and the mic actually powering up) happens before the
        // recognizer starts, rather than racing it.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        await new Promise((resolve) => setTimeout(resolve, IOS_MIC_WARMUP_MS));
      } catch (err) {
        setIsListening(false);
        setError('mic-permission-denied');
        return false;
      }
    }

    startSession();
    return true;
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
    everGotResultRef.current = false;
  }, []);

  return {
    isSupported,
    unavailableReason,
    isListening,
    transcript,
    alternatives,
    error,
    start,
    stop,
    reset,
  };
}