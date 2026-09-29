import { describe, expect, it } from "vitest";
import { NoteTracker, type TrackerInput } from "../state/noteTracker";
import { dueUntil, isPlayback, isTake, replay, TakeBuilder } from "./take";

const press = (midi: number, source = "kbd:KeyZ"): TrackerInput => ({ type: "press", midi, source, velocity: 90 });
const release = (midi: number, source = "kbd:KeyZ"): TrackerInput => ({ type: "release", midi, source });

describe("TakeBuilder", () => {
  it("times events from the first one, trimming leading silence", () => {
    const builder = new TakeBuilder();
    builder.add(press(60), 1000);
    builder.add(release(60), 1250);
    expect(builder.finish(1500)).toEqual({
      events: [
        { time: 0, input: press(60) },
        { time: 250, input: release(60) },
      ],
      duration: 500,
    });
  });

  it("returns null when nothing was played", () => {
    expect(new TakeBuilder().finish(1000)).toBeNull();
  });
});

describe("dueUntil", () => {
  const events = [0, 100, 100, 300].map((time) => ({ time, input: press(60) }));

  it("advances past every event due by the elapsed time", () => {
    expect(dueUntil(events, 0, 0)).toBe(1);
    expect(dueUntil(events, 1, 150)).toBe(3);
    expect(dueUntil(events, 3, 299)).toBe(3);
    expect(dueUntil(events, 3, 1000)).toBe(4);
  });
});

describe("replay", () => {
  it("replays under the playback prefix without disturbing live input", () => {
    const log: string[] = [];
    const tracker = new NoteTracker({ noteOn: (m) => log.push(`on ${m}`), noteOff: (m) => log.push(`off ${m}`) });
    const seen: TrackerInput[] = [];
    tracker.onInput((input) => seen.push(input));

    tracker.press(60, "kbd:KeyZ", 90);
    replay(tracker, { type: "pedal", source: "kbd:pedal", down: true });
    replay(tracker, press(64));

    expect(seen.map(isPlayback)).toEqual([false, true, true]);
    tracker.releaseAll("play:");
    expect(tracker.getSnapshot()).toEqual({ held: new Set([60]), pedal: false });
    expect(log).toEqual(["on 60", "on 64", "off 64"]);
  });
});

describe("isTake", () => {
  it("rejects malformed stored data", () => {
    expect(isTake({ events: [], duration: 0 })).toBe(true);
    expect(isTake(null)).toBe(false);
    expect(isTake({ events: "x", duration: 1 })).toBe(false);
  });
});
