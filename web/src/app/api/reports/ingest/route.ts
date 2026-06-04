import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeInstagramPosts } from "@/lib/apify/client";
import { createClient } from "@/lib/supabase/server";
import { scoreHook } from "@/lib/scoring";
import type { Platform } from "@/types/domain";

const requestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(20),
  industry: z.string().default("other"),
});

type ApifyPostItem = {
  url?: string;
  shortCode?: string;
  caption?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: string;
};

/** Extract the "hook" from a caption: first sentence (or first 60 chars). */
function extractHook(caption: string | undefined | null): string {
  if (!caption) return "";
  const cleaned = caption.replace(/\s+/g, " ").trim();
  const firstSentence = cleaned.split(/[。．.!?！？\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length >= 6) {
    return firstSentence.slice(0, 100);
  }
  return cleaned.slice(0, 60);
}

export async function POST(req: Request) {
  /* ---------- Validate ---------- */
  let body;
  try {
    body = requestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request", details: String(e) }, { status: 400 });
  }

  /* ---------- Auth & plan gate ---------- */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();
  if ((profile?.plan ?? "free") === "free") {
    return NextResponse.json(
      { error: "Instagram レポート機能は Pro / Team プランで利用可能です。", code: "plan_required" },
      { status: 402 },
    );
  }

  /* ---------- Scrape via Apify ---------- */
  let items: ApifyPostItem[] = [];
  try {
    const raw = await scrapeInstagramPosts(body.urls);
    items = raw as unknown as ApifyPostItem[];
  } catch (e) {
    console.error("[ingest] Apify failed:", e);
    return NextResponse.json(
      { error: "Apify スクレイピングに失敗しました。", details: String(e) },
      { status: 502 },
    );
  }

  /* ---------- Persist ig_posts & analyze hooks ---------- */
  const hookIds: string[] = [];
  const platform: Platform = "instagram";

  for (const item of items) {
    const hookText = extractHook(item.caption);
    if (!hookText) continue;

    // Save scraped post snapshot
    await supabase.from("ig_posts").insert({
      user_id: user.id,
      instagram_url: item.url ?? "",
      shortcode: item.shortCode ?? null,
      caption: item.caption ?? null,
      hook_extracted: hookText,
      impressions: item.videoPlayCount ?? null,
      likes: item.likesCount ?? null,
      comments: item.commentsCount ?? null,
      posted_at: item.timestamp ?? null,
    });

    // Score the extracted hook (Gemini path; falls back to base if Gemini fails)
    try {
      const result = await scoreHook({
        hookText,
        platform,
        industry: body.industry,
      });
      const { data: ins } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          hook_text: result.hookText,
          platform,
          industry: body.industry,
          total_score: result.totalScore,
          growth_range_min: result.growthRangeMin,
          growth_range_max: result.growthRangeMax,
          breakdown: result.breakdown,
          improvements: result.improvements,
          base_score: result.baseScore,
          llm_score: result.llmScore,
          reasoning: result.reasoning,
        })
        .select("id")
        .single();
      if (ins?.id) hookIds.push(ins.id as string);
    } catch (e) {
      console.warn("[ingest] scoring failed for one item:", e);
    }
  }

  /* ---------- Save report record ---------- */
  const { data: report, error: reportErr } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      type: "performance",
      source_urls: body.urls,
      hook_ids: hookIds,
      summary: {
        post_count: items.length,
        analyzed_count: hookIds.length,
      },
    })
    .select("id")
    .single();

  if (reportErr) {
    return NextResponse.json({ error: reportErr.message }, { status: 500 });
  }

  return NextResponse.json({
    reportId: report?.id ?? null,
    postsFetched: items.length,
    hooksAnalyzed: hookIds.length,
  });
}
