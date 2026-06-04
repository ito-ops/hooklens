import { ApifyClient } from "apify-client";
import { apifyEnv } from "@/lib/env";

let _client: ApifyClient | null = null;

export function getApify() {
  if (!_client) {
    _client = new ApifyClient({ token: apifyEnv().APIFY_API_TOKEN });
  }
  return _client;
}

/**
 * Run the Instagram Scraper actor for the given post URLs.
 * Returns dataset items (post metadata + engagement metrics).
 */
export async function scrapeInstagramPosts(urls: string[]) {
  const client = getApify();
  const run = await client.actor(apifyEnv().APIFY_INSTAGRAM_SCRAPER_ACTOR).call({
    directUrls: urls,
    resultsType: "posts",
    resultsLimit: urls.length,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * ハッシュタグ検索で動画投稿を収集する（コーパス収集パイプライン用）。
 * 返り値は actor 依存の生 dataset アイテム配列。フィールド名は collect 層で吸収する。
 */
export async function searchInstagramByHashtag(
  hashtag: string,
  limit = 30,
): Promise<unknown[]> {
  const client = getApify();
  const run = await client.actor(apifyEnv().APIFY_INSTAGRAM_SCRAPER_ACTOR).call({
    search: hashtag,
    searchType: "hashtag",
    resultsType: "posts",
    resultsLimit: limit,
    addParentData: true, // 可能なら投稿者のフォロワー数などを付与
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * 動画 URL をダウンロードしてバイト列を返す（Gemini への文字起こし入力用）。
 * サイズ上限を超える場合は null を返す（呼び出し側でキャプション近似にフォールバック）。
 */
export async function downloadVideo(
  url: string,
  maxBytes = 18 * 1024 * 1024,
): Promise<{ base64: string; mimeType: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const mimeType = res.headers.get("content-type") ?? "video/mp4";
  const lenHeader = res.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > maxBytes) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > maxBytes) return null;
  return { base64: buf.toString("base64"), mimeType };
}
