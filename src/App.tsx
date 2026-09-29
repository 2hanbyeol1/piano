import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { createPianoEngine } from "./audio/engines";
import { useEngine } from "./audio/useEngine";
import { ControlBar } from "./components/ControlBar";
import { Kbd } from "./components/Kbd";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { Metronome } from "./components/Metronome";
import { Piano } from "./components/Piano";
import { StartOverlay } from "./components/StartOverlay";
import { Transport } from "./components/Transport";
import { keyHints } from "./input/keyboardMap";
import { useComputerKeyboard } from "./input/useComputerKeyboard";
import { useMidi } from "./input/useMidi";
import { useMetronome } from "./metronome/useMetronome";
import { clampBaseOctave, keyRange, MIN_BASE_OCTAVE, type LabelMode } from "./music/notes";
import { useRecorder } from "./recording/useRecorder";
import { NoteTracker } from "./state/noteTracker";
import { useMediaQuery } from "./state/useMediaQuery";
import { usePersistentState } from "./state/usePersistentState";

const DEFAULT_BASE_OCTAVE = 3;

export default function App() {
  const [context, setContext] = useState<AudioContext | null>(null);
  const [volume, setVolume] = usePersistentState("piano.volume", 0.8);
  const [labelMode, setLabelMode] = usePersistentState<LabelMode>("piano.labelMode", "letter");
  const [showHints, setShowHints] = usePersistentState("piano.showHints", true);

  const visibleOctaves = useMediaQuery("(max-width: 767px)") ? 2 : 3;
  const [requestedOctave, setRequestedOctave] = useState(DEFAULT_BASE_OCTAVE);
  const baseOctave = clampBaseOctave(requestedOctave, visibleOctaves);
  const { low, high } = keyRange(baseOctave, visibleOctaves);
  const shiftOctave = useCallback(
    (delta: number) => setRequestedOctave((o) => clampBaseOctave(clampBaseOctave(o, visibleOctaves) + delta, visibleOctaves)),
    [visibleOctaves],
  );

  const { engineRef, status } = useEngine(context, createPianoEngine, volume);
  const tracker = useMemo(
    () =>
      new NoteTracker({
        noteOn: (midi, velocity) => engineRef.current?.noteOn(midi, velocity),
        noteOff: (midi) => engineRef.current?.noteOff(midi),
      }),
    [engineRef],
  );
  const { held, pedal } = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot);

  const ready = status.state === "ready";
  useComputerKeyboard(tracker, ready, baseOctave);
  const midi = useMidi(tracker, context !== null);
  const recorder = useRecorder(tracker);

  const [metronomeOn, setMetronomeOn] = useState(false);
  const [bpm, setBpm] = usePersistentState("piano.metronome.bpm", 100);
  const [beatsPerBar, setBeatsPerBar] = usePersistentState("piano.metronome.beatsPerBar", 4);
  const [clickVolume, setClickVolume] = usePersistentState("piano.metronome.volume", 0.5);
  const currentBeat = useMetronome(context, { enabled: metronomeOn, bpm, beatsPerBar, volume: clickVolume });

  const start = () => {
    const ctx = new AudioContext();
    void ctx.resume();
    setContext(ctx);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-5 px-4 py-5 sm:px-8 sm:py-8">
      {!context && <StartOverlay onStart={start} />}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Piano</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Transport
            mode={recorder.mode}
            elapsed={recorder.elapsed}
            duration={recorder.take?.duration ?? null}
            disabled={!ready}
            onRecord={recorder.record}
            onPlay={recorder.play}
            onStop={recorder.stop}
          />
          <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" aria-hidden />
          <Metronome
            enabled={metronomeOn}
            onEnabledChange={setMetronomeOn}
            bpm={bpm}
            onBpmChange={setBpm}
            beatsPerBar={beatsPerBar}
            onBeatsPerBarChange={setBeatsPerBar}
            volume={clickVolume}
            onVolumeChange={setClickVolume}
            currentBeat={currentBeat}
          />
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <ControlBar
          volume={volume}
          onVolumeChange={setVolume}
          low={low}
          high={high}
          onShiftOctave={shiftOctave}
          canShiftDown={baseOctave > MIN_BASE_OCTAVE}
          canShiftUp={clampBaseOctave(baseOctave + 1, visibleOctaves) !== baseOctave}
          labelMode={labelMode}
          onLabelModeChange={setLabelMode}
          showHints={showHints}
          onShowHintsChange={setShowHints}
          pedal={pedal}
          midi={midi}
        />
      </section>

      <main className="relative rounded-xl bg-slate-800 p-2 pt-5 shadow-lg dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
        <div className="h-[clamp(12rem,32vw,20rem)]">
          <Piano
            low={low}
            high={high}
            held={held}
            labelMode={labelMode}
            hints={showHints ? keyHints(baseOctave) : null}
            disabled={!ready}
            tracker={tracker}
          />
        </div>
        <LoadingOverlay status={status} />
      </main>

      <footer className="text-center text-xs text-slate-500 dark:text-slate-400">
        <Kbd>Space</Kbd> 서스테인
      </footer>
    </div>
  );
}
