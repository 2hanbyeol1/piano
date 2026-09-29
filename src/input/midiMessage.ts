export type MidiEvent =
  | { type: "noteOn"; note: number; velocity: number }
  | { type: "noteOff"; note: number }
  | { type: "sustain"; down: boolean };

const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const CONTROL_CHANGE = 0xb0;
const SUSTAIN_CC = 64;

/** Parses the channel-voice messages the piano cares about; ignores everything else. */
export function parseMidiMessage(data: ArrayLike<number>): MidiEvent | null {
  if (data.length < 3) return null;
  const command = data[0] & 0xf0;
  const [, a, b] = [data[0], data[1], data[2]];

  if (command === NOTE_ON && b > 0) return { type: "noteOn", note: a, velocity: b };
  // Note-on with velocity 0 is the common running-status form of note-off.
  if (command === NOTE_OFF || command === NOTE_ON) return { type: "noteOff", note: a };
  if (command === CONTROL_CHANGE && a === SUSTAIN_CC) return { type: "sustain", down: b >= 64 };
  return null;
}
