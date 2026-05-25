// Emotional trigger words — Japanese
// Categorized by emotion family. Each word contributes to the emotion score.

export const EMOTION_WORDS = {
  surprise: [
    "驚",
    "衝撃",
    "まさか",
    "信じられない",
    "ありえない",
    "唖然",
    "ビビる",
    "ヤバい",
    "やばい",
    "想定外",
  ],
  fear: [
    "怖",
    "危険",
    "リスク",
    "損",
    "失敗",
    "後悔",
    "取り返しのつかない",
    "手遅れ",
    "落とし穴",
    "騙され",
    "詐欺",
  ],
  desire: [
    "欲しい",
    "憧れ",
    "理想",
    "夢",
    "成功",
    "勝つ",
    "稼ぐ",
    "モテる",
    "輝く",
    "羨ましい",
  ],
  empathy: [
    "わかる",
    "共感",
    "あるある",
    "悩み",
    "苦労",
    "つらい",
    "しんどい",
    "頑張",
    "気持ち",
  ],
  joy: ["嬉しい", "楽しい", "幸せ", "ワクワク", "感動", "最高", "素敵"],
} as const;

export const ALL_EMOTION_WORDS = Object.values(EMOTION_WORDS).flat();
