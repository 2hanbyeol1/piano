import { cOf } from "../music/notes";

/**
 * Semitone offset from C of the base octave, keyed by `KeyboardEvent.code`.
 * Using physical key codes keeps the layout working under a Korean IME.
 * Tracker-style two-row layout; `, . /` overlap `Q W E` on purpose.
 *
 *  2 3   5 6 7   9 0   =
 * Q W E R T Y U I O P [ ]     (+1 octave)
 *  S D   G H J   L ;
 * Z X C V B N M , . /
 */
const KEY_OFFSETS: Record<string, number> = {
  KeyZ: 0,
  KeyS: 1,
  KeyX: 2,
  KeyD: 3,
  KeyC: 4,
  KeyV: 5,
  KeyG: 6,
  KeyB: 7,
  KeyH: 8,
  KeyN: 9,
  KeyJ: 10,
  KeyM: 11,
  Comma: 12,
  KeyL: 13,
  Period: 14,
  Semicolon: 15,
  Slash: 16,

  KeyQ: 12,
  Digit2: 13,
  KeyW: 14,
  Digit3: 15,
  KeyE: 16,
  KeyR: 17,
  Digit5: 18,
  KeyT: 19,
  Digit6: 20,
  KeyY: 21,
  Digit7: 22,
  KeyU: 23,
  KeyI: 24,
  Digit9: 25,
  KeyO: 26,
  Digit0: 27,
  KeyP: 28,
  BracketLeft: 29,
  Equal: 30,
  BracketRight: 31,
};

export const SUSTAIN_CODE = "Space";

const PUNCTUATION_LABELS: Record<string, string> = {
  Comma: ",",
  Period: ".",
  Slash: "/",
  Semicolon: ";",
  BracketLeft: "[",
  BracketRight: "]",
  Equal: "=",
};

export function codeToMidi(code: string, baseOctave: number): number | undefined {
  const offset = KEY_OFFSETS[code];
  return offset === undefined ? undefined : cOf(baseOctave) + offset;
}

function codeLabel(code: string): string {
  return PUNCTUATION_LABELS[code] ?? code.replace(/^(Key|Digit)/, "");
}

/** MIDI note → labels of the computer keys that play it (two where the rows overlap). */
export function keyHints(baseOctave: number): Map<number, string[]> {
  const hints = new Map<number, string[]>();
  for (const [code, offset] of Object.entries(KEY_OFFSETS)) {
    const midi = cOf(baseOctave) + offset;
    hints.set(midi, [...(hints.get(midi) ?? []), codeLabel(code)]);
  }
  return hints;
}
