import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import type { AnalysisResult, ImprovementSuggestion } from "@/types/domain";
import { scoreHook, scoreHookBaseOnly } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  hookText: z.string().min(1).max(300),
  platform: z.enum(["instagram", "shorts", "tiktok"]),
  industry: z.string().min(1).max(64),
  target: z.string().max(120).optional(),
});

const FREE_DAILY_LIMIT = 5;

export async function POST(req: Request) {
  /* ---------- 1. Validate input ---------- */
  let parsed;
  try {
    parsed = requestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request", details: String(e) }, { status: 400 });
  }

  /* ---------- 2. Auth (optional) ---------- */
  // 匿名アクセス（Supabase の認証 Cookie が無い）では Supabase への往復を
  // 完全にスキップする。公開テストページの匿名利用を高速化し、Supabase が
  // 停止/不通でも分析が即時に動作する。
  const cookieStore = await cookies();
  const hasSession = cookieStore.getAll().some((c) => c.name.startsWith("sb-"));
  const supabase = await createClient();
  const user = hasSession ? (await supabase.auth.getUser()).data.user : null;

  /* ---------- 3. Free-plan daily quota check ---------- */
  if (user) {
    const sinceMidnight = new Date();
    sinceMidnight.setHours(0, 0, 0, 0);

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();
    const plan = profileRow?.plan ?? "free";

    if (plan === "free") {
      const { count } = await supabase
        .from("usage_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "analyze")
        .gte("created_at", sinceMidnight.toISOString());
      if ((count ?? 0) >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: `Free プランの本日分析回数（${FREE_DAILY_LIMIT}回）に達しました。Proへアップグレードしてください。`,
            code: "quota_exceeded",
          },
          { status: 429 },
        );
      }
    }
  }

  /* ---------- 4. Run scoring (Gemini → fallback to base) ---------- */
  const hasGemini = !!process.env.GEMINI_API_KEY;
  let result: AnalysisResult;

  if (hasGemini) {
    try {
      result = await scoreHook(parsed);
    } catch (e) {
      console.error("[/api/analyze] Gemini failed, falling back:", e);
      result = baseOnlyResult(parsed);
    }
  } else {
    result = baseOnlyResult(parsed);
  }

  /* ---------- 5. Persist for logged-in users ---------- */
  if (user) {
    await Promise.all([
      supabase.from("analyses").insert({
        user_id: user.id,
        hook_text: result.hookText,
        platform: result.platform,
        industry: result.industry,
        target: result.target ?? null,
        total_score: result.totalScore,
        growth_range_min: result.growthRangeMin,
        growth_range_max: result.growthRangeMax,
        breakdown: result.breakdown,
        improvements: result.improvements,
        base_score: result.baseScore,
        llm_score: result.llmScore,
        reasoning: result.reasoning,
      }),
      supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "analyze",
        cost_units: 1,
      }),
    ]);
  }

  return NextResponse.json(result);
}

/* ------------------------------------------------------------------ */

function baseOnlyResult(input: z.infer<typeof requestSchema>): AnalysisResult {
  const base = scoreHookBaseOnly(input);
  return {
    hookText: input.hookText,
    platform: input.platform,
    industry: input.industry as AnalysisResult["industry"],
    target: input.target,
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
    improvements: mockImprovements(input.hookText, base.total),
  };
}

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
