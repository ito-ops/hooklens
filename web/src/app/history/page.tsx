import Link from "next/link";
import { AppShell } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/types/domain";

interface AnalysisRow {
  id: string;
  hookText: string;
  platform: Platform;
  industry: string;
  totalScore: number;
  createdAt: string;
}

const PAGE_SIZE = 50;

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "IG Reels",
  shorts: "Shorts",
  tiktok: "TikTok",
};

const PLATFORM_FILTERS: { value: Platform | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "instagram", label: "IG" },
  { value: "shorts", label: "Shorts" },
  { value: "tiktok", label: "TikTok" },
];

type SearchParams = Promise<{
  platform?: string;
  q?: string;
  sort?: "recent" | "score";
}>;

export default async function HistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const platform = (params.platform ?? "all") as Platform | "all";
  const sort = (params.sort ?? "recent") as "recent" | "score";
  const q = (params.q ?? "").trim();

  const supabase = await createClient();

  let query = supabase
    .from("analyses")
    .select("id, hook_text, platform, industry, total_score, created_at")
    .limit(PAGE_SIZE);

  if (platform !== "all") query = query.eq("platform", platform);
  if (q) query = query.ilike("hook_text", `%${q}%`);
  query =
    sort === "score"
      ? query.order("total_score", { ascending: false })
      : query.order("created_at", { ascending: false });

  const { data, error } = await query;
  const rows: AnalysisRow[] = (data ?? []).map((r) => ({
    id: r.id as string,
    hookText: r.hook_text as string,
    platform: r.platform as Platform,
    industry: r.industry as string,
    totalScore: r.total_score as number,
    createdAt: r.created_at as string,
  }));

  const avgScore =
    rows.length === 0 ? 0 : Math.round(rows.reduce((a, r) => a + r.totalScore, 0) / rows.length);

  return (
    <AppShell active="history" title="分析履歴" subtitle="過去の分析と改善案をすべて確認できます。">
      <div className="grid grid-cols-12 gap-5">
        {/* Filter bar */}
        <section className="surface-card col-span-12 p-5">
          <form className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-violet-50 px-4 py-2.5 ring-1 ring-violet-100 focus-within:ring-2 focus-within:ring-violet-300">
              <svg className="size-4 text-[var(--color-ink-mute)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                name="q"
                defaultValue={q}
                placeholder="フック本文で検索…"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            {/* Platform pills */}
            <div className="inline-flex gap-0.5 rounded-2xl bg-violet-50 p-1">
              {PLATFORM_FILTERS.map((p) => (
                <button
                  key={p.value}
                  type="submit"
                  name="platform"
                  value={p.value}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    p.value === platform
                      ? "bg-white text-[var(--color-primary)] shadow-sm"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-2xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink-soft)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
            >
              <option value="recent">新しい順</option>
              <option value="score">スコア順</option>
            </select>
            <button
              type="submit"
              className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)]"
            >
              絞り込む
            </button>
          </form>
        </section>

        {/* Stats */}
        <section className="surface-card col-span-12 grid grid-cols-3 divide-x divide-violet-100 p-0 sm:col-span-12">
          <StatCell label="総分析数" value={String(rows.length)} unit={rows.length === PAGE_SIZE ? "+" : ""} />
          <StatCell label="平均スコア" value={avgScore ? String(avgScore) : "—"} unit=" / 100" />
          <StatCell
            label="80点以上"
            value={String(rows.filter((r) => r.totalScore >= 80).length)}
            unit=" 本"
          />
        </section>

        {/* Table */}
        <section className="surface-card col-span-12 overflow-hidden p-0">
          {error ? (
            <div className="p-8 text-center text-sm text-rose-600">
              読み込みに失敗しました: {error.message}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-violet-100 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">
                    <th className="px-5 py-3.5">スコア</th>
                    <th className="px-3 py-3.5">フック</th>
                    <th className="px-3 py-3.5">PF</th>
                    <th className="px-3 py-3.5">業界</th>
                    <th className="px-3 py-3.5">日時</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.map((r) => (
                    <Row key={r.id} row={r} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */

function StatCell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="p-5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold tracking-tight text-[var(--color-ink)]">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-[var(--color-ink-mute)]">{unit}</span>}
      </div>
    </div>
  );
}

function Row({ row }: { row: AnalysisRow }) {
  const tone =
    row.totalScore >= 75 ? "high" : row.totalScore >= 55 ? "mid" : "low";
  const toneCls =
    tone === "high"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "mid"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  const createdAt = new Date(row.createdAt);
  const dateStr = `${createdAt.getMonth() + 1}/${createdAt.getDate()} ${createdAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <tr className="border-b border-violet-100/60 transition hover:bg-violet-50/30">
      <td className="px-5 py-3">
        <span className={`grid size-12 place-items-center rounded-xl font-mono text-sm font-bold ${toneCls}`}>
          {row.totalScore}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="line-clamp-2 max-w-md text-sm font-semibold text-[var(--color-ink)]">
          {row.hookText}
        </div>
      </td>
      <td className="px-3 py-3 text-xs font-semibold text-[var(--color-ink-soft)]">
        {PLATFORM_LABELS[row.platform]}
      </td>
      <td className="px-3 py-3 text-xs text-[var(--color-ink-soft)]">{row.industry}</td>
      <td className="px-3 py-3 font-mono text-xs text-[var(--color-ink-mute)]">{dateStr}</td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="px-8 py-16 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-violet-50 text-[var(--color-primary)]">
        <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--color-ink)]">まだ分析履歴がありません</p>
      <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
        最初のフックを分析すると、ここに表示されます
      </p>
      <Link
        href="/analyze"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px"
      >
        分析を開始 →
      </Link>
    </div>
  );
}
