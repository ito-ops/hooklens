import type { AnalysisResult } from "@/types/domain";
import { runBaseLayer, type BaseLayerResult } from "./base";
import { runLlmLayer, type LlmResult } from "./llm";
import { integrate } from "./integrate";
import type { ScoringInput } from "./types";

export type { ScoringInput } from "./types";
export { runBaseLayer } from "./base";

/**
 * End-to-end hook scoring.
 * Runs both the rule-based layer and the LLM layer, then integrates them.
 */
export async function scoreHook(input: ScoringInput): Promise<AnalysisResult> {
  const [base, llm] = await Promise.all([
    Promise.resolve(runBaseLayer(input)),
    runLlmLayer(input),
  ]);
  return integrate({ input, base, llm });
}

/**
 * Base-layer only scoring (useful for tests / offline mode).
 * Returns the rule-based scores without the Gemini round-trip.
 */
export function scoreHookBaseOnly(input: ScoringInput): BaseLayerResult {
  return runBaseLayer(input);
}

export type { LlmResult, BaseLayerResult };
