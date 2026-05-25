import type { Platform } from "@/types/domain";

/**
 * Platform-typical vocabulary signals. Words that resonate well with each
 * platform's audience (rough heuristics from observed viral hooks).
 */
export const PLATFORM_VOCAB: Record<Platform, string[]> = {
  instagram: [
    "おしゃれ",
    "可愛い",
    "映え",
    "プチプラ",
    "コスメ",
    "メイク",
    "ファッション",
    "ライフスタイル",
    "おすすめ",
    "選び方",
    "比較",
  ],
  shorts: [
    "ハック",
    "裏技",
    "解説",
    "まとめ",
    "知らないと",
    "プロが",
    "実は",
    "結論",
    "簡単",
    "1分で",
    "3秒で",
  ],
  tiktok: [
    "やってみた",
    "リアル",
    "本音",
    "暴露",
    "あるある",
    "やばい",
    "ガチ",
    "速報",
    "驚愕",
    "誰でも",
    "簡単",
  ],
};
