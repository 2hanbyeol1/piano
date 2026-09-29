const ACCENT_HZ = 1760;
const BEAT_HZ = 1320;
const DECAY_S = 0.05;

/** Schedules one short click at `time` on the audio clock. */
export function scheduleClick(context: AudioContext, time: number, accent: boolean, volume: number): void {
  if (volume <= 0) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.frequency.value = accent ? ACCENT_HZ : BEAT_HZ;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + DECAY_S);
  osc.connect(gain).connect(context.destination);
  osc.start(time);
  osc.stop(time + DECAY_S + 0.01);
}
