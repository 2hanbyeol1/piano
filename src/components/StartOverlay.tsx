export function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <button
      onClick={onStart}
      className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50/90 backdrop-blur-sm dark:bg-slate-950/90"
    >
      <span className="text-5xl">🎹</span>
      <span className="text-xl font-semibold">클릭해서 시작</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">브라우저 정책상 소리를 내려면 먼저 클릭이 필요해요</span>
    </button>
  );
}
