import type { Industry } from "@/types/domain";
import { searchInstagramByHashtag } from "@/lib/apify/client";
import { INDUSTRY_KEYWORDS, type IndustryCollectionConfig } from "./keywords";

export interface CorpusCandidate {
  platform: "instagram";
  industry: Industry;
  sourceUrl?: string;
  shortcode?: string;
  account?: string;
  followers?: number;
  views?: number;
  likes?: number;
  comments?: number;
  engagementRate?: number;
  viewsPerFollower?: number;
  caption?: string;
  videoUrl?: string;
  raw: unknown;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && isFinite(v) ? v : undefined;
}

/** Apify アイテムの揺れるフィールド名を吸収して正規化する。 */
function normalize(item: Record<string, unknown>, industry: Industry): CorpusCandidate | null {
  const isVideo =
    item.type === "Video" ||
    item.productType === "clips" ||
    typeof item.videoUrl === "string" ||
    num(item.videoPlayCount) !== undefined;
  if (!isVideo) return null;

  const views =
    num(item.videoPlayCount) ?? num(item.videoViewCount) ?? num(item.playCount) ?? num(item.views);
  const likes = num(item.likesCount) ?? num(item.likes);
  const comments = num(item.commentsCount) ?? num(item.comments);
  const owner = (item.owner ?? {}) as Record<string, unknown>;
  const followers =
    num(item.ownerFollowersCount) ?? num(owner.followersCount) ?? num(item.followersCount);

  const engagementRate =
    views && views > 0 ? ((likes ?? 0) + (comments ?? 0)) / views : undefined;
  const viewsPerFollower = views && followers && followers > 0 ? views / followers : undefined;

  return {
    platform: "instagram",
    industry,
    sourceUrl: typeof item.url === "string" ? item.url : undefined,
    shortcode: (item.shortCode ?? item.shortcode) as string | undefined,
    account: (item.ownerUsername ?? owner.username ?? item.ownerFullName) as string | undefined,
    followers,
    views,
    likes,
    comments,
    engagementRate,
    viewsPerFollower,
    caption: typeof item.caption === "string" ? item.caption : undefined,
    videoUrl: (item.videoUrl ?? item.videoUrlOriginal) as string | undefined,
    raw: item,
  };
}

function passesThresholds(c: CorpusCandidate, t: IndustryCollectionConfig["thresholds"]): boolean {
  if ((c.views ?? 0) < t.minViews) return false;
  if ((c.engagementRate ?? 0) < t.minEngagementRate) return false;
  // フォロワー数が取れた場合のみ viewsPerFollower で絞る（取れない投稿は緩める）。
  if (c.viewsPerFollower !== undefined && c.viewsPerFollower < t.minViewsPerFollower) return false;
  return true;
}

/** 「伸び度」スコア（並べ替え用）。 */
function buzzScore(c: CorpusCandidate): number {
  return (c.viewsPerFollower ?? 1) * (c.engagementRate ?? 0) * Math.log10((c.views ?? 0) + 10);
}

/**
 * 指定業界の「勝ち動画」候補を収集する。
 * 各ハッシュタグを検索 → 正規化 → 閾値フィルタ → 伸び度上位 topN を返す。
 */
export async function collectWinners(industry: Industry, topN = 15): Promise<CorpusCandidate[]> {
  const config = INDUSTRY_KEYWORDS[industry];
  if (!config) return [];

  const seen = new Set<string>();
  const candidates: CorpusCandidate[] = [];

  for (const hashtag of config.hashtags) {
    let items: unknown[] = [];
    try {
      items = await searchInstagramByHashtag(hashtag, 30);
    } catch (e) {
      console.warn(`[collect] hashtag "${hashtag}" failed:`, e);
      continue;
    }
    for (const raw of items) {
      const c = normalize(raw as Record<string, unknown>, industry);
      if (!c) continue;
      const key = c.shortcode ?? c.sourceUrl ?? "";
      if (!key || seen.has(key)) continue;
      if (!passesThresholds(c, config.thresholds)) continue;
      seen.add(key);
      candidates.push(c);
    }
  }

  return candidates.sort((a, b) => buzzScore(b) - buzzScore(a)).slice(0, topN);
}
