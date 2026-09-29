import { beforeEach, describe, expect, it } from "vitest";
import { NoteTracker } from "./noteTracker";

let log: string[];
let tracker: NoteTracker;

beforeEach(() => {
  log = [];
  tracker = new NoteTracker({
    noteOn: (midi) => log.push(`on ${midi}`),
    noteOff: (midi) => log.push(`off ${midi}`),
  });
});

describe("NoteTracker", () => {
  it("plays and releases a note", () => {
    tracker.press(60, "kbd", 90);
    tracker.release(60, "kbd");
    expect(log).toEqual(["on 60", "off 60"]);
  });

  it("ignores duplicate presses and stray releases from the same source", () => {
    tracker.press(60, "kbd", 90);
    tracker.press(60, "kbd", 90);
    tracker.release(60, "ptr:1");
    expect(log).toEqual(["on 60"]);
  });

  it("keeps a note sounding until every source releases it, re-attacking on each strike", () => {
    tracker.press(60, "kbd", 90);
    tracker.press(60, "midi", 90);
    tracker.release(60, "kbd");
    expect(log).toEqual(["on 60", "off 60", "on 60"]);
    tracker.release(60, "midi");
    expect(log.at(-1)).toBe("off 60");
  });

  it("defers releases while the pedal is down and flushes them on pedal up", () => {
    tracker.setPedal("kbd", true);
    tracker.press(60, "kbd", 90);
    tracker.release(60, "kbd");
    tracker.press(64, "kbd", 90);
    expect(log).toEqual(["on 60", "on 64"]);
    tracker.setPedal("kbd", false);
    // 64 is still held, so only 60 is released.
    expect(log).toEqual(["on 60", "on 64", "off 60"]);
  });

  it("re-attacks a sustained note when struck again", () => {
    tracker.setPedal("kbd", true);
    tracker.press(60, "kbd", 90);
    tracker.release(60, "kbd");
    tracker.press(60, "kbd", 90);
    expect(log).toEqual(["on 60", "off 60", "on 60"]);
    tracker.release(60, "kbd");
    tracker.setPedal("kbd", false);
    expect(log.at(-1)).toBe("off 60");
  });

  it("keeps the pedal down while any pedal source is down", () => {
    tracker.setPedal("kbd", true);
    tracker.setPedal("midi", true);
    tracker.press(60, "kbd", 90);
    tracker.release(60, "kbd");
    tracker.setPedal("kbd", false);
    expect(log).toEqual(["on 60"]);
    expect(tracker.getSnapshot().pedal).toBe(true);
    tracker.setPedal("midi", false);
    expect(log).toEqual(["on 60", "off 60"]);
  });

  it("releases all notes held by a source prefix", () => {
    tracker.press(60, "kbd:KeyA", 90);
    tracker.press(62, "kbd:KeyS", 90);
    tracker.press(64, "midi", 90);
    tracker.releaseAll("kbd:");
    expect([...tracker.getSnapshot().held]).toEqual([64]);
  });

  it("notifies subscribers with a fresh snapshot", () => {
    let calls = 0;
    tracker.subscribe(() => calls++);
    const before = tracker.getSnapshot();
    tracker.press(60, "kbd", 90);
    expect(calls).toBe(1);
    expect(tracker.getSnapshot()).not.toBe(before);
    expect(tracker.getSnapshot().held.has(60)).toBe(true);
  });
});

describe("NoteTracker input events", () => {
  it("reports only inputs that changed state", () => {
    const seen: string[] = [];
    tracker.onInput((input) => seen.push(`${input.type} ${input.source}`));
    tracker.press(60, "kbd", 90);
    tracker.press(60, "kbd", 90);
    tracker.release(60, "midi");
    tracker.setPedal("kbd", true);
    tracker.setPedal("kbd", true);
    tracker.release(60, "kbd");
    expect(seen).toEqual(["press kbd", "pedal kbd", "release kbd"]);
  });

  it("releaseAll also lifts pedals held by matching sources", () => {
    tracker.setPedal("kbd:pedal", true);
    tracker.press(60, "kbd:KeyZ", 90);
    tracker.releaseAll("kbd:");
    expect(log).toEqual(["on 60", "off 60"]);
    expect(tracker.getSnapshot().pedal).toBe(false);
  });
});
