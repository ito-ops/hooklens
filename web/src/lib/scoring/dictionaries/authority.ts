// Authority / credibility signals — phrases that imply expert backing.

export const AUTHORITY_WORDS = [
  "専門家",
  "プロ",
  "医師",
  "弁護士",
  "コンサル",
  "編集者",
  "研究",
  "論文",
  "実証",
  "証明",
  "データ",
  "統計",
  "ランキング",
  "業界",
  "歴",
  "経験",
  "実績",
  "受賞",
  "認定",
  "公式",
];

// Numeric authority patterns (years, ranks, etc.) detected via regex separately.
export const AUTHORITY_PATTERNS = [
  /(\d+)\s*年[^一-龯]/, // "15年〜"
  /No\.?\s*\d+/i,
  /\d+\s*(冠|連覇|連続|位)/,
];
