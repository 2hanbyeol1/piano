/** Shared control styles so every button, segment and toggle lines up at the same height. */

export const controlButton =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export const segmentGroup =
  "inline-flex h-8 overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900";

export function segment(active: boolean): string {
  return `px-3 text-sm transition-colors disabled:pointer-events-none disabled:opacity-30 ${
    active
      ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;
}

export const fieldLabel = "text-xs font-medium text-slate-500 dark:text-slate-400";
