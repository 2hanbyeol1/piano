import type { LoadProgress, Smplr } from "smplr";
import type { InstrumentEngine, ProgressCallback } from "../types";

type SmplrCreate = (onLoadProgress: (progress: LoadProgress) => void) => Smplr;

/** Adapts any smplr instrument (SplendidGrandPiano, Soundfont, …) to InstrumentEngine. */
export class SmplrEngine implements InstrumentEngine {
  private onProgress?: ProgressCallback;
  private instrument: Smplr;

  constructor(create: SmplrCreate) {
    this.instrument = create(({ loaded, total }) => this.onProgress?.(total > 0 ? loaded / total : null));
  }

  async load(onProgress?: ProgressCallback): Promise<void> {
    this.onProgress = onProgress;
    onProgress?.(null);
    await this.instrument.ready;
  }

  noteOn(midi: number, velocity: number): void {
    this.instrument.start({ note: midi, velocity, stopId: midi });
  }

  noteOff(midi: number): void {
    this.instrument.stop({ stopId: midi });
  }

  setVolume(volume: number): void {
    this.instrument.output.volume = Math.round(volume * 127);
  }

  dispose(): void {
    this.instrument.dispose();
  }
}
