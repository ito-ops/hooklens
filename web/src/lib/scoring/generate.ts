import { z } from "zod";
import type { Platform } from "@/types/domain";
import { getGeminiModel } from "@/lib/gemini/client";
import { getEngineProfileWithLearning } from "@/lib/ai/engine-profile";
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
  /** 表示用の推定スコア（分析と同じ ルール0.4 + AI0.6 のブレンド, 0-100） */
  score: number;
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
  return `次の動画の「リール本編の冒頭2〜3秒で、演者が実際に口に出す／字幕で大きく出す“最初のひとこと”」を${count}個、互いに切り口を変えて生成してください。
これは動画のタイトルでもサムネ文言でもありません。視聴者がスクロールを止めて続きを見たくなる、話し言葉の一文です。

【プラットフォーム】${platformName}
【業界】${input.industry}
${input.target ? `【ターゲット】${input.target}` : "【ターゲット】未指定（業界の一般視聴者を想定）"}
${input.script ? `【動画の台本・内容】\n${input.script}` : "【動画の台本・内容】未指定（業界の一般的な内容を想定）"}

【絶対ルール】
- タイトル/見出し調にしない。「【衝撃】」「【必見】」などの装飾カッコ、ニュース見出し、体言止めの羅列はNG。
- 実際に声に出して自然な「話し言葉」にする。視聴者ひとりに語りかけるトーン。
- 15〜35文字程度の一文を基本に。

【積極的に使う心理トリガー（候補ごとに使い分ける）】
- 損失回避: 「知らないと損」「9割が見逃してる」「今のままだと〇〇を逃す」など、放置するリスクを突く。
- 感情: 不安・驚き・悔しさ・共感など、感情が動く言葉を入れる。
- 自分ごと化: ターゲットに直接呼びかける（例:「〇〇な人、ちょっと待ってください」）。
- 問いかけ / 共感 / 意外性 も適宜。

【良い例（話し言葉のフック）】
- 「営業リスト、まだ手作業で作ってます？それ、毎月◯時間損してます。」
- 「正直これ知らずに外注してる人、お金捨ててると思います。」
- 「“リスト作りに3日”…そんな時代、もう終わりました。」
【悪い例（タイトル調・NG）】
- 「【衝撃】営業リスト100件がAIでたった10分で完成」
- 「AIで自動リード獲得｜外注不要の新時代」

台本の内容と矛盾しない範囲で、最も離脱を防げる切り口を選ぶこと。

以下のJSONスキーマで返してください:

{
  "hooks": [
    {
      "text": "話し言葉のフック一文",
      "applied_techniques": ["使った心理トリガー（例: 損失回避, 感情, 自分ごと化, 問いかけ, 意外性）"],
      "rationale": "なぜこの層の手が止まるかを1文で",
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
  const profile = await getEngineProfileWithLearning(input, "generate");
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
    // 分析画面と同じ ルール0.4 + AI0.6 のブレンドで表示スコアを算出し、
    // 体験を揃える（ルールベース単独だと辛すぎるため）。
    const score = Math.round(base.total * 0.4 + h.predicted_score * 0.6);
    return {
      text: h.text,
      appliedTechniques: h.applied_techniques,
      rationale: h.rationale,
      score,
      baseScore: base.total,
      predictedScore: h.predicted_score,
    };
  });
}
