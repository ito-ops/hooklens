import type { FeatureResult, ScoringInput } from "../types";
import { ALL_EMOTION_WORDS } from "../dictionaries/emotion";
import { BENEFIT_WORDS, PAIN_WORDS } from "../dictionaries/benefit-pain";
import { AUTHORITY_WORDS, AUTHORITY_PATTERNS } from "../dictionaries/authority";
import { URGENCY_WORDS } from "../dictionaries/urgency";
import { PARADOX_PATTERNS } from "../dictionaries/paradox";
import { TARGET_PATTERNS } from "../dictionaries/target";
import { PLATFORM_VOCAB } from "../dictionaries/platform";

/* ------------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------------ */

function matchAny(text: string, words: readonly string[]): string[] {
  return words.filter((w) => text.includes(w));
}

function matchAnyRegex(text: string, patterns: readonly RegExp[]): string[] {
  return patterns.flatMap((p) => {
    const m = text.match(p);
    return m ? [m[0]] : [];
  });
}

/** Saturating scorer: 1 hit ≈ baseScore, additional hits add diminishing returns. */
function saturate(hits: number, baseScore = 60, perHit = 18, max = 100): number {
  if (hits <= 0) return 0;
  return Math.min(max, baseScore + (hits - 1) * perHit);
}

/* ------------------------------------------------------------------------ *
 * Feature 1: 数字/具体性 (Numbers & specificity)
 * ------------------------------------------------------------------------ */
export function scoreNumbers(input: ScoringInput): FeatureResult {
  const matches = input.hookText.match(/\d+(?:\.\d+)?[%％秒分時間日週月年円kKmM]*/g) ?? [];
  // Bonus when numbers appear in first 12 chars (visual hook).
  const earlyBonus = matches.some((m) => input.hookText.indexOf(m) < 12) ? 10 : 0;
  return {
    score: Math.min(100, saturate(matches.length, 55, 18) + earlyBonus),
    matched: matches,
  };
}

/* ------------------------------------------------------------------------ *
 * Feature 2: 感情語 (Emotion)
 * ------------------------------------------------------------------------ */
export function scoreEmotion(input: ScoringInput): FeatureResult {
  const matched = matchAny(input.hookText, ALL_EMOTION_WORDS);
  return { score: saturate(matched.length, 60, 15), matched };
}

/* ------------------------------------------------------------------------ *
 * Feature 3: 疑問形 (Question form)
 * ------------------------------------------------------------------------ */
export function scoreQuestion(input: ScoringInput): FeatureResult {
  const text = input.hookText;
  const matched: string[] = [];
  if (/[？?]/.test(text)) matched.push("？");
  if (/(?:なぜ|どうして|何が|どうやって|どこで|いつ|誰が)/.test(text)) matched.push("疑問詞");
  if (/とは(?:何|？|\?|何\?|何？)?/.test(text)) matched.push("〜とは");
  if (/(?:ですか|でしょうか|ますか)/.test(text)) matched.push("疑問終止");
  return { score: saturate(matched.length, 65, 20), matched };
}

/* ------------------------------------------------------------------------ *
 * Feature 4: 常識破壊/逆説 (Paradox)
 * ------------------------------------------------------------------------ */
export function scoreParadox(input: ScoringInput): FeatureResult {
  const matched = matchAny(input.hookText, PARADOX_PATTERNS);
  // "99%" / "ほとんどの人が" style implicit paradox
  if (/(99%|9[5-9]%|ほとんどの人|大半の人)/.test(input.hookText)) matched.push("マジョリティ否定");
  return { score: saturate(matched.length, 65, 18), matched };
}

/* ------------------------------------------------------------------------ *
 * Feature 5: ターゲット明示 (Target explicit)
 * ------------------------------------------------------------------------ */
export function scoreTarget(input: ScoringInput): FeatureResult {
  const matched = matchAnyRegex(input.hookText, TARGET_PATTERNS);
  return { score: saturate(matched.length, 55, 20), matched };
}

/* ------------------------------------------------------------------------ *
 * Feature 6: 緊急性 (Urgency)
 * ------------------------------------------------------------------------ */
export function scoreUrgency(input: ScoringInput): FeatureResult {
  const matched = matchAny(input.hookText, URGENCY_WORDS);
  return { score: saturate(matched.length, 70, 15), matched };
}

/* ------------------------------------------------------------------------ *
 * Feature 7: 簡潔性 (Brevity)
 *   Optimal length is ~12-30 chars (Japanese). Penalize too long or too short.
 * ------------------------------------------------------------------------ */
