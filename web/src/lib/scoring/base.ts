import type { BreakdownScores } from "@/types/domain";
import type { FeatureName, FeatureScores, ScoringInput } from "./types";
import { analyzeAllFeatures } from "./features";

/**
 * Feature weights for the rule-based total score.
 * Sums to 1.0. Mirrors the spec in plans/instagram-youtube-tiktok-...md §3.1.
 */
export const FEATURE_WEIGHTS: Record<FeatureName, number> = {
  numbers: 0.1,
  emotion: 0.12,
  question: 0.08,
  paradox: 0.12,
  target: 0.08,
  urgency: 0.06,
  brevity: 0.1,
  benefitPain: 0.1,
  platformFit: 0.08,
  authority: 0.06,
  curiosityGap: 0.1,
};

/**
 * Maps the 11 feature scores onto the 7 user-facing breakdown dimensions.
 * Each row sums to 1.0 across its features.
 */
const BREAKDOWN_MAP: Record<keyof BreakdownScores, Partial<Record<FeatureName, number>>> = {
  impact: { paradox: 0.5, emotion: 0.5 },
  curiosity: { curiosityGap: 0.4, question: 0.3, paradox: 0.3 },
  clarity: { brevity: 0.6, numbers: 0.4 },
  targetFit: { target: 0.7, benefitPain: 0.3 },
  emotion: { emotion: 0.6, urgency: 0.4 },
  specificity: { numbers: 0.5, authority: 0.5 },
  platformFit: { platformFit: 1.0 },
};

export interface BaseLayerResult {
  total: number;
  features: FeatureScores;
  breakdown: BreakdownScores;
  matched: Record<FeatureName, string[]>;
}

/**
 * Calibration: the raw weighted sum tends to sit in 10–50 because most
 * features fire 0 on any given hook. We stretch the range so users see
 * an intuitive 0–100 distribution (validated against curated samples).
 */
function calibrate(raw: number): number {
  return Math.round(Math.max(0, Math.min(100, raw * 1.9)));
}

export function runBaseLayer(input: ScoringInput): BaseLayerResult {
  const results = analyzeAllFeatures(input);

  const features: FeatureScores = {
    numbers: results.numbers.score,
    emotion: results.emotion.score,
    question: results.question.score,
    paradox: results.paradox.score,
    target: results.target.score,
    urgency: results.urgency.score,
    brevity: results.brevity.score,
    benefitPain: results.benefitPain.score,
    platformFit: results.platformFit.score,
    authority: results.authority.score,
    curiosityGap: results.curiosityGap.score,
  };

  const matched = Object.fromEntries(
    (Object.keys(results) as FeatureName[]).map((k) => [k, results[k].matched]),
  ) as Record<FeatureName, string[]>;

  // Weighted total (raw → calibrated)
  const rawTotal = (Object.keys(features) as FeatureName[]).reduce(
    (acc, k) => acc + features[k] * FEATURE_WEIGHTS[k],
    0,
  );
  const total = calibrate(rawTotal);

  // Breakdown (each dim raw → calibrated)
  const breakdown = Object.fromEntries(
    Object.entries(BREAKDOWN_MAP).map(([dim, weights]) => {
      const sum = Object.entries(weights).reduce(
        (acc, [feat, w]) => acc + features[feat as FeatureName] * (w as number),
        0,
      );
      return [dim, calibrate(sum)];
    }),
  ) as unknown as BreakdownScores;

  return { total, features, breakdown, matched };
}
