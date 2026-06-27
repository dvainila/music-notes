import { useCallback, useEffect, useRef, useState } from 'react';

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_TIME = 0.1;
const CLICK_DURATION = 0.05;

interface ScheduledBeat {
  beat: number;
  time: number;
}

export function useMetronome() {
  const [bpm, setBpm] = useState(100);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerTimeoutRef = useRef<number | null>(null);
  const drawFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(bpm);
  const beatsPerBarRef = useRef(beatsPerBar);
  const nextNoteTimeRef = useRef(0);
  const beatNumberRef = useRef(0);
  const scheduledBeatsRef = useRef<ScheduledBeat[]>([]);

  bpmRef.current = bpm;
  beatsPerBarRef.current = beatsPerBar;

  const scheduleClick = useCallback((beatNumber: number, time: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = beatNumber === 0 ? 1000 : 700;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(beatNumber === 0 ? 1 : 0.6, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + CLICK_DURATION);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + CLICK_DURATION);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlayingRef.current) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduledBeatsRef.current.push({ beat: beatNumberRef.current, time: nextNoteTimeRef.current });
      scheduleClick(beatNumberRef.current, nextNoteTimeRef.current);

      nextNoteTimeRef.current += 60 / bpmRef.current;
      beatNumberRef.current = (beatNumberRef.current + 1) % beatsPerBarRef.current;
    }

    schedulerTimeoutRef.current = window.setTimeout(scheduler, LOOKAHEAD_MS);
  }, [scheduleClick]);

  const draw = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx) {
      const now = ctx.currentTime;
      while (scheduledBeatsRef.current.length && scheduledBeatsRef.current[0].time <= now) {
        setCurrentBeat(scheduledBeatsRef.current[0].beat);
        scheduledBeatsRef.current.shift();
      }
    }
    if (isPlayingRef.current) {
      drawFrameRef.current = requestAnimationFrame(draw);
    }
  }, []);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (schedulerTimeoutRef.current !== null) {
      window.clearTimeout(schedulerTimeoutRef.current);
      schedulerTimeoutRef.current = null;
    }
    if (drawFrameRef.current !== null) {
      cancelAnimationFrame(drawFrameRef.current);
      drawFrameRef.current = null;
    }
    scheduledBeatsRef.current = [];
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const start = useCallback(async () => {
    const ctx = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = ctx;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    beatNumberRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    scheduledBeatsRef.current = [];
    isPlayingRef.current = true;
    setIsPlaying(true);
    scheduler();
    draw();
  }, [draw, scheduler]);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      stop();
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { bpm, setBpm, beatsPerBar, setBeatsPerBar, isPlaying, currentBeat, toggle };
}
