import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import { frequencyToNote, type DetectedNote } from '../music/frequency';

// 0.93 turned out to be unrealistically strict for a real phone mic (as opposed to a
// clean synthetic signal): it passed often enough on the brightest string but rarely
// elsewhere, which combined with the stability window below to make detection feel
// like it needed several seconds to "warm up". The stability/majority-vote check is
// the real defense against noise, so the raw per-frame bar can be more forgiving.
const MIN_CLARITY = 0.8;

// Kept just above the typical electrical/ADC noise floor (~0.001-0.002 RMS on most
// mics) — going lower risks treating pure silence as signal. This isn't the main
// defense against false positives though: MIN_CLARITY plus the majority-vote
// stability window below do that job, since random noise essentially never produces
// a strong, consistent periodicity reading the way a real plucked string does.
const MIN_VOLUME = 0.004;

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

// A sharp rise in RMS between consecutive ticks is treated as a fresh pluck. When that
// happens we clear the stability history so a freshly played note isn't out-voted by
// whatever was still ringing/decaying from the previous one (e.g. an adjacent string).
const ONSET_VOLUME_JUMP = 0.03;

// How much we boost the expected frequency (in dB) when a practice target is known, and
// how narrow that boost is (higher Q = narrower band, less likely to also lift a
// neighboring string's pitch).
const BOOST_GAIN_DB = 15;
const BOOST_Q = 8;

interface PitchDetectionState {
  isListening: boolean;
  detected: DetectedNote | null;
  volume: number;
  error: string | null;
}

/**
 * @param targetFrequencies When provided (e.g. during practice mode, for the specific
 * note/string being tested), a narrow EQ boost is tuned to the first of these
 * frequencies before analysis. This raises the expected note's prominence relative to
 * other strings ringing/resonating at the same time, instead of treating the whole
 * 50Hz-1500Hz range as equally likely to contain the "real" note.
 */
export function usePitchDetection(targetFrequencies?: number[]) {
  const [state, setState] = useState<PitchDetectionState>({
    isListening: false,
    detected: null,
    volume: 0,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const boostRef = useRef<BiquadFilterNode | null>(null);
  const recentNotesRef = useRef<(DetectedNote['note'] | null)[]>([]);
  const lastReportedNoteRef = useRef<DetectedNote | null>(null);
  const lastReportedVolumeRef = useRef(0);
  const prevVolumeRef = useRef(0);
  const targetFrequenciesRef = useRef(targetFrequencies);
  targetFrequenciesRef.current = targetFrequencies;

  const applyBoost = useCallback(() => {
    const boost = boostRef.current;
    if (!boost) return;
    const freqs = targetFrequenciesRef.current;
    if (freqs && freqs.length > 0) {
      boost.frequency.value = freqs[0];
      boost.gain.value = BOOST_GAIN_DB;
    } else {
      boost.gain.value = 0;
    }
  }, []);

  // Re-tune the boost live when the practice target changes (new note/string) while
  // already listening, instead of only picking it up on the next start().
  useEffect(() => {
    applyBoost();
  }, [targetFrequencies, applyBoost]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    boostRef.current = null;
    recentNotesRef.current = [];
    lastReportedNoteRef.current = null;
    lastReportedVolumeRef.current = 0;
    prevVolumeRef.current = 0;
    setState((prev) => ({ ...prev, isListening: false, detected: null, volume: 0 }));
  }, []);

  const start = useCallback(async () => {
    try {
      // Create (and resume) the AudioContext synchronously, before any await, so it's
      // still tied to the click's user-activation. iOS WebKit (both Safari and Chrome,
      // which is just a WebKit wrapper there) can permanently strand the context in
      // "suspended" if creation happens only after the getUserMedia permission prompt
      // has been waited on — at that point the gesture has gone stale and resume() may
      // silently no-op, breaking pitch detection on iPhone with no visible error.
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Voice-call style processing mangles musical pitch content; ask for the
          // rawest signal the device/browser will give us.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      // Belt-and-suspenders: resume again in case iOS suspended it while the
      // permission dialog was open.
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);

      // Band-pass the signal to the guitar's range before analysis: this cuts low-end
      // rumble/handling noise and high-frequency hiss that would otherwise pollute the
      // autocorrelation and occasionally get picked up as a spurious pitch.
      //
      // The cutoff needs real headroom below the open low E string (~82.41Hz) — a
      // biquad filter still measurably attenuates frequencies less than an octave
      // above its cutoff. At 70Hz, E2 sat close enough to the rolloff that its
      // fundamental got attenuated relative to its own harmonics, occasionally making
      // the detector lock onto the 3rd harmonic (~247Hz, a B) instead of the true E.
      const highpass = audioContext.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 50;

      const lowpass = audioContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 1500;

      // Optional narrow boost around the expected note (see applyBoost) — flat/no-op
      // until a practice target is set.
      const boost = audioContext.createBiquadFilter();
      boost.type = 'peaking';
      boost.Q.value = BOOST_Q;
      boost.gain.value = 0;
      boostRef.current = boost;
      applyBoost();

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(boost);
      boost.connect(analyser);

      // A node graph that never reaches the destination isn't guaranteed to be part
      // of the "active" rendering graph per spec — Chrome tends to process it anyway,
      // but Safari/WebKit (i.e. every browser on iPhone, since they're all WebKit
      // under the hood) can simply not pull audio through a dangling chain, which
      // silently broke detection completely on iOS. Route through a muted gain node
      // so the graph is genuinely live without the user hearing their own mic.
      const mute = audioContext.createGain();
      mute.gain.value = 0;
      analyser.connect(mute);
      mute.connect(audioContext.destination);

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

        // A fresh pluck shows up as a sharp jump in RMS — reset the vote history so a
        // newly played note isn't out-voted by a still-ringing previous/adjacent string.
        if (volume - prevVolumeRef.current > ONSET_VOLUME_JUMP) {
          recentNotesRef.current = [];
        }
        prevVolumeRef.current = volume;

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
      prevVolumeRef.current = 0;
      setState({ isListening: true, detected: null, volume: 0, error: null });
      intervalRef.current = window.setInterval(tick, ANALYSIS_INTERVAL_MS);
    } catch (err) {
      audioContextRef.current?.close();
      audioContextRef.current = null;
      setState({
        isListening: false,
        detected: null,
        volume: 0,
        error: err instanceof Error ? err.message : 'Could not access the microphone',
      });
    }
  }, [applyBoost]);

  useEffect(() => stop, [stop]);

  return { ...state, start, stop };
}
