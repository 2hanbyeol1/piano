import type { ReactNode } from "react";

/** A keycap chip; the border follows the text color so it works on white and black keys. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.4em] justify-center rounded border border-current/40 px-1 font-mono text-[0.65rem] leading-4 font-semibold">
      {children}
    </kbd>
  );
}
