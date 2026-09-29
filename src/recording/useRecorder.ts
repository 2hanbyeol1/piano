import { useCallback, useEffect, useRef, useState } from "react";
import type { NoteTracker } from "../state/noteTracker";
import { usePersistentState } from "../state/usePersistentState";
import { dueUntil, isPlayback, isTake, PLAYBACK_PREFIX, replay, TakeBuilder, type Take } from "./take";

export type TransportMode = "idle" | "recording" | "playing";

/** Longest the playback loop sleeps, so the elapsed-time display keeps moving. */
const MAX_TICK_MS = 50;
const RECORDING_CLOCK_MS = 100;

export function useRecorder(tracker: NoteTracker) {
  const [storedTake, setTake] = usePersistentState<Take | null>("piano.take", null);
  const take = isTake(storedTake) ? storedTake : null;
  const [mode, setMode] = useState<TransportMode>("idle");
  const [elapsed, setElapsed] = useState(0);
  // Tears down whatever is currently running (recording or playback).
  const teardownRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    teardownRef.current?.();
    teardownRef.current = null;
    setMode("idle");
  }, []);

  const record = useCallback(() => {
    teardownRef.current?.();
    const builder = new TakeBuilder();
    const startedAt = performance.now();
    const unsubscribe = tracker.onInput((input) => {
      if (!isPlayback(input)) builder.add(input, performance.now());
    });
    const clock = setInterval(() => setElapsed(performance.now() - startedAt), RECORDING_CLOCK_MS);

    teardownRef.current = () => {
      unsubscribe();
      clearInterval(clock);
      const finished = builder.finish(performance.now());
      // An empty recording keeps the previous take.
      if (finished) setTake(finished);
    };
    setElapsed(0);
    setMode("recording");
  }, [tracker, setTake]);

  const play = useCallback(() => {
    if (!take) return;
    teardownRef.current?.();
    const { events, duration } = take;
    const startedAt = performance.now();
    let next = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = performance.now() - startedAt;
      const due = dueUntil(events, next, now);
      for (; next < due; next++) replay(tracker, events[next].input);
      setElapsed(Math.min(now, duration));
      if (next >= events.length && now >= duration) {
        stop();
        return;
      }
      const untilNext = next < events.length ? events[next].time - now : duration - now;
      timer = setTimeout(tick, Math.max(0, Math.min(untilNext, MAX_TICK_MS)));
    };

    teardownRef.current = () => {
      clearTimeout(timer);
      tracker.releaseAll(PLAYBACK_PREFIX);
    };
    setMode("playing");
    tick();
  }, [take, tracker, stop]);

  useEffect(() => () => teardownRef.current?.(), []);

  return { mode, elapsed, take, record, play, stop };
}
