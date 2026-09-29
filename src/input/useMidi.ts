import { useEffect, useState } from "react";
import type { NoteTracker } from "../state/noteTracker";
import { parseMidiMessage } from "./midiMessage";

export type MidiStatus =
  | { kind: "unsupported" }
  | { kind: "pending" }
  | { kind: "denied" }
  | { kind: "ready"; inputs: string[] };

const SOURCE = "midi";

export function useMidi(tracker: NoteTracker, enabled: boolean): MidiStatus {
  const supported = typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
  const [status, setStatus] = useState<MidiStatus>(supported ? { kind: "pending" } : { kind: "unsupported" });

  useEffect(() => {
    if (!enabled || !supported) return;
    let access: MIDIAccess | null = null;
    let cancelled = false;

    const onMessage = (e: MIDIMessageEvent) => {
      if (!e.data) return;
      const event = parseMidiMessage(e.data);
      if (!event) return;
      if (event.type === "noteOn") tracker.press(event.note, SOURCE, event.velocity);
      else if (event.type === "noteOff") tracker.release(event.note, SOURCE);
      else tracker.setPedal(SOURCE, event.down);
    };

    const attach = () => {
      if (!access) return;
      const names: string[] = [];
      access.inputs.forEach((input) => {
        input.onmidimessage = onMessage;
        if (input.state === "connected") names.push(input.name ?? "MIDI 기기");
      });
      setStatus({ kind: "ready", inputs: names });
    };

    navigator
      .requestMIDIAccess()
      .then((result) => {
        if (cancelled) return;
        access = result;
        access.onstatechange = attach;
        attach();
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: "denied" });
      });

    return () => {
      cancelled = true;
      if (!access) return;
      access.onstatechange = null;
      access.inputs.forEach((input) => (input.onmidimessage = null));
      tracker.releaseAll(SOURCE);
      tracker.setPedal(SOURCE, false);
    };
  }, [tracker, enabled, supported]);

  return status;
}
