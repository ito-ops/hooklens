import type { AnalysisResult, BreakdownScores, ImprovementSuggestion } from "@/types/domain";
import type { BaseLayerResult } from "./base";
import type { LlmResult } from "./llm";
import type { ScoringInput } from "./types";

/** Blend ratio: base layer weight + LLM layer weight should sum to 1.0. */
const BASE_WEIGHT = 0.4;
const LLM_WEIGHT = 0.6;

function blend(base: number, llm: number): number {
  return Math.round(base * BASE_WEIGHT + llm * LLM_WEIGHT);
}

function llmToBreakdown(llm: LlmResult): BreakdownScores {
  return {
    impact: llm.impact,
    curiosity: llm.curiosity,
    clarity: llm.clarity,
    targetFit: llm.target_fit,
    emotion: llm.emotion,
    specificity: llm.specificity,
    platformFit: llm.platform_fit,
  };
}

function blendBreakdown(base: BreakdownScores, llm: BreakdownScores): BreakdownScores {
  const keys: (keyof BreakdownScores)[] = [
    "impact",
    "curiosity",
    "clarity",
    "targetFit",
    "emotion",
    "specificity",
    "platformFit",
  ];
  return Object.fromEntries(
    keys.map((k) => [k, blend(base[k], llm[k])]),
  ) as unknown as BreakdownScores;
}

function totalFromBreakdown(b: BreakdownScores): number {
  const vals = Object.values(b);
  return Math.round(vals.reduce((acc, v) => acc + v, 0) / vals.length);
}

/**
 * Map total score to a predicted growth range vs. industry average.
 * Heuristic until backed by real data (see plan §3.1).
 */
function growthRange(total: number): { min: number; max: number } {
  // 50 ≈ industry avg; deviation maps to ±%
  const delta = (total - 50) / 50; // -1 .. 1
  const center = delta * 60; // ±60% spread
  const halfWidth = 12 + (1 - Math.abs(delta)) * 18; // confidence narrower at extremes
  return {
    min: Math.round(center - halfWidth),
    max: Math.round(center + halfWidth),
  };
}

export function integrate({
  input,
  base,
  llm,
}: {
  input: ScoringInput;
  base: BaseLayerResult;
  llm: LlmResult;
}): AnalysisResult {
  const breakdown = blendBreakdown(base.breakdown, llmToBreakdown(llm));
  const totalScore = totalFromBreakdown(breakdown);
  const { min, max } = growthRange(totalScore);

  const improvements: ImprovementSuggestion[] = llm.improvements.map((i) => ({
    text: i.text,
    appliedTechniques: i.applied_techniques,
    predictedScore: i.predicted_score,
    delta: i.predicted_score - totalScore,
  }));

  return {
    hookText: input.hookText,
    platform: input.platform,
    industry: input.industry as AnalysisResult["industry"],
    target: input.target,
    totalScore,
    growthRangeMin: min,
    growthRangeMax: max,
    breakdown,
    baseScore: base.total,
    llmScore: Math.round(
      ((llm.impact + llm.curiosity + llm.clarity + llm.target_fit + llm.platform_fit + llm.emotion + llm.specificity) /
        7) as number,
    ),
    reasoning: {
      strengths: llm.strengths,
      improvements: llm.improvements_summary,
    },
    improvements,
  };
}
