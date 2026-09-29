import { SplendidGrandPiano } from "smplr";
import type { EngineFactory } from "../types";
import { SmplrEngine } from "./smplrEngine";

export const createPianoEngine: EngineFactory = (context) =>
  new SmplrEngine((onLoadProgress) => SplendidGrandPiano(context, { onLoadProgress }));
