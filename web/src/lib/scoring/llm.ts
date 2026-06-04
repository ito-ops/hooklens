import { z } from "zod";
import { getGeminiModel } from "@/lib/gemini/client";
import { getEngineProfile } from "@/lib/ai/engine-profile";
import type { ScoringInput } from "./types";

const llmResponseSchema = z.object({
  impact: z.number().min(0).max(100),
  curiosity: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  target_fit: z.number().min(0).max(100),
  platform_fit: z.number().min(0).max(100),
  emotion: z.number().min(0).max(100),
  specificity: z.number().min(0).max(100),
  strengths: z.string(),
  improvements_summary: z.string(),
  improvements: z
    .array(
      z.object({
        text: z.string(),
        applied_techniques: z.array(z.string()),
        predicted_score: z.number().min(0).max(100),
      }),
    )
    .min(1)
    .max(5),
});

export type LlmResult = z.infer<typeof llmResponseSchema>;

const PLATFORM_NAMES = {
  instagram: "Instagram Reels",
  shorts: "YouTube Shorts",
  tiktok: "TikTok",
} as const;

function buildPrompt(input: ScoringInput): string {
  const platformName = PLATFORM_NAMES[input.platform];
  return `以下のフックを評価し、改善案を3〜5パターン提示してください。
評価観点・オーディエンス像はシステム指示に従うこと。

【フック】「${input.hookText}」
【プラットフォーム】${platformName}
【業界】${input.industry}
${input.target ? `【ターゲット】${input.target}` : ""}

以下のJSONスキーマで返してください。すべての数値は0〜100の整数:

{
  "impact": インパクト・意外性 (0-100),
  "curiosity": 好奇心喚起 (0-100),
  "clarity": 明確さ (0-100),
  "target_fit": ターゲット適合 (0-100),
  "platform_fit": プラットフォーム適合 (0-100),
  "emotion": 感情強度 (0-100),
  "specificity": 具体性 (0-100),
  "strengths": "強みを1〜2文で",
  "improvements_summary": "改善余地を1〜2文で",
  "improvements": [
    {
      "text": "改善版のフック文（〜50文字推奨）",
      "applied_techniques": ["適用したテクニック名（例: 数字追加, ターゲット明示, 権威性）"],
      "predicted_score": 70〜95程度の予測スコア
    }
  ]
}`;
}

/** Strip optional markdown fences and parse the response as JSON. */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(fenced);
}

export async function runLlmLayer(input: ScoringInput): Promise<LlmResult> {
  // 入力（プラットフォーム/業界/ターゲット）に合わせてエンジンを最適化。
  const profile = getEngineProfile(input, "analyze");
  const model = getGeminiModel({
    model: profile.model,
    temperature: profile.temperature,
    systemInstruction: profile.systemInstruction,
  });
  const { response } = await model.generateContent(buildPrompt(input));
  const text = response.text();
  const parsed = llmResponseSchema.parse(extractJson(text));
  return parsed;
}
