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
