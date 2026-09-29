export interface NoteOutput {
  noteOn(midi: number, velocity: number): void;
  noteOff(midi: number): void;
}

export interface TrackerSnapshot {
  /** Notes physically held down by at least one input source. */
  held: ReadonlySet<number>;
  pedal: boolean;
}

/**
 * Merges every input (pointer, computer keyboard, MIDI) into one stream of
 * note-on/off calls. A note keeps sounding while any source holds it, and
 * releases are deferred while any sustain source is down.
 */
export class NoteTracker {
  private holders = new Map<number, Set<string>>();
  private sustained = new Set<number>();
  private pedalSources = new Set<string>();
  private listeners = new Set<() => void>();
  private snapshot: TrackerSnapshot = { held: new Set(), pedal: false };

  constructor(private output: NoteOutput) {}

  press(midi: number, source: string, velocity: number): void {
    const holders = this.holders.get(midi) ?? new Set<string>();
    if (holders.has(source)) return;
    // Striking a note that is still ringing re-attacks it, like a real piano.
    if (holders.size > 0 || this.sustained.has(midi)) this.output.noteOff(midi);
    this.sustained.delete(midi);
    holders.add(source);
    this.holders.set(midi, holders);
    this.output.noteOn(midi, velocity);
    this.emit();
  }

  release(midi: number, source: string): void {
    const holders = this.holders.get(midi);
    if (!holders?.delete(source)) return;
    if (holders.size === 0) {
      this.holders.delete(midi);
      if (this.pedalSources.size > 0) this.sustained.add(midi);
      else this.output.noteOff(midi);
    }
    this.emit();
  }

  /** Releases every note held by sources whose id starts with `prefix`. */
  releaseAll(prefix: string): void {
    for (const [midi, holders] of [...this.holders]) {
      for (const source of [...holders]) {
        if (source.startsWith(prefix)) this.release(midi, source);
      }
    }
  }

  setPedal(source: string, down: boolean): void {
    const wasDown = this.pedalSources.size > 0;
    if (down) this.pedalSources.add(source);
    else this.pedalSources.delete(source);
    const isDown = this.pedalSources.size > 0;
    if (wasDown === isDown) return;
    if (!isDown) {
      for (const midi of this.sustained) this.output.noteOff(midi);
      this.sustained.clear();
    }
    this.emit();
  }

  getSnapshot = (): TrackerSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    this.snapshot = { held: new Set(this.holders.keys()), pedal: this.pedalSources.size > 0 };
    for (const listener of this.listeners) listener();
  }
}
