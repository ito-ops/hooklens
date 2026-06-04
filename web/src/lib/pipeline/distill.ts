import { z } from "zod";
import { getGeminiModel } from "@/lib/gemini/client";

const distillSchema = z.object({
  pattern_notes: z.string(),
  exemplars: z
    .array(z.object({ hook: z.string(), why: z.string().default("") }))
    .max(10)
    .default([]),
  technique_freq: z.record(z.string(), z.number()).default({}),
});

export type DistilledProfile = z.infer<typeof distillSchema>;

export interface CorpusHook {
  hookText: string;
  views?: number;
  viewsPerFollower?: number;
  engagementRate?: number;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(trimmed);
}

/**
 * 業界の「勝ちフック群」を分析し、学習プロファイル（勝ちパターン＋実例＋テクニック傾向）に蒸留する。
 * これがエンジンの「業界別アルゴリズム」の中身になる。
 */
export async function distillProfile(
  industry: string,
  hooks: CorpusHook[],
): Promise<DistilledProfile> {
  const list = hooks
    .filter((h) => h.hookText.trim())
    .map((h, i) => {
      const vpf = h.viewsPerFollower ? `フォロワー比${h.viewsPerFollower.toFixed(1)}倍` : "";
      const er = h.engagementRate ? `エンゲージ${(h.engagementRate * 100).toFixed(1)}%` : "";
      const metrics = [vpf, er].filter(Boolean).join("/");
      return `${i + 1}. 「${h.hookText}」${metrics ? `（${metrics}）` : ""}`;
    })
    .join("\n");

  const prompt = `以下は「${industry}」ジャンルで、フォロワー数に対して大きく伸びた（=視聴者の手が止まった）ショート動画の、冒頭フックの実データです。

${list}

これらに共通する「勝ちパターン」を分析し、今後このジャンルのフックを採点・生成する際の指針として使えるよう、以下のJSONで返してください:

{
  "pattern_notes": "このジャンルで実際に伸びているフックの共通点・型・語彙・トーンを、採点/生成の指針として3〜6文で具体的に。",
  "exemplars": [{ "hook": "特に代表的な実例フック（原文ママ）", "why": "なぜ伸びたかを一言" }],
  "technique_freq": { "損失回避": 出現数, "数字": 出現数, "問いかけ": 出現数, "自分ごと化": 出現数, "意外性": 出現数 }
}

exemplars は最大8件。technique_freq は観測されたテクニックの概算出現数。`;

  const model = getGeminiModel({ temperature: 0.3 });
  const { response } = await model.generateContent(prompt);
  return distillSchema.parse(extractJson(response.text()));
}
