import { describe, expect, it } from "vitest";
import { beatsUntil, clampBpm } from "./schedule";

describe("clampBpm", () => {
  it("rounds and clamps to 40–240", () => {
    expect(clampBpm(99.6)).toBe(100);
    expect(clampBpm(10)).toBe(40);
    expect(clampBpm(500)).toBe(240);
  });
});

describe("beatsUntil", () => {
  it("returns beats before the horizon and the next beat to schedule", () => {
    const { beats, next } = beatsUntil({ time: 1, beat: 0 }, 2.1, 120, 4);
    expect(beats).toEqual([
      { time: 1, beat: 0 },
      { time: 1.5, beat: 1 },
      { time: 2, beat: 2 },
    ]);
    expect(next).toEqual({ time: 2.5, beat: 3 });
  });

  it("wraps to the downbeat at the end of the bar", () => {
    const { beats } = beatsUntil({ time: 0, beat: 2 }, 1.1, 60, 3);
    expect(beats.map((b) => b.beat)).toEqual([2, 0]);
  });

  it("returns nothing when the next beat is beyond the horizon", () => {
    const next = { time: 5, beat: 1 };
    expect(beatsUntil(next, 4.9, 100, 4)).toEqual({ beats: [], next });
  });

  it("folds the beat index into a shorter bar when the meter changes", () => {
    const { beats } = beatsUntil({ time: 0, beat: 5 }, 0.1, 60, 4);
    expect(beats).toEqual([{ time: 0, beat: 1 }]);
  });
});
