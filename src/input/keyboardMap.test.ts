import { describe, expect, it } from "vitest";
import { codeToMidi, keyHints } from "./keyboardMap";

describe("codeToMidi", () => {
  it("maps the home row to white keys starting at C of the base octave", () => {
    expect(codeToMidi("KeyA", 4)).toBe(60);
    expect(codeToMidi("KeyS", 4)).toBe(62);
    expect(codeToMidi("KeyK", 4)).toBe(72);
    expect(codeToMidi("Quote", 4)).toBe(77);
  });

  it("maps the upper row to black keys", () => {
    expect(codeToMidi("KeyW", 4)).toBe(61);
    expect(codeToMidi("KeyP", 4)).toBe(75);
  });

  it("follows octave shifts", () => {
    expect(codeToMidi("KeyA", 3)).toBe(48);
  });

  it("ignores unmapped keys", () => {
    expect(codeToMidi("KeyQ", 4)).toBeUndefined();
    expect(codeToMidi("KeyZ", 4)).toBeUndefined();
  });
});

describe("keyHints", () => {
  it("labels piano keys with their computer key", () => {
    const hints = keyHints(4);
    expect(hints.get(60)).toBe("A");
    expect(hints.get(76)).toBe(";");
    expect(hints.get(77)).toBe("'");
    expect(hints.size).toBe(18);
  });
});