export function scoreBrevity(input: ScoringInput): FeatureResult {
  const len = input.hookText.length;
  let score: number;
  if (len < 8) score = 40 + len * 5; // tiny: incomplete hook
  else if (len <= 30) score = 95 - Math.abs(len - 20) * 1.5; // sweet spot ~20
  else if (len <= 50) score = 75 - (len - 30) * 1.0;
  else score = Math.max(20, 55 - (len - 50) * 1.5);
  return { score: Math.round(score), matched: [`${len}文字`] };
}

/* ------------------------------------------------------------------------ *
 * Feature 8: 利得/痛み提示 (Benefit / Pain)
 * ------------------------------------------------------------------------ */
export function scoreBenefitPain(input: ScoringInput): FeatureResult {
  const benefits = matchAny(input.hookText, BENEFIT_WORDS);
  const pains = matchAny(input.hookText, PAIN_WORDS);
  const total = benefits.length + pains.length;
  // Mix bonus: both benefit AND pain = stronger emotional contrast
  const mixBonus = benefits.length > 0 && pains.length > 0 ? 8 : 0;
  return {
    score: Math.min(100, saturate(total, 55, 18) + mixBonus),
    matched: [...benefits.map((w) => `+${w}`), ...pains.map((w) => `-${w}`)],
  };
}

/* ------------------------------------------------------------------------ *
 * Feature 9: プラットフォーム適合 (Platform fit)
 * ------------------------------------------------------------------------ */
export function scorePlatformFit(input: ScoringInput): FeatureResult {
  const vocab = PLATFORM_VOCAB[input.platform];
  const matched = matchAny(input.hookText, vocab);
  // Even with zero matches, give a baseline so penalty isn't too harsh
  return {
    score: matched.length === 0 ? 55 : saturate(matched.length, 75, 12),
    matched,
  };
}

/* ------------------------------------------------------------------------ *
 * Feature 10: 権威性 (Authority)
 * ------------------------------------------------------------------------ */
export function scoreAuthority(input: ScoringInput): FeatureResult {
  const wordMatches = matchAny(input.hookText, AUTHORITY_WORDS);
  const patternMatches = matchAnyRegex(input.hookText, AUTHORITY_PATTERNS);
  const matched = [...wordMatches, ...patternMatches];
  return { score: saturate(matched.length, 65, 18), matched };
}

/* ------------------------------------------------------------------------ *
 * Feature 11: 好奇心ギャップ (Curiosity gap)
 *   "1つの〜" "理由とは" "驚きの方法" 等、続きを匂わす表現
 * ------------------------------------------------------------------------ */
export function scoreCuriosityGap(input: ScoringInput): FeatureResult {
  const text = input.hookText;
  const matched: string[] = [];
  // Number + abstract noun ("1つの〜", "3つの〜", "5つの理由")
  if (/\d+\s*(つの|個の)/.test(text)) matched.push("数+つの〜");
  // "〜の理由" / "〜の方法" / "〜の秘密" patterns at the end
  if (/(理由|方法|コツ|秘密|ヒミツ|ワケ|わけ|裏側|真実)(です|とは|。|$)/.test(text))
    matched.push("〜の理由/方法");
  // "実は〇〇" combined with truncation indicators
  if (/(知らない|教えない|内緒|限定公開|続きは)/.test(text)) matched.push("情報隠し");
  // 倒置や「これ」「あれ」など指示語の不明確性
  if (/(^|[。、]\s*)(これ|あれ|それ)が[一-龯ぁ-んァ-ヶ]/.test(text)) matched.push("指示語ギャップ");

  return { score: saturate(matched.length, 65, 18), matched };
}

/* ------------------------------------------------------------------------ *
 * Aggregate
 * ------------------------------------------------------------------------ */
export function analyzeAllFeatures(input: ScoringInput) {
  return {
    numbers: scoreNumbers(input),
    emotion: scoreEmotion(input),
    question: scoreQuestion(input),
    paradox: scoreParadox(input),
    target: scoreTarget(input),
    urgency: scoreUrgency(input),
    brevity: scoreBrevity(input),
    benefitPain: scoreBenefitPain(input),
    platformFit: scorePlatformFit(input),
    authority: scoreAuthority(input),
    curiosityGap: scoreCuriosityGap(input),
  } satisfies Record<string, FeatureResult>;
}
