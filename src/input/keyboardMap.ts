import { cOf } from "../music/notes";

/**
 * Semitone offset from C of the base octave, keyed by `KeyboardEvent.code`.
 * Using physical key codes keeps the layout working under a Korean IME.
 *
 *  W E   T Y U   O P
 * A S D F G H J K L ; '
 */
const KEY_OFFSETS: Record<string, number> = {
  KeyA: 0,
  KeyW: 1,
  KeyS: 2,
  KeyE: 3,
  KeyD: 4,
  KeyF: 5,
  KeyT: 6,
  KeyG: 7,
  KeyY: 8,
  KeyH: 9,
  KeyU: 10,
  KeyJ: 11,
  KeyK: 12,
  KeyO: 13,
  KeyL: 14,
  KeyP: 15,
  Semicolon: 16,
  Quote: 17,
};

export const OCTAVE_DOWN_CODE = "KeyZ";
export const OCTAVE_UP_CODE = "KeyX";
export const SUSTAIN_CODE = "Space";

export function codeToMidi(code: string, baseOctave: number): number | undefined {
  const offset = KEY_OFFSETS[code];
  return offset === undefined ? undefined : cOf(baseOctave) + offset;
}

function codeLabel(code: string): string {
  if (code === "Semicolon") return ";";
  if (code === "Quote") return "'";
  return code.replace(/^Key/, "");
}

/** MIDI note → key label to print on that piano key. */
export function keyHints(baseOctave: number): Map<number, string> {
  const hints = new Map<number, string>();
  for (const [code, offset] of Object.entries(KEY_OFFSETS)) {
    hints.set(cOf(baseOctave) + offset, codeLabel(code));
  }
  return hints;
}
