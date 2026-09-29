/** Lowest and highest notes of an 88-key piano (A0, C8). */
export const MIN_MIDI = 21;
export const MAX_MIDI = 108;

/** Lowest octave the on-screen keyboard can start at (C1). */
export const MIN_BASE_OCTAVE = 1;
/** Highest note the on-screen keyboard can reach is C8, so it ends at octave 8. */
const MAX_TOP_OCTAVE = 8;

export type LabelMode = "letter" | "solfege" | "off";

const LETTERS = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const SOLFEGE = ["도", "도♯", "레", "레♯", "미", "파", "파♯", "솔", "솔♯", "라", "라♯", "시"];
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function isBlack(midi: number): boolean {
  return BLACK_PITCH_CLASSES.has(pitchClass(midi));
}

/** MIDI number of C in the given octave (C4 = 60). */
export function cOf(octave: number): number {
  return (octave + 1) * 12;
}

export function noteName(midi: number, mode: LabelMode): string {
  switch (mode) {
    case "letter":
      return `${LETTERS[pitchClass(midi)]}${octaveOf(midi)}`;
    case "solfege":
      return SOLFEGE[pitchClass(midi)];
    case "off":
      return "";
  }
}

/** Keys shown on screen: C of `baseOctave` through C of `baseOctave + visibleOctaves`. */
export function keyRange(baseOctave: number, visibleOctaves: number): { low: number; high: number } {
  return { low: cOf(baseOctave), high: cOf(baseOctave + visibleOctaves) };
}

export function clampBaseOctave(baseOctave: number, visibleOctaves: number): number {
  const max = MAX_TOP_OCTAVE - visibleOctaves;
  return Math.min(Math.max(baseOctave, MIN_BASE_OCTAVE), max);
}
