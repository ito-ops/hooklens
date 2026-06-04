import type { Industry } from "@/types/domain";

/**
 * 分析・生成フォームで共有する業界（ジャンル）リスト。
 * `id` は scoring/LLM に渡す内部キー、`label` は表示名。
 * グループ分けは UI の optgroup 用。
 */
export interface IndustryOption {
  id: Industry;
  label: string;
  group: string;
}

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  // 海外・語学（ワーホリ/留学を含む）
  { id: "working-holiday", label: "ワーキングホリデー", group: "海外・語学" },
  { id: "study-abroad", label: "留学", group: "海外・語学" },
  { id: "language", label: "語学・英会話", group: "海外・語学" },
  { id: "travel", label: "旅行・観光", group: "海外・語学" },

  // ビジネス・お金
  { id: "saas", label: "BtoB SaaS", group: "ビジネス・お金" },
  { id: "marketing", label: "マーケティング", group: "ビジネス・お金" },
  { id: "side-business", label: "副業・起業", group: "ビジネス・お金" },
  { id: "finance", label: "投資・金融", group: "ビジネス・お金" },
  { id: "career", label: "キャリア・転職", group: "ビジネス・お金" },

  // 美容・健康
  { id: "beauty", label: "美容・コスメ", group: "美容・健康" },
  { id: "fitness", label: "フィットネス", group: "美容・健康" },
  { id: "health", label: "健康・医療", group: "美容・健康" },
  { id: "fashion", label: "ファッション", group: "美容・健康" },

  // 学び・自己成長
  { id: "education", label: "教育・受験", group: "学び・自己成長" },
  { id: "self-improvement", label: "自己啓発", group: "学び・自己成長" },
  { id: "programming", label: "プログラミング", group: "学び・自己成長" },

  // 暮らし・趣味
  { id: "food", label: "グルメ・料理", group: "暮らし・趣味" },
  { id: "parenting", label: "子育て", group: "暮らし・趣味" },
  { id: "pet", label: "ペット", group: "暮らし・趣味" },
  { id: "other", label: "その他", group: "暮らし・趣味" },
];

/** optgroup 表示用にグループ順を保持したまままとめる。 */
export function groupedIndustries(): { group: string; options: IndustryOption[] }[] {
  const order: string[] = [];
  const map = new Map<string, IndustryOption[]>();
  for (const opt of INDUSTRY_OPTIONS) {
    if (!map.has(opt.group)) {
      map.set(opt.group, []);
      order.push(opt.group);
    }
    map.get(opt.group)!.push(opt);
  }
  return order.map((group) => ({ group, options: map.get(group)! }));
}

export const INDUSTRY_LABELS: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.id, o.label]),
);
