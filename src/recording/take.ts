import type { NoteTracker, TrackerInput } from "../state/noteTracker";

/** `time` is milliseconds from the first recorded event. */
export interface TimedInput {
  time: number;
  input: TrackerInput;
}

export interface Take {
  events: TimedInput[];
  duration: number;
}

/** Source prefix for replayed input, so playback never gets re-recorded and can be stopped as a group. */
export const PLAYBACK_PREFIX = "play:";

export function isPlayback(input: TrackerInput): boolean {
  return input.source.startsWith(PLAYBACK_PREFIX);
}

/** Collects input during a recording; silence before the first event is trimmed off. */
export class TakeBuilder {
  private events: TimedInput[] = [];
  private firstAt: number | null = null;

  add(input: TrackerInput, now: number): void {
    this.firstAt ??= now;
    this.events.push({ time: now - this.firstAt, input });
  }

  /** Returns null when nothing was played. */
  finish(now: number): Take | null {
    if (this.firstAt === null) return null;
    return { events: this.events, duration: now - this.firstAt };
  }
}

/** Index just past the events due by `elapsed`, scanning forward from `from`. */
export function dueUntil(events: TimedInput[], from: number, elapsed: number): number {
  let i = from;
  while (i < events.length && events[i].time <= elapsed) i++;
  return i;
}

export function replay(tracker: NoteTracker, input: TrackerInput): void {
  const source = PLAYBACK_PREFIX + input.source;
  switch (input.type) {
    case "press":
      tracker.press(input.midi, source, input.velocity);
      break;
    case "release":
      tracker.release(input.midi, source);
      break;
    case "pedal":
      tracker.setPedal(source, input.down);
      break;
  }
}

/** Guards against malformed data coming back from storage. */
export function isTake(value: unknown): value is Take {
  const take = value as Take | null;
  return !!take && Array.isArray(take.events) && typeof take.duration === "number";
}
