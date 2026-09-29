import { useRef, type PointerEvent } from "react";
import { FIXED_VELOCITY } from "../input/useComputerKeyboard";
import { isBlack, noteName, type LabelMode } from "../music/notes";
import type { NoteTracker } from "../state/noteTracker";
import { Kbd } from "./Kbd";

interface PianoProps {
  low: number;
  high: number;
  held: ReadonlySet<number>;
  labelMode: LabelMode;
  hints: Map<number, string[]> | null;
  disabled: boolean;
  tracker: NoteTracker;
}

const BLACK_KEY_WIDTH_RATIO = 0.6;

function midiAt(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y);
  const key = el instanceof HTMLElement ? el.closest<HTMLElement>("[data-midi]") : null;
  return key ? Number(key.dataset.midi) : null;
}

export function Piano({ low, high, held, labelMode, hints, disabled, tracker }: PianoProps) {
  const notes = Array.from({ length: high - low + 1 }, (_, i) => low + i);
  const whites = notes.filter((m) => !isBlack(m));
  const whiteWidth = 100 / whites.length;
  const blackWidth = whiteWidth * BLACK_KEY_WIDTH_RATIO;

  // pointerId → note under that pointer (null while dragged off the keys).
  const pointers = useRef(new Map<number, number | null>());

  const track = (e: PointerEvent) => {
    const midi = midiAt(e.clientX, e.clientY);
    const prev = pointers.current.get(e.pointerId) ?? null;
    if (midi === prev) return;
    const source = `ptr:${e.pointerId}`;
    if (prev !== null) tracker.release(prev, source);
    if (midi !== null) tracker.press(midi, source, FIXED_VELOCITY);
    pointers.current.set(e.pointerId, midi);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    // Capture so dragging across keys (glissando) and releasing outside still reach us.
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, null);
    track(e);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (pointers.current.has(e.pointerId)) track(e);
  };

  const onPointerEnd = (e: PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (prev === undefined) return;
    if (prev !== null) tracker.release(prev, `ptr:${e.pointerId}`);
    pointers.current.delete(e.pointerId);
  };

  const label = (midi: number) => (
    <span className="pointer-events-none flex flex-col items-center gap-1 leading-none">
      {hints?.has(midi) && (
        <span className="flex flex-col items-center gap-0.5 opacity-70">
          {hints.get(midi)!.map((hint) => (
            <Kbd key={hint}>{hint}</Kbd>
          ))}
        </span>
      )}
      {labelMode !== "off" && <span className="text-[0.65rem]">{noteName(midi, labelMode)}</span>}
    </span>
  );

  return (
    <div
      className={`relative h-full w-full touch-none select-none ${disabled ? "opacity-50" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      role="group"
      aria-label="피아노 건반"
    >
      <div className="flex h-full">
        {whites.map((midi) => (
          <div
            key={midi}
            data-midi={midi}
            className={`flex flex-1 items-end justify-center rounded-b-md border border-slate-300 pb-2 text-slate-700 transition-colors duration-75 dark:border-slate-700 ${
              held.has(midi) ? "bg-sky-300 dark:bg-sky-400" : "bg-white dark:bg-slate-100"
            }`}
          >
            {label(midi)}
          </div>
        ))}
      </div>
      {notes.filter(isBlack).map((midi) => {
        const whiteIndex = whites.indexOf(midi - 1);
        return (
          <div
            key={midi}
            data-midi={midi}
            className={`absolute top-0 flex h-[62%] items-end justify-center rounded-b-md pb-2 text-white transition-colors duration-75 ${
              held.has(midi) ? "bg-sky-600" : "bg-slate-900 dark:bg-slate-950"
            }`}
            style={{ left: `${(whiteIndex + 1) * whiteWidth - blackWidth / 2}%`, width: `${blackWidth}%` }}
          >
            {label(midi)}
          </div>
        );
      })}
    </div>
  );
}
