import type { Industry } from "@/types/domain";

/**
 * 業界ごとの収集設定。
 * - hashtags: Apify でハッシュタグ検索する語（日本語中心）。
 * - thresholds: 「勝ち動画」と見なす代理指標の下限。
 *   視聴維持率は非公開で取得できないため、公開データから計算できる
 *   viewsPerFollower（フォロワー比の伸び）と engagementRate を使う。
 */
export interface IndustryCollectionConfig {
  hashtags: string[];
  thresholds: {
    minViewsPerFollower: number; // views / followers
    minEngagementRate: number; // (likes + comments) / views
    minViews: number; // 最低再生数（ノイズ除去）
  };
}

const DEFAULT_THRESHOLDS = {
  minViewsPerFollower: 3, // フォロワーの3倍以上再生＝バズ
  minEngagementRate: 0.05, // 5%以上
  minViews: 10000,
};

export const INDUSTRY_KEYWORDS: Partial<Record<Industry, IndustryCollectionConfig>> = {
  "working-holiday": {
    hashtags: ["ワーホリ", "ワーキングホリデー", "ワーホリ準備", "workingholiday"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  "study-abroad": {
    hashtags: ["留学", "留学準備", "語学留学", "海外留学"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  language: {
    hashtags: ["英語学習", "英会話", "英語勉強", "TOEIC"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  travel: {
    hashtags: ["旅行", "海外旅行", "旅行好きな人と繋がりたい", "絶景"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  marketing: {
    hashtags: ["マーケティング", "SNSマーケティング", "集客", "WEBマーケティング"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  "side-business": {
    hashtags: ["副業", "副業初心者", "副業収入", "在宅ワーク"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  finance: {
    hashtags: ["投資", "新NISA", "資産運用", "お金の勉強"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  beauty: {
    hashtags: ["美容", "スキンケア", "コスメ", "垢抜け"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  fitness: {
    hashtags: ["ダイエット", "宅トレ", "筋トレ", "痩せる"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  health: {
    hashtags: ["健康", "睡眠", "腸活", "不調改善"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  food: {
    hashtags: ["時短レシピ", "簡単レシピ", "料理", "作り置き"],
    thresholds: DEFAULT_THRESHOLDS,
  },
  "self-improvement": {
    hashtags: ["自己啓発", "習慣", "朝活", "生産性"],
    thresholds: DEFAULT_THRESHOLDS,
  },
};

/** 収集対象の業界一覧（設定があるものだけ）。 */
export function collectableIndustries(): Industry[] {
  return Object.keys(INDUSTRY_KEYWORDS) as Industry[];
}
