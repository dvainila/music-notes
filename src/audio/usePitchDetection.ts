import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import { frequencyToNote, type DetectedNote } from '../music/frequency';

const MIN_CLARITY = 0.93;
const MIN_VOLUME = 0.015;

// Guitar range (with margin): open low E (~82Hz) to high frets on the high E string (~1100Hz).
const MIN_FREQUENCY = 75;
const MAX_FREQUENCY = 1200;

// Larger buffer improves accuracy for low strings, at the cost of latency (~93ms at 44.1kHz).
const FFT_SIZE = 4096;

// Fixed analysis cadence, decoupled from display refresh rate (60Hz vs 120Hz devices
// would otherwise change how much smoothing STABILITY_WINDOW actually provides).
const ANALYSIS_INTERVAL_MS = 40;

// How many of the last STABILITY_WINDOW raw readings must agree before we report a note.
const STABILITY_WINDOW = 6;
const STABILITY_THRESHOLD = 4;

const VOLUME_REPORT_STEP = 0.02;

interface PitchDetectionState {
  isListening: boolean;
  detected: DetectedNote | null;
  volume: number;
  error: string | null;
}

export function usePitchDetection() {
  const [state, setState] = useState<PitchDetectionState>({
    isListening: false,
    detected: null,
    volume: 0,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const recentNotesRef = useRef<(DetectedNote['note'] | null)[]>([]);
  const lastReportedNoteRef = useRef<DetectedNote | null>(null);
  const lastReportedVolumeRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    recentNotesRef.current = [];
    lastReportedNoteRef.current = null;
    lastReportedVolumeRef.current = 0;
    setState((prev) => ({ ...prev, isListening: false, detected: null, volume: 0 }));
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Band-pass the signal to the guitar's range before analysis: this cuts low-end
      // rumble/handling noise and high-frequency hiss that would otherwise pollute the
      // autocorrelation and occasionally get picked up as a spurious pitch.
      const highpass = audioContext.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 70;

      const lowpass = audioContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 1500;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(analyser);

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      const input = new Float32Array(detector.inputLength);

      const tick = () => {
        analyser.getFloatTimeDomainData(input);

        // RMS is a steadier loudness measure than a single sample peak — it isn't
        // thrown off by one stray spike, which made the volume readout (and the
        // threshold gating on it) jumpier than the actual perceived loudness.
        let sumSquares = 0;
        for (let i = 0; i < input.length; i += 1) {
          sumSquares += input[i] * input[i];
        }
        const volume = Math.sqrt(sumSquares / input.length);

        const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);

        const rawNote =
          clarity >= MIN_CLARITY &&
          volume >= MIN_VOLUME &&
          pitch >= MIN_FREQUENCY &&
          pitch <= MAX_FREQUENCY
            ? frequencyToNote(pitch)
            : null;

        const history = recentNotesRef.current;
        history.push(rawNote?.note ?? null);
        if (history.length > STABILITY_WINDOW) history.shift();

        // Keep showing the last confirmed note until a new one is confidently detected,
        // instead of clearing it as soon as the signal briefly drops out.
        let stableNote: DetectedNote | null = lastReportedNoteRef.current;
        if (rawNote) {
          const matches = history.filter((n) => n === rawNote.note).length;
          if (matches >= STABILITY_THRESHOLD) {
            stableNote = rawNote;
          }
        }

        const noteChanged = stableNote?.note !== lastReportedNoteRef.current?.note;
        const volumeChanged = Math.abs(volume - lastReportedVolumeRef.current) >= VOLUME_REPORT_STEP;

        if (noteChanged || volumeChanged) {
          lastReportedNoteRef.current = stableNote;
          lastReportedVolumeRef.current = volume;
          setState((prev) => ({ ...prev, detected: stableNote, volume }));
        }
      };

      recentNotesRef.current = [];
      lastReportedNoteRef.current = null;
      lastReportedVolumeRef.current = 0;
      setState({ isListening: true, detected: null, volume: 0, error: null });
      intervalRef.current = window.setInterval(tick, ANALYSIS_INTERVAL_MS);
    } catch (err) {
      setState({
        isListening: false,
        detected: null,
        volume: 0,
        error: err instanceof Error ? err.message : 'Could not access the microphone',
      });
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { ...state, start, stop };
}
