import type { EngineStatus } from "../audio/useEngine";

export function LoadingOverlay({ status }: { status: EngineStatus }) {
  if (status.state !== "loading" && status.state !== "error") return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto flex w-64 flex-col gap-2 rounded-lg bg-white/95 p-4 text-sm shadow-lg dark:bg-slate-900/95">
        {status.state === "loading" ? (
          <>
            <span>
              샘플 불러오는 중{status.progress !== null && ` ${Math.round(status.progress * 100)}%`}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full bg-sky-500 transition-[width] ${status.progress === null ? "w-1/3 animate-pulse" : ""}`}
                style={status.progress === null ? undefined : { width: `${status.progress * 100}%` }}
              />
            </div>
          </>
        ) : (
          <span className="text-red-600 dark:text-red-400">샘플을 불러오지 못했어요: {status.message}</span>
        )}
      </div>
    </div>
  );
}
