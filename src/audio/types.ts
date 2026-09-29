/** Load progress in 0–1, or null when the engine cannot report it. */
export type ProgressCallback = (progress: number | null) => void;

/**
 * The seam every sound source plugs into. Adding an instrument (violin, etc.)
 * means writing one more implementation of this interface.
 */
export interface InstrumentEngine {
  load(onProgress?: ProgressCallback): Promise<void>;
  /** velocity: 1–127 (MIDI scale). */
  noteOn(midi: number, velocity: number): void;
  noteOff(midi: number): void;
  /** volume: 0–1. May be called before `load` resolves. */
  setVolume(volume: number): void;
  dispose(): void;
}

export type EngineFactory = (context: AudioContext) => InstrumentEngine;
