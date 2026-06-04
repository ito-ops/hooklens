import type { Industry } from "@/types/domain";
import { createAdminClient } from "@/lib/supabase/admin";
import { collectableIndustries } from "./keywords";
import { collectWinners } from "./collect";
import { transcribeHook } from "./transcribe";
import { distillProfile, type CorpusHook } from "./distill";

export interface RunOptions {
  /** 対象業界（未指定なら設定済みの全業界）。 */
  industries?: Industry[];
  /** 業界ごとに収集する勝ち動画の上限。 */
  perIndustry?: number;
  /** 蒸留に必要な最小フック数。これ未満なら学習プロファイルは更新しない。 */
  minHooksForDistill?: number;
  trigger?: "cron" | "manual";
  /** true の場合 DB に書き込まず統計だけ返す（動作確認用）。 */
  dryRun?: boolean;
}

interface IndustryStat {
  industry: Industry;
  collected: number;
  transcribed: number;
  distilled: boolean;
}

/**
 * コーパス更新パイプライン本体:
 *   収集(Apify) → フック文字起こし(Gemini) → コーパス保存 → 業界別に蒸留 → 学習プロファイル更新
 */
export async function runCorpusRefresh(opts: RunOptions = {}) {
  const industries = opts.industries ?? collectableIndustries();
  const perIndustry = opts.perIndustry ?? 12;
  const minHooks = opts.minHooksForDistill ?? 3;
  const supabase = createAdminClient();

  const { data: run } = await supabase
    .from("pipeline_runs")
    .insert({ trigger: opts.trigger ?? "manual", status: "running" })
    .select("id")
    .single();
  const runId = run?.id as string | undefined;

  const stats: { industries: IndustryStat[] } = { industries: [] };

  try {
    for (const industry of industries) {
      const winners = await collectWinners(industry, perIndustry);
      const hooks: CorpusHook[] = [];

      for (const w of winners) {
        const t = await transcribeHook({ videoUrl: w.videoUrl, caption: w.caption });
        if (!t.hookText) continue;
        hooks.push({
          hookText: t.hookText,
          views: w.views,
          viewsPerFollower: w.viewsPerFollower,
          engagementRate: w.engagementRate,
        });
        if (!opts.dryRun) {
          await supabase.from("hook_corpus").upsert(
            {
              platform: w.platform,
              industry,
              source_url: w.sourceUrl ?? null,
              shortcode: w.shortcode ?? null,
              account: w.account ?? null,
              followers: w.followers ?? null,
              views: w.views ?? null,
              likes: w.likes ?? null,
              comments: w.comments ?? null,
              engagement_rate: w.engagementRate ?? null,
              views_per_follower: w.viewsPerFollower ?? null,
              caption: w.caption ?? null,
              hook_text: t.hookText,
              transcript: t.transcript || null,
              raw: w.raw ?? null,
            },
            { onConflict: "platform,shortcode" },
          );
        }
      }

      let distilled = false;
      if (hooks.length >= minHooks) {
        const profile = await distillProfile(industry, hooks);
        distilled = true;
        if (!opts.dryRun) {
          await supabase.from("industry_profiles").upsert({
            industry,
            pattern_notes: profile.pattern_notes,
            exemplars: profile.exemplars,
            technique_freq: profile.technique_freq,
            sample_size: hooks.length,
            updated_at: new Date().toISOString(),
          });
        }
      }

      stats.industries.push({
        industry,
        collected: winners.length,
        transcribed: hooks.length,
        distilled,
      });
    }

    if (runId && !opts.dryRun) {
      await supabase
        .from("pipeline_runs")
        .update({ status: "success", finished_at: new Date().toISOString(), stats })
        .eq("id", runId);
    }
    return { ok: true, runId, stats };
  } catch (e) {
    if (runId && !opts.dryRun) {
      await supabase
        .from("pipeline_runs")
        .update({ status: "error", finished_at: new Date().toISOString(), error: String(e), stats })
        .eq("id", runId);
    }
    throw e;
  }
}
