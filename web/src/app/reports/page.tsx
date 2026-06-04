import Link from "next/link";
import { AppShell } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";

interface ReportRow {
  id: string;
  type: string;
  sourceUrls: string[];
  hookCount: number;
  postCount: number;
  createdAt: string;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();
  const isPro = (profile?.plan ?? "free") !== "free";

  const { data: rows } = await supabase
    .from("reports")
    .select("id, type, source_urls, hook_ids, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const reports: ReportRow[] = (rows ?? []).map((r) => {
    const summary = (r.summary ?? {}) as { post_count?: number; analyzed_count?: number };
    return {
      id: r.id as string,
      type: r.type as string,
      sourceUrls: (r.source_urls as string[]) ?? [],
      hookCount: (r.hook_ids as string[])?.length ?? summary.analyzed_count ?? 0,
      postCount: summary.post_count ?? 0,
      createdAt: r.created_at as string,
    };
  });

  return (
    <AppShell
      active="reports"
      title="Instagram レポート"
      subtitle="過去フック × 実績データを掛け合わせた分析レポート。"
      plan={isPro ? "Pro" : "Free"}
    >
      <div className="grid grid-cols-12 gap-5">
        {/* CTA / Upsell */}
        {!isPro ? (
          <section className="relative col-span-12 overflow-hidden rounded-[2rem] gradient-hero p-8 text-white shadow-xl shadow-violet-300/40">
            <div className="absolute -right-10 -top-10 size-60 rounded-full bg-white/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                Instagram の実績データから、
                <br />
                次に作るべきフックを発掘。
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Pro プランで、過去投稿のURLと実績を Apify で自動取り込み。
                スコア × 再生数の相関から「伸びるフックの型」を抽出します。
              </p>
              <Link
                href="/settings/billing"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--color-primary)] shadow-lg shadow-violet-900/20 transition hover:-translate-y-px"
              >
                Pro にアップグレード →
              </Link>
            </div>
          </section>
        ) : (
          <section className="surface-card col-span-12 flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <div className="text-base font-bold text-[var(--color-ink)]">過去フックを取り込む</div>
              <div className="text-xs text-[var(--color-ink-soft)]">
                Instagram の投稿URLを貼り付けると、自動でフックを抽出＆スコア化します。
              </div>
            </div>
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px"
            >
              + 新規レポート
            </Link>
          </section>
        )}

        {/* List */}
        <section className="surface-card col-span-12 p-0">
          {reports.length === 0 ? (
            <EmptyState isPro={isPro} />
          ) : (
            <ul className="divide-y divide-violet-100">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center gap-4 p-5 transition hover:bg-violet-50/30">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-[var(--color-primary)]">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="M7 14l3-3 3 3 5-6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[var(--color-ink)]">
                      {r.type === "performance" ? "パフォーマンスレポート" : "競合分析"}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                      {r.postCount} 投稿 / {r.hookCount} フック分析　·
                      {new Date(r.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function EmptyState({ isPro }: { isPro: boolean }) {
  return (
    <div className="px-8 py-16 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-violet-50 text-[var(--color-primary)]">
        <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 14l3-3 3 3 5-6" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--color-ink)]">レポートはまだありません</p>
      <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
        {isPro
          ? "Instagram の投稿URLからレポートを作成しましょう"
          : "Pro プランにアップグレードすると、Instagram実績レポートが利用できます"}
      </p>
      <Link
        href={isPro ? "/reports/new" : "/settings/billing"}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px"
      >
        {isPro ? "新規レポート →" : "プランを見る →"}
      </Link>
    </div>
  );
}
