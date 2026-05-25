import type { Platform } from "@/types/domain";

export interface ScoringInput {
  hookText: string;
  platform: Platform;
  industry: string;
  target?: string;
}

/** Result of a single feature analyzer. */
export interface FeatureResult {
  score: number; // 0..100
  matched: string[]; // tokens/patterns that fired (for debugging)
}

/** Internal feature score bag — keys must match feature names. */
export interface FeatureScores {
  numbers: number;
  emotion: number;
  question: number;
  paradox: number;
  target: number;
  urgency: number;
  brevity: number;
  benefitPain: number;
  platformFit: number;
  authority: number;
  curiosityGap: number;
}

export type FeatureName = keyof FeatureScores;
