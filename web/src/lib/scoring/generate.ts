import { z } from "zod";
import type { Platform } from "@/types/domain";
import { getGeminiModel } from "@/lib/gemini/client";
import { getEngineProfile } from "@/lib/ai/engine-profile";
import { runBaseLayer } from "./base";

export interface GenerateInput {
  platform: Platform;
  industry: string;
  target?: string;
  /** 動画の台本・内容メモ（あれば精度が上がる） */
  script?: string;
}

export interface GeneratedHook {
  text: string;
  /** 使った訴求テクニック */
  appliedTechniques: string[];
  /** なぜ刺さるかの一言解説 */
  rationale: string;
  /** ルールベース層による客観スコア（0-100） */
  baseScore: number;
  /** LLM の自己予測スコア（0-100） */
  predictedScore: number;
}

const generateResponseSchema = z.object({
  hooks: z
    .array(
      z.object({
        text: z.string().min(1).max(120),
        applied_techniques: z.array(z.string()).default([]),
        rationale: z.string().default(""),
        predicted_score: z.number().min(0).max(100).default(80),
      }),
    )
    .min(1)
    .max(8),
});

const PLATFORM_NAMES: Record<Platform, string> = {
  instagram: "Instagram Reels",
  shorts: "YouTube Shorts",
  tiktok: "TikTok",
};

function buildPrompt(input: GenerateInput, count: number): string {
  const platformName = PLATFORM_NAMES[input.platform];
  return `次の動画に対して、最初の2〜3秒で離脱を防ぐ「フック（つかみ）」を${count}個、互いに切り口を変えて生成してください。
オーディエンス像・効くフックの型はシステム指示に従うこと。

【プラットフォーム】${platformName}
【業界】${input.industry}
${input.target ? `【ターゲット】${input.target}` : "【ターゲット】未指定（業界の一般視聴者を想定）"}
${input.script ? `【動画の台本・内容】\n${input.script}` : "【動画の台本・内容】未指定（業界の一般的な内容を想定）"}

要件:
- 各フックは日本語で自然に、20〜40文字程度を目安に。
- 数字・ターゲット明示・意外性/常識破壊・好奇心ギャップなどの型を能動的に使い分けること。
- 台本の内容と矛盾しない範囲で、最も興味を引く切り口を選ぶこと。

以下のJSONスキーマで返してください:

{
  "hooks": [
    {
      "text": "フック文",
      "applied_techniques": ["使った訴求テクニック（例: 数字, ターゲット明示, 逆説, 好奇心ギャップ）"],
      "rationale": "なぜこの層に刺さるかを1文で",
      "predicted_score": 70〜95程度の予測スコア
    }
  ]
}`;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(fenced);
}

/**
 * 入力（ターゲット・台本・業界・プラットフォーム）からフック候補を生成し、
 * それぞれをルールベース層で即時スコアリングして返す。
 */
export async function generateHooks(
  input: GenerateInput,
  count = 5,
): Promise<GeneratedHook[]> {
  const profile = getEngineProfile(input, "generate");
  const model = getGeminiModel({
    model: profile.model,
    temperature: profile.temperature,
    systemInstruction: profile.systemInstruction,
  });

  const { response } = await model.generateContent(buildPrompt(input, count));
  const parsed = generateResponseSchema.parse(extractJson(response.text()));

  return parsed.hooks.map((h) => {
    const base = runBaseLayer({
      hookText: h.text,
      platform: input.platform,
      industry: input.industry,
      target: input.target,
    });
    return {
      text: h.text,
      appliedTechniques: h.applied_techniques,
      rationale: h.rationale,
      baseScore: base.total,
      predictedScore: h.predicted_score,
    };
  });
}
