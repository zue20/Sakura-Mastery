import { useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';

export function useAudioRecorder() {
  const [status, setStatus] = useState('idle');
  const [audioUri, setAudioUri] = useState(null);
  const [metering, setMetering] = useState(-160); // dB, silence baseline
  const recordingRef = useRef(null);

  const start = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setStatus('error');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (s) => {
          if (s.metering !== undefined) setMetering(s.metering);
        },
        100 // metering update interval, ms
      );
      recordingRef.current = recording;
      setStatus('recording');
    } catch (err) {
      setStatus('error');
    }
  }, []);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
    setStatus('recorded');
    recordingRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setAudioUri(null);
    setStatus('idle');
  }, []);

  return { status, audioUri, metering, start, stop, reset };
}