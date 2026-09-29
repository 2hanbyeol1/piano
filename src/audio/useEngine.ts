import { useEffect, useRef, useState } from "react";
import type { EngineFactory, InstrumentEngine } from "./types";

export type EngineStatus =
  | { state: "idle" }
  | { state: "loading"; progress: number | null }
  | { state: "ready" }
  | { state: "error"; message: string };

/**
 * Creates and loads an engine; `engineRef` is only set once it is ready to play.
 * `create` must be stable (e.g. module-level), since changing it reloads the engine.
 */
export function useEngine(context: AudioContext | null, create: EngineFactory, volume: number) {
  const engineRef = useRef<InstrumentEngine | null>(null);
  const volumeRef = useRef(volume);
  const [status, setStatus] = useState<EngineStatus>({ state: "idle" });

  useEffect(() => {
    volumeRef.current = volume;
    engineRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!context) return;
    const engine = create(context);
    let cancelled = false;

    engine.setVolume(volumeRef.current);
    setStatus({ state: "loading", progress: null });
    engine
      .load((progress) => {
        if (!cancelled) setStatus({ state: "loading", progress });
      })
      .then(() => {
        if (cancelled) return;
        engine.setVolume(volumeRef.current);
        engineRef.current = engine;
        setStatus({ state: "ready" });
      })
      .catch((error: unknown) => {
        if (!cancelled) setStatus({ state: "error", message: String(error) });
      });

    return () => {
      cancelled = true;
      if (engineRef.current === engine) engineRef.current = null;
      engine.dispose();
    };
  }, [context, create]);

  return { engineRef, status };
}
