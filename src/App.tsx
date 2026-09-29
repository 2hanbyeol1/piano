import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { createPianoEngine } from "./audio/engines";
import { useEngine } from "./audio/useEngine";
import { ControlBar } from "./components/ControlBar";
import { Kbd } from "./components/Kbd";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { Piano } from "./components/Piano";
import { StartOverlay } from "./components/StartOverlay";
import { Transport } from "./components/Transport";
import { keyHints } from "./input/keyboardMap";
import { useComputerKeyboard } from "./input/useComputerKeyboard";
import { useMidi } from "./input/useMidi";
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

  const start = () => {
    const ctx = new AudioContext();
    void ctx.resume();
    setContext(ctx);
  };

  return (
    <div className="flex min-h-dvh flex-col gap-6 px-4 py-6 sm:px-8">
      {!context && <StartOverlay onStart={start} />}

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Piano</h1>
          <Transport
            mode={recorder.mode}
            elapsed={recorder.elapsed}
            duration={recorder.take?.duration ?? null}
            disabled={!ready}
            onRecord={recorder.record}
            onPlay={recorder.play}
            onStop={recorder.stop}
          />
        </div>
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
      </header>

      <main className="relative flex flex-1 items-center">
        <div className="h-[45vh] max-h-80 min-h-40 w-full">
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
