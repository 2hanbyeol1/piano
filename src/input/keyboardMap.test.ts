import { describe, expect, it } from "vitest";
import { codeToMidi, keyHints } from "./keyboardMap";

describe("codeToMidi", () => {
  it("maps the bottom rows starting at C of the base octave", () => {
    expect(codeToMidi("KeyZ", 4)).toBe(60);
    expect(codeToMidi("KeyS", 4)).toBe(61);
    expect(codeToMidi("KeyM", 4)).toBe(71);
    expect(codeToMidi("Slash", 4)).toBe(76);
  });

  it("maps the top rows one octave higher", () => {
    expect(codeToMidi("KeyQ", 4)).toBe(72);
    expect(codeToMidi("Digit2", 4)).toBe(73);
    expect(codeToMidi("KeyI", 4)).toBe(84);
    expect(codeToMidi("BracketRight", 4)).toBe(91);
  });

  it("follows the base octave", () => {
    expect(codeToMidi("KeyZ", 3)).toBe(48);
  });

  it("ignores keys that sit where there is no black key", () => {
    for (const code of ["KeyA", "KeyF", "KeyK", "Digit1", "Digit4", "Digit8", "Minus"]) {
      expect(codeToMidi(code, 4)).toBeUndefined();
    }
  });
});

describe("keyHints", () => {
  it("labels piano keys with their computer keys, listing both where rows overlap", () => {
    const hints = keyHints(4);
    expect(hints.get(60)).toEqual(["Z"]);
    expect(hints.get(72)).toEqual([",", "Q"]);
    expect(hints.get(75)).toEqual([";", "3"]);
    expect(hints.get(91)).toEqual(["]"]);
    expect(hints.size).toBe(32);
  });
});
