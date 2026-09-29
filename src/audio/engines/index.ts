import { Soundfont, SplendidGrandPiano } from "smplr";
import type { EngineFactory } from "../types";
import { SmplrEngine } from "./smplrEngine";
import { ToneSalamanderEngine } from "./toneSalamanderEngine";

export interface EngineOption {
  id: string;
  label: string;
  create: EngineFactory;
}

/** Candidates being compared by ear; all but the winner get removed afterwards. */
export const ENGINES: EngineOption[] = [
  {
    id: "splendid",
    label: "Splendid Grand (smplr)",
    create: (context) => new SmplrEngine((onLoadProgress) => SplendidGrandPiano(context, { onLoadProgress })),
  },
  {
    id: "salamander",
    label: "Salamander (Tone.js)",
    create: (context) => new ToneSalamanderEngine(context),
  },
  {
    id: "soundfont",
    label: "Soundfont (smplr)",
    create: (context) =>
      new SmplrEngine((onLoadProgress) =>
        Soundfont(context, { instrument: "acoustic_grand_piano", onLoadProgress }),
      ),
  },
];

export const DEFAULT_ENGINE_ID = ENGINES[0].id;
