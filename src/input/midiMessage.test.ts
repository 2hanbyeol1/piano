import { describe, expect, it } from "vitest";
import { parseMidiMessage } from "./midiMessage";

describe("parseMidiMessage", () => {
  it("parses note on on any channel", () => {
    expect(parseMidiMessage([0x90, 60, 100])).toEqual({ type: "noteOn", note: 60, velocity: 100 });
    expect(parseMidiMessage([0x93, 64, 1])).toEqual({ type: "noteOn", note: 64, velocity: 1 });
  });

  it("treats note off and zero-velocity note on as note off", () => {
    expect(parseMidiMessage([0x80, 60, 40])).toEqual({ type: "noteOff", note: 60 });
    expect(parseMidiMessage([0x90, 60, 0])).toEqual({ type: "noteOff", note: 60 });
  });

  it("parses the sustain pedal (CC64)", () => {
    expect(parseMidiMessage([0xb0, 64, 127])).toEqual({ type: "sustain", down: true });
    expect(parseMidiMessage([0xb0, 64, 0])).toEqual({ type: "sustain", down: false });
  });

  it("ignores other messages", () => {
    expect(parseMidiMessage([0xb0, 7, 100])).toBeNull();
    expect(parseMidiMessage([0xf8])).toBeNull();
  });
});
