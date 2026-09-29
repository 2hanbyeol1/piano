import { useEffect, useState } from "react";

/** useState mirrored to localStorage; falls back silently when storage is unavailable. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private mode or blocked storage: settings just won't persist.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
