import type { TransportMode } from "../recording/useRecorder";

interface TransportProps {
  mode: TransportMode;
  elapsed: number;
  duration: number | null;
  disabled: boolean;
  onRecord: () => void;
  onPlay: () => void;
  onStop: () => void;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const buttonClass =
  "flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-40";
const idleClass = "border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800";

export function Transport({ mode, elapsed, duration, disabled, onRecord, onPlay, onStop }: TransportProps) {
  const recording = mode === "recording";
  const playing = mode === "playing";

  const time =
    mode === "idle"
      ? duration !== null
        ? formatTime(duration)
        : "녹음 없음"
      : playing && duration !== null
        ? `${formatTime(elapsed)} / ${formatTime(duration)}`
        : formatTime(elapsed);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={recording ? onStop : onRecord}
        disabled={disabled}
        className={`${buttonClass} ${recording ? "border-red-500 bg-red-500 text-white" : idleClass}`}
        aria-label={recording ? "녹음 정지" : "녹음"}
      >
        <span className={recording ? "animate-pulse" : "text-red-500"}>{recording ? "■" : "●"}</span>
        {recording ? "정지" : "녹음"}
      </button>
      <button
        onClick={playing ? onStop : onPlay}
        disabled={disabled || recording || duration === null}
        className={`${buttonClass} ${playing ? "border-sky-500 bg-sky-500 text-white" : idleClass}`}
        aria-label={playing ? "재생 정지" : "재생"}
      >
        <span>{playing ? "■" : "▶"}</span>
        {playing ? "정지" : "재생"}
      </button>
      <span className="min-w-20 text-xs text-slate-500 tabular-nums dark:text-slate-400">{time}</span>
    </div>
  );
}
