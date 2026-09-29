import type { ReactNode } from "react";
import type { MidiStatus } from "../input/useMidi";
import { noteName, type LabelMode } from "../music/notes";
import { fieldLabel, segment, segmentGroup } from "./ui";

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
  { mode: "letter", text: "CDE" },
  { mode: "solfege", text: "도레미" },
  { mode: "off", text: "없음" },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {/* Fixed width on phones, where fields stack, so the controls line up in a column. */}
      <span className={`${fieldLabel} w-10 sm:w-auto`}>{label}</span>
      {children}
    </div>
  );
}

function Status({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <span className={`size-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
      {children}
    </span>
  );
}

function midiText(midi: MidiStatus): { on: boolean; text: string } {
  switch (midi.kind) {
    case "unsupported":
      return { on: false, text: "MIDI 미지원" };
    case "pending":
      return { on: false, text: "MIDI 확인 중" };
    case "denied":
      return { on: false, text: "MIDI 권한 없음" };
    case "ready":
      return midi.inputs.length > 0 ? { on: true, text: midi.inputs.join(", ") } : { on: false, text: "MIDI 미연결" };
  }
}

export function ControlBar(props: ControlBarProps) {
  const midi = midiText(props.midi);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Field label="볼륨">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={props.volume}
          onChange={(e) => props.onVolumeChange(Number(e.target.value))}
          className="h-8 w-24 accent-slate-700 dark:accent-slate-300"
          aria-label="볼륨"
        />
      </Field>

      <Field label="옥타브">
        <div className={segmentGroup}>
          <button className={segment(false)} onClick={() => props.onShiftOctave(-1)} disabled={!props.canShiftDown} aria-label="옥타브 내리기">
            ◀
          </button>
          <span className="flex w-16 items-center justify-center border-x border-slate-300 text-sm tabular-nums dark:border-slate-700">
            {noteName(props.low, "letter")}–{noteName(props.high, "letter")}
          </span>
          <button className={segment(false)} onClick={() => props.onShiftOctave(1)} disabled={!props.canShiftUp} aria-label="옥타브 올리기">
            ▶
          </button>
        </div>
      </Field>

      <Field label="표시">
        <div className={segmentGroup} role="group" aria-label="음이름">
          {LABEL_MODES.map(({ mode, text }) => (
            <button key={mode} onClick={() => props.onLabelModeChange(mode)} className={segment(props.labelMode === mode)}>
              {text}
            </button>
          ))}
        </div>
        <div className={segmentGroup}>
          <button
            onClick={() => props.onShowHintsChange(!props.showHints)}
            className={segment(props.showHints)}
            aria-pressed={props.showHints}
          >
            키 힌트
          </button>
        </div>
      </Field>

      <div className="flex items-center gap-4 sm:ml-auto">
        <Status on={props.pedal}>서스테인</Status>
        <Status on={midi.on}>{midi.text}</Status>
      </div>
    </div>
  );
}
