import type { TransportMode } from "../recording/useRecorder";
import { controlButton } from "./ui";

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
      {/* Left of the buttons, so its changing width never shifts them. */}
      <span className={`text-xs tabular-nums ${recording ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
        {time}
      </span>
      <button
        onClick={recording ? onStop : onRecord}
        disabled={disabled}
        className={`${controlButton} ${recording ? "border-red-500! bg-red-500! text-white!" : ""}`}
        aria-label={recording ? "녹음 정지" : "녹음"}
      >
        <span className={recording ? "animate-pulse" : "text-red-500"}>{recording ? "■" : "●"}</span>
        {recording ? "정지" : "녹음"}
      </button>
      <button
        onClick={playing ? onStop : onPlay}
        disabled={disabled || recording || duration === null}
        className={`${controlButton} ${playing ? "border-sky-500! bg-sky-500! text-white!" : ""}`}
        aria-label={playing ? "재생 정지" : "재생"}
      >
        <span>{playing ? "■" : "▶"}</span>
        {playing ? "정지" : "재생"}
      </button>
    </div>
  );
}
