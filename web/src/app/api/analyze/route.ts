import { NextResponse } from "next/server";
import { z } from "zod";
import type { AnalysisResult, ImprovementSuggestion } from "@/types/domain";
import { scoreHook, scoreHookBaseOnly } from "@/lib/scoring";

const requestSchema = z.object({
  hookText: z.string().min(1).max(300),
  platform: z.enum(["instagram", "shorts", "tiktok"]),
  industry: z.string().min(1).max(64),
  target: z.string().max(120).optional(),
});

/** Mock improvements when the LLM layer is unavailable (e.g. no API key set). */
function mockImprovements(hookText: string, baseScore: number): ImprovementSuggestion[] {
  const candidates: Omit<ImprovementSuggestion, "delta">[] = [
    {
      text: `30代の${hookText}`,
      appliedTechniques: ["ターゲット明示"],
      predictedScore: Math.min(95, baseScore + 11),
    },
    {
      text: `99%が見落としてる、${hookText}`,
      appliedTechniques: ["常識破壊", "マジョリティ否定"],
      predictedScore: Math.min(95, baseScore + 9),
    },
    {
      text: `プロが教える、${hookText}`,
      appliedTechniques: ["権威性"],
      predictedScore: Math.min(95, baseScore + 7),
    },
  ];
  return candidates.map((c) => ({ ...c, delta: c.predictedScore - baseScore }));
}

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = requestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request", details: String(e) }, { status: 400 });
  }

  // If GEMINI_API_KEY is present, use the full pipeline; otherwise fall back
  // to the rule-based layer with mock improvements (UI-first mode).
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (hasGemini) {
    try {
      const result = await scoreHook(parsed);
      return NextResponse.json(result);
    } catch (e) {
      console.error("[/api/analyze] Gemini failed, falling back:", e);
      // fall through to base-only fallback
    }
  }

  const base = scoreHookBaseOnly(parsed);
  const result: AnalysisResult = {
    hookText: parsed.hookText,
    platform: parsed.platform,
    industry: parsed.industry as AnalysisResult["industry"],
    target: parsed.target,
    totalScore: base.total,
    growthRangeMin: Math.round(((base.total - 50) / 50) * 60 - 18),
    growthRangeMax: Math.round(((base.total - 50) / 50) * 60 + 18),
    breakdown: base.breakdown,
    baseScore: base.total,
    llmScore: 0,
    reasoning: {
      strengths: detectedSummary(base.matched),
      improvements: "ターゲットを明示・権威性の追加・常識破壊のフレーズ追加で更に伸ばせます。",
    },
    improvements: mockImprovements(parsed.hookText, base.total),
  };
  return NextResponse.json(result);
}

function detectedSummary(matched: Record<string, string[]>): string {
  const present = Object.entries(matched)
    .filter(([, v]) => v.length > 0)
    .map(([k]) => k);
  if (present.length === 0) return "明確な強みは検出されませんでした。";
  const labels: Record<string, string> = {
    numbers: "具体的な数字",
    emotion: "感情語",
    question: "疑問形",
    paradox: "常識破壊",
    target: "ターゲット明示",
    urgency: "緊急性",
    brevity: "適切な長さ",
    benefitPain: "ベネフィット/ペイン",
    platformFit: "プラットフォーム適合語",
    authority: "権威性",
    curiosityGap: "好奇心ギャップ",
  };
  return (
    present
      .slice(0, 4)
      .map((k) => labels[k] ?? k)
      .join("・") + " が検出されました。"
  );
}
