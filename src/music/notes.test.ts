import { describe, expect, it } from "vitest";
import { clampBaseOctave, isBlack, keyRange, noteName } from "./notes";

describe("noteName", () => {
  it("names notes in letter mode with octave", () => {
    expect(noteName(60, "letter")).toBe("C4");
    expect(noteName(61, "letter")).toBe("C♯4");
    expect(noteName(21, "letter")).toBe("A0");
    expect(noteName(108, "letter")).toBe("C8");
  });

  it("names notes in solfege mode", () => {
    expect(noteName(60, "solfege")).toBe("도");
    expect(noteName(67, "solfege")).toBe("솔");
    expect(noteName(70, "solfege")).toBe("라♯");
  });

  it("returns empty string when labels are off", () => {
    expect(noteName(60, "off")).toBe("");
  });
});

describe("isBlack", () => {
  it("identifies black keys", () => {
    expect([60, 61, 62, 63, 64, 65, 66].map(isBlack)).toEqual([false, true, false, true, false, false, true]);
  });
});

describe("keyRange / clampBaseOctave", () => {
  it("spans C to C inclusive", () => {
    expect(keyRange(3, 3)).toEqual({ low: 48, high: 84 });
  });

  it("keeps the keyboard between C1 and C8", () => {
    expect(clampBaseOctave(0, 3)).toBe(1);
    expect(clampBaseOctave(7, 3)).toBe(5);
    expect(clampBaseOctave(7, 2)).toBe(6);
    expect(clampBaseOctave(4, 2)).toBe(4);
  });
});
