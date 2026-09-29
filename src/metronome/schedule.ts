export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const BEATS_PER_BAR_OPTIONS = [2, 3, 4, 6];

export function clampBpm(bpm: number): number {
  return Math.min(Math.max(Math.round(bpm), MIN_BPM), MAX_BPM);
}

/** A beat at `time` (AudioContext seconds); `beat` is its 0-based position in the bar. */
export interface Beat {
  time: number;
  beat: number;
}

/**
 * Every beat from `next` that starts before `horizon`, plus the beat after them.
 * Reading bpm/beatsPerBar per call lets tempo changes apply from the next beat.
 */
export function beatsUntil(next: Beat, horizon: number, bpm: number, beatsPerBar: number): { beats: Beat[]; next: Beat } {
  const beats: Beat[] = [];
  const interval = 60 / bpm;
  let current = { time: next.time, beat: next.beat % beatsPerBar };
  while (current.time < horizon) {
    beats.push(current);
    current = { time: current.time + interval, beat: (current.beat + 1) % beatsPerBar };
  }
  return { beats, next: current };
}
