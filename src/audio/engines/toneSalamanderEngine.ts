import * as Tone from "tone";
import type { InstrumentEngine, ProgressCallback } from "../types";

const BASE_URL = "https://tonejs.github.io/audio/salamander/";

/** Salamander has a sample every minor third (C, D#, F#, A) from A0 to C8. */
function salamanderUrls(): Record<string, string> {
  const urls: Record<string, string> = { A0: "A0.mp3", C8: "C8.mp3" };
  for (let octave = 1; octave <= 7; octave++) {
    for (const note of ["C", "D#", "F#", "A"]) {
      urls[`${note}${octave}`] = `${note.replace("#", "s")}${octave}.mp3`;
    }
  }
  return urls;
}

function toDecibels(volume: number): number {
  return volume <= 0 ? -Infinity : 20 * Math.log10(volume);
}

export class ToneSalamanderEngine implements InstrumentEngine {
  private sampler?: Tone.Sampler;
  private volume = 1;

  constructor(context: AudioContext) {
    if (Tone.getContext().rawContext !== context) Tone.setContext(context);
  }

  load(onProgress?: ProgressCallback): Promise<void> {
    onProgress?.(null);
    return new Promise((resolve, reject) => {
      this.sampler = new Tone.Sampler({
        urls: salamanderUrls(),
        baseUrl: BASE_URL,
        release: 1,
        onload: () => resolve(),
        onerror: reject,
      }).toDestination();
      this.sampler.volume.value = toDecibels(this.volume);
    });
  }

  noteOn(midi: number, velocity: number): void {
    this.sampler?.triggerAttack(Tone.Frequency(midi, "midi").toNote(), Tone.now(), velocity / 127);
  }

  noteOff(midi: number): void {
    this.sampler?.triggerRelease(Tone.Frequency(midi, "midi").toNote(), Tone.now());
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.sampler) this.sampler.volume.value = toDecibels(volume);
  }

  dispose(): void {
    this.sampler?.dispose();
  }
}
