import { useEffect, useRef } from "react";
import type { NoteTracker } from "../state/noteTracker";
import { codeToMidi, SUSTAIN_CODE } from "./keyboardMap";

export const FIXED_VELOCITY = 90;
const SOURCE_PREFIX = "kbd:";

function isTextEntry(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement && target.type !== "range" && target.type !== "checkbox")
  );
}

export function useComputerKeyboard(tracker: NoteTracker, enabled: boolean, baseOctave: number) {
  const baseOctaveRef = useRef(baseOctave);
  baseOctaveRef.current = baseOctave;

  useEffect(() => {
    if (!enabled) return;
    // Remember which note each key started, so an octave shift mid-hold still releases it.
    const pressed = new Map<string, number>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTextEntry(e.target)) return;
      const midi = codeToMidi(e.code, baseOctaveRef.current);
      if (midi === undefined && e.code !== SUSTAIN_CODE) return;
      // Stops Space from scrolling or clicking the focused control.
      e.preventDefault();
      if (e.repeat) return;

      if (e.code === SUSTAIN_CODE) tracker.setPedal(SOURCE_PREFIX + "pedal", true);
      else if (midi !== undefined) {
        pressed.set(e.code, midi);
        tracker.press(midi, SOURCE_PREFIX + e.code, FIXED_VELOCITY);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === SUSTAIN_CODE) {
        if (!isTextEntry(e.target)) e.preventDefault();
        tracker.setPedal(SOURCE_PREFIX + "pedal", false);
        return;
      }
      const midi = pressed.get(e.code);
      if (midi === undefined) return;
      pressed.delete(e.code);
      tracker.release(midi, SOURCE_PREFIX + e.code);
    };

    // Key-ups are lost while the window is unfocused, so let go of everything.
    const onBlur = () => {
      pressed.clear();
      tracker.releaseAll(SOURCE_PREFIX);
      tracker.setPedal(SOURCE_PREFIX + "pedal", false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      onBlur();
    };
  }, [tracker, enabled]);
}
