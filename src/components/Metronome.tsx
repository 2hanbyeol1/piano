import { useRef } from "react";
import { controlButton } from "./ui";
import { BEATS_PER_BAR_OPTIONS, clampBpm, MAX_BPM, MIN_BPM } from "../metronome/schedule";

interface MetronomeProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  beatsPerBar: number;
  onBeatsPerBarChange: (beats: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  currentBeat: number | null;
}

const stepClass =
  "size-9 rounded-full border border-slate-300 text-lg hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800";

function BeatDots({ beatsPerBar, currentBeat, large }: { beatsPerBar: number; currentBeat: number | null; large?: boolean }) {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: beatsPerBar }, (_, beat) => {
        const size = large ? (beat === 0 ? "size-4" : "size-3") : beat === 0 ? "size-2" : "size-1.5";
        return (
          <span
            key={beat}
            className={`rounded-full transition-colors duration-75 ${size} ${
              currentBeat === beat ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          />
        );
      })}
    </span>
  );
}

/** Header button showing metronome status; opens a modal with all settings. */
export function Metronome(props: MetronomeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className={`${controlButton} ${props.enabled ? "border-amber-500! text-amber-600! dark:text-amber-400!" : ""}`}
        aria-haspopup="dialog"
      >
        메트로놈
        {props.enabled && (
          <>
            <span className="tabular-nums">{props.bpm}</span>
            <BeatDots beatsPerBar={props.beatsPerBar} currentBeat={props.currentBeat} />
          </>
        )}
      </button>

      <dialog
        ref={dialogRef}
        // Clicks on the backdrop land on the <dialog> itself; the panel inside stops them.
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-auto w-[min(22rem,calc(100vw-2rem))] rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50 dark:bg-slate-900 dark:text-slate-100"
        aria-label="메트로놈 설정"
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">메트로놈</h2>
            <button
              onClick={() => dialogRef.current?.close()}
              className="rounded-md px-2 py-0.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-5">
              <button className={stepClass} onClick={() => props.onBpmChange(clampBpm(props.bpm - 1))} aria-label="BPM 내리기">
                −
              </button>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-semibold tabular-nums">{props.bpm}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">BPM</span>
              </div>
              <button className={stepClass} onClick={() => props.onBpmChange(clampBpm(props.bpm + 1))} aria-label="BPM 올리기">
                +
              </button>
            </div>
            <input
              type="range"
              min={MIN_BPM}
              max={MAX_BPM}
              value={props.bpm}
              onChange={(e) => props.onBpmChange(clampBpm(Number(e.target.value)))}
              className="w-full accent-amber-500"
              aria-label="BPM"
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500 dark:text-slate-400">박자</span>
            <div className="flex rounded-md border border-slate-300 dark:border-slate-700" role="group" aria-label="박자">
              {BEATS_PER_BAR_OPTIONS.map((beats) => (
                <button
                  key={beats}
                  onClick={() => props.onBeatsPerBarChange(beats)}
                  className={`px-3 py-1 first:rounded-l-md last:rounded-r-md ${
                    props.beatsPerBar === beats ? "bg-amber-500 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {beats}박
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500 dark:text-slate-400">클릭 볼륨</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={props.volume}
              onChange={(e) => props.onVolumeChange(Number(e.target.value))}
              className="w-40 accent-amber-500"
            />
          </label>

          <div className="flex justify-center py-1">
            <BeatDots beatsPerBar={props.beatsPerBar} currentBeat={props.currentBeat} large />
          </div>

          <button
            onClick={() => props.onEnabledChange(!props.enabled)}
            className={`rounded-lg py-2.5 font-medium text-white ${
              props.enabled ? "bg-slate-700 hover:bg-slate-600" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {props.enabled ? "■ 정지" : "▶ 시작"}
          </button>
        </div>
      </dialog>
    </>
  );
}
