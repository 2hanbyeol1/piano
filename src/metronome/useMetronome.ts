import { useEffect, useRef, useState } from "react";
import { scheduleClick } from "./click";
import { beatsUntil, type Beat } from "./schedule";

const TICK_MS = 25;
const LOOKAHEAD_S = 0.1;
const START_DELAY_S = 0.05;

interface MetronomeSettings {
  enabled: boolean;
  bpm: number;
  beatsPerBar: number;
  volume: number;
}

/**
 * Lookahead scheduler: a coarse JS timer queues clicks slightly ahead on the
 * precise audio clock. Returns the beat currently sounding, or null when off.
 */
export function useMetronome(context: AudioContext | null, settings: MetronomeSettings): number | null {
  const [currentBeat, setCurrentBeat] = useState<number | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!context || !settings.enabled) return;
    let next: Beat = { time: context.currentTime + START_DELAY_S, beat: 0 };
    const pending = new Set<ReturnType<typeof setTimeout>>();

    const tick = () => {
      const { bpm, beatsPerBar, volume } = settingsRef.current;
      const result = beatsUntil(next, context.currentTime + LOOKAHEAD_S, bpm, beatsPerBar);
      next = result.next;
      for (const { time, beat } of result.beats) {
        scheduleClick(context, time, beat === 0, volume);
        const timer = setTimeout(() => {
          pending.delete(timer);
          setCurrentBeat(beat);
        }, Math.max(0, (time - context.currentTime) * 1000));
        pending.add(timer);
      }
    };

    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(interval);
      pending.forEach(clearTimeout);
      setCurrentBeat(null);
    };
  }, [context, settings.enabled]);

  return currentBeat;
}
