/**
 * Verification script for the rule-based scoring layer.
 *
 *   npm run verify:scoring
 *
 * Runs `runBaseLayer` against curated good/bad hooks and prints scores so we
 * can sanity-check the heuristics. Requires no API keys — Gemini layer
 * is intentionally not exercised here.
 */
import { runBaseLayer } from "../src/lib/scoring/base";
import type { ScoringInput } from "../src/lib/scoring/types";

type Sample = ScoringInput & { label: "good" | "bad"; note: string };

const SAMPLES: Sample[] = [
  // ----- KNOWN-VIRAL / GOOD HOOKS -----
  {
    label: "good",
    note: "数字+常識破壊+権威",
    hookText: "30代女性の99%が間違ってる、夜のスキンケア。",
    platform: "instagram",
    industry: "beauty",
  },
  {
    label: "good",
    note: "数字+権威+ターゲット",
    hookText: "メイク講師15年でも知らなかった、コスメの正しい順番。",
    platform: "instagram",
    industry: "beauty",
  },
  {
    label: "good",
    note: "感情+ターゲット+ペイン",
    hookText: "副業で月10万稼ぐ会社員が、絶対やらない3つのこと。",
    platform: "shorts",
    industry: "side-business",
  },
  {
    label: "good",
    note: "数字+常識破壊+疑問",
    hookText: "3秒で痩せる方法、実は99%の人が知らない。",
    platform: "shorts",
    industry: "fitness",
  },
  {
    label: "good",
    note: "緊急性+ペイン+権威",
    hookText: "今すぐやめないとヤバい、医師が警告する朝のNG習慣。",
    platform: "tiktok",
    industry: "health",
  },
  {
    label: "good",
    note: "数字+好奇心ギャップ",
    hookText: "プロが選ぶ、絶対に外さないプチプラコスメ5選。",
    platform: "instagram",
    industry: "beauty",
  },
  {
    label: "good",
    note: "驚き+ターゲット明示",
    hookText: "あなたのインスタが伸びない、たった1つの理由。",
    platform: "instagram",
    industry: "marketing",
  },
  {
    label: "good",
    note: "ペイン+疑問+具体",
    hookText: "貯金できない人がやってる、5つのNG習慣とは？",
    platform: "shorts",
    industry: "finance",
  },
  {
    label: "good",
    note: "TikTok向け俗語+常識破壊",
    hookText: "ガチで痩せたい人だけ見て。実は食べる順番が9割。",
    platform: "tiktok",
    industry: "fitness",
  },
  {
    label: "good",
    note: "感情+ターゲット+具体",
    hookText: "30代のあなたへ。今すぐ捨てるべき、効果ゼロのコスメ3つ。",
    platform: "instagram",
    industry: "beauty",
  },

  // ----- LOW-PERFORMING / BAD HOOKS -----
  {
    label: "bad",
    note: "やってみた系・抽象",
    hookText: "コスメレビューやってみた。",
    platform: "instagram",
    industry: "beauty",
  },
  {
    label: "bad",
    note: "まとめ系・受動",
    hookText: "春の新作コスメまとめてみました。",
    platform: "instagram",
    industry: "beauty",
  },
  {
    label: "bad",
    note: "曖昧・行動誘導なし",
    hookText: "今日も一日お疲れさまでした。",
    platform: "shorts",
    industry: "self-improvement",
  },
  {
    label: "bad",
    note: "情報量薄い",
    hookText: "新しい動画をアップしました。",
    platform: "tiktok",
    industry: "other",
  },
  {
    label: "bad",
    note: "宣伝直接・無感情",
    hookText: "弊社の新商品を紹介します。",
    platform: "shorts",
    industry: "marketing",
  },
  {
    label: "bad",
    note: "短すぎ・文脈不明",
    hookText: "見て",
    platform: "tiktok",
    industry: "other",
  },
  {
    label: "bad",
    note: "長すぎ・冗長",
    hookText:
      "本日は皆様にとても素晴らしい商品をご紹介させていただきますので、よろしければ最後までゆっくりとご覧くださいませ。",
    platform: "instagram",
    industry: "other",
  },
  {
    label: "bad",
    note: "事実羅列・興味喚起なし",
    hookText: "気温は今日18度でした。",
    platform: "shorts",
    industry: "other",
  },
  {
    label: "bad",
    note: "あいさつのみ",
    hookText: "こんにちは、皆さん元気ですか？",
    platform: "tiktok",
    industry: "other",
  },
  {
    label: "bad",
    note: "受動・抽象",
    hookText: "撮影してきたので公開します。",
    platform: "instagram",
    industry: "other",
  },
];

/* ------------------------------------------------------------------ */

function bar(score: number, width = 20): string {
  const filled = Math.round((score / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function colored(score: number): string {
  if (score >= 75) return `\x1b[32m${score.toString().padStart(3)}\x1b[0m`;
  if (score >= 55) return `\x1b[33m${score.toString().padStart(3)}\x1b[0m`;
  return `\x1b[31m${score.toString().padStart(3)}\x1b[0m`;
}

function main() {
  console.log("\n========== Tsukami Base-Layer Scoring Verification ==========\n");

  const goodScores: number[] = [];
  const badScores: number[] = [];

  for (const s of SAMPLES) {
    const r = runBaseLayer(s);
    const tag = s.label === "good" ? "\x1b[32mGOOD\x1b[0m" : "\x1b[31mBAD \x1b[0m";
    console.log(`${tag}  ${colored(r.total)}  ${bar(r.total)}  「${s.hookText}」`);
    console.log(`        ${s.note}`);
    const matched = Object.entries(r.matched)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => `${k}=[${v.join(",")}]`)
      .join("  ");
    if (matched) console.log(`        ${matched}`);
    console.log();
    (s.label === "good" ? goodScores : badScores).push(r.total);
  }

  const avg = (a: number[]) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  const goodAvg = avg(goodScores);
  const badAvg = avg(badScores);
  const sep = goodAvg - badAvg;

  console.log("============================================================");
  console.log(`  Good hooks avg: ${colored(goodAvg)}`);
  console.log(`  Bad  hooks avg: ${colored(badAvg)}`);
  console.log(`  Separation    : ${colored(sep)} pts`);
  console.log("============================================================");
  console.log(
    sep >= 20
      ? "\n✅ Healthy separation between good and bad hooks.\n"
      : "\n⚠️  Separation < 20pts — heuristics likely need tuning.\n",
  );
}

main();
