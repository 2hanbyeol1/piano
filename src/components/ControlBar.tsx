import type { ReactNode } from "react";
import type { MidiStatus } from "../input/useMidi";
import { noteName, type LabelMode } from "../music/notes";

interface ControlBarProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  low: number;
  high: number;
  onShiftOctave: (delta: number) => void;
  canShiftDown: boolean;
  canShiftUp: boolean;
  labelMode: LabelMode;
  onLabelModeChange: (mode: LabelMode) => void;
  showHints: boolean;
  onShowHintsChange: (show: boolean) => void;
  pedal: boolean;
  midi: MidiStatus;
}

const LABEL_MODES: { mode: LabelMode; text: string }[] = [
  { mode: "letter", text: "C D E" },
  { mode: "solfege", text: "도레미" },
  { mode: "off", text: "끄기" },
];

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function Pill({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        on ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {children}
    </span>
  );
}

function midiText(midi: MidiStatus): { on: boolean; text: string } {
  switch (midi.kind) {
    case "unsupported":
      return { on: false, text: "MIDI 미지원 브라우저" };
    case "pending":
      return { on: false, text: "MIDI 확인 중" };
    case "denied":
      return { on: false, text: "MIDI 권한 거부됨" };
    case "ready":
      return midi.inputs.length > 0
        ? { on: true, text: `MIDI: ${midi.inputs.join(", ")}` }
        : { on: false, text: "MIDI 미연결" };
  }
}

const buttonClass =
  "rounded-md px-2 py-1 text-sm hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800";

export function ControlBar(props: ControlBarProps) {
  const midi = midiText(props.midi);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
      <Group label="볼륨">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={props.volume}
          onChange={(e) => props.onVolumeChange(Number(e.target.value))}
          className="w-24 accent-sky-500"
          aria-label="볼륨"
        />
      </Group>

      <Group label="옥타브">
        <button className={buttonClass} onClick={() => props.onShiftOctave(-1)} disabled={!props.canShiftDown} aria-label="옥타브 내리기">
          ◀
        </button>
        <span className="w-16 text-center tabular-nums">
          {noteName(props.low, "letter")}–{noteName(props.high, "letter")}
        </span>
        <button className={buttonClass} onClick={() => props.onShiftOctave(1)} disabled={!props.canShiftUp} aria-label="옥타브 올리기">
          ▶
        </button>
      </Group>

      <Group label="음이름">
        <div className="flex rounded-md border border-slate-300 dark:border-slate-700">
          {LABEL_MODES.map(({ mode, text }) => (
            <button
              key={mode}
              onClick={() => props.onLabelModeChange(mode)}
              className={`px-2 py-1 text-xs first:rounded-l-md last:rounded-r-md ${
                props.labelMode === mode ? "bg-sky-500 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </Group>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <input
          type="checkbox"
          checked={props.showHints}
          onChange={(e) => props.onShowHintsChange(e.target.checked)}
          className="accent-sky-500"
        />
        키 힌트
      </label>

      <div className="flex items-center gap-2">
        <Pill on={props.pedal}>서스테인</Pill>
        <Pill on={midi.on}>{midi.text}</Pill>
      </div>
    </div>
  );
}
