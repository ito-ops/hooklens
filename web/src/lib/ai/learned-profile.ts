import { createAdminClient } from "@/lib/supabase/admin";

export interface LearnedProfile {
  industry: string;
  patternNotes: string;
  exemplars: { hook: string; why?: string }[];
  sampleSize: number;
  updatedAt: string;
}

// 業界ごとの学習プロファイルの軽量キャッシュ（warm instance 内で有効, TTL 5分）。
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { value: LearnedProfile | null; at: number }>();

/**
 * industry_profiles から業界の学習プロファイルを読み込む。
 * - Supabase 未設定/不通/該当なしの場合は null（呼び出し側で静的プロファイルにフォールバック）。
 * - 失敗してもスローしない（採点・生成を止めない）。
 */
export async function loadLearnedProfile(industry: string): Promise<LearnedProfile | null> {
  const cached = cache.get(industry);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  let value: LearnedProfile | null = null;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("industry_profiles")
        .select("industry, pattern_notes, exemplars, sample_size, updated_at")
        .eq("industry", industry)
        .maybeSingle();
      if (data && data.pattern_notes) {
        value = {
          industry: data.industry as string,
          patternNotes: data.pattern_notes as string,
          exemplars: (data.exemplars as { hook: string; why?: string }[] | null) ?? [],
          sampleSize: (data.sample_size as number | null) ?? 0,
          updatedAt: data.updated_at as string,
        };
      }
    } catch (e) {
      console.warn(`[learned-profile] load failed for "${industry}":`, e);
    }
  }

  cache.set(industry, { value, at: Date.now() });
  return value;
}

/** 学習プロファイルを system instruction に差し込むテキスト断片を作る。 */
export function learnedProfileToPromptBlock(p: LearnedProfile): string {
  const exemplars = p.exemplars
    .slice(0, 8)
    .map((e) => `- 「${e.hook}」${e.why ? `（${e.why}）` : ""}`)
    .join("\n");
  return [
    `【実データから学習した勝ちパターン（${p.sampleSize}件の伸びた動画より）】`,
    p.patternNotes,
    exemplars ? `【実際に伸びたフック例】\n${exemplars}` : "",
    "上記は実際に伸びた動画の傾向です。採点・生成ではこの傾向を強く参考にすること。",
  ]
    .filter(Boolean)
    .join("\n");
}
