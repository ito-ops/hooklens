// =============================================
// Tsukami — Domain types
// =============================================

export type Platform = "instagram" | "shorts" | "tiktok";
export type Plan = "free" | "pro" | "team";

export type Industry =
  | "beauty"
  | "fitness"
  | "fashion"
  | "food"
  | "travel"
  | "saas"
  | "marketing"
  | "side-business"
  | "finance"
  | "career"
  | "education"
  | "language"
  | "programming"
  | "self-improvement"
  | "comedy"
  | "gaming"
  | "music"
  | "anime"
  | "movie"
  | "parenting"
  | "pet"
  | "diy"
  | "health"
  | "sports"
  | "other";

export interface BreakdownScores {
  impact: number;
  curiosity: number;
  clarity: number;
  targetFit: number;
  emotion: number;
  specificity: number;
  platformFit: number;
}

export interface ImprovementSuggestion {
  text: string;
  appliedTechniques: string[];
  predictedScore: number;
  delta: number;
}

export interface AnalysisResult {
  hookText: string;
  platform: Platform;
  industry: Industry;
  target?: string;
  totalScore: number;
  growthRangeMin: number;
  growthRangeMax: number;
  breakdown: BreakdownScores;
  baseScore: number;
  llmScore: number;
  reasoning: {
    strengths: string;
    improvements: string;
  };
  improvements: ImprovementSuggestion[];
}

export interface Profile {
  id: string;
  userId: string;
  companyName?: string;
  creatorName?: string;
  primaryPlatforms: Platform[];
  industries: Industry[];
  referenceUrls: string[];
  toneNote?: string;
}
