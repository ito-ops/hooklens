import Link from "next/link";
import { AppShell } from "@/components/AppNav";
import { loadDashboard, type RecentAnalysis } from "@/lib/dashboard/data";
import type { Platform } from "@/types/domain";

const PLAN_LABEL = { free: "Free", pro: "Pro", team: "Team" } as const;

export default async function DashboardPage() {
  const data = await loadDashboard();
  const greeting = data.profile.companyName ?? "Tsukami";

  const now = new Date();
  const yearMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  const today = now.getDate();

  return (
    <AppShell
      active="dashboard"
      title={`おかえりなさい、${greeting}さん。`}
      subtitle="最初の3秒を、今日も磨いていきましょう。"
      plan={PLAN_LABEL[data.profile.plan]}
    >
      <div className="grid grid-cols-12 gap-5">
        {/* Hero */}
        <section className="relative col-span-12 overflow-hidden rounded-[2rem] gradient-hero p-8 text-white shadow-xl shadow-violet-300/40 lg:col-span-8">
          <div className="absolute -right-10 -top-10 size-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-[var(--color-accent-hot)]/30 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                {PLAN_LABEL[data.profile.plan]} プラン稼働中
              </span>
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                今日のフックを、
                <br />
                <span className="text-white/90">3秒で診断しよう。</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                11の評価観点であなたのコピーを多角採点。
                改善案まで一画面で確認できます。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--color-primary)] shadow-lg shadow-violet-900/20 transition hover:-translate-y-px"
                >
                  + 新しい分析を始める
                </Link>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
                >
                  履歴を見る →
                </Link>
              </div>
            </div>
            <DeskIllustration />
          </div>
        </section>

        {/* Calendar */}
        <section className="surface-card col-span-12 p-6 lg:col-span-4">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">
                {yearMonth}
              </div>
              <div className="mt-1 text-lg font-bold text-[var(--color-ink)]">分析カレンダー</div>
            </div>
          </div>
          <MiniCalendar
            year={now.getFullYear()}
            month={now.getMonth()}
            selected={today}
            activeDays={data.activeDays}
          />
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-violet-50 px-3.5 py-3">
            <div className="grid size-8 place-items-center rounded-xl bg-white text-sm font-bold text-[var(--color-primary)]">
              {today}
            </div>
            <div className="text-xs leading-tight">
              <div className="font-bold text-[var(--color-ink)]">
                今日は{data.stats.todayCount}件分析済み
              </div>
              <div className="text-[var(--color-ink-soft)]">
                平均スコア {data.stats.averageScore || "—"} / 100
              </div>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <StatCard
          label="今月の分析回数"
          value={String(data.stats.monthlyCount)}
          delta={formatDelta(data.stats.monthlyDelta, "件 vs 先月")}
          deltaTone={data.stats.monthlyDelta >= 0 ? "up" : "down"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8" />
              <polyline points="14 7 21 7 21 14" />
            </svg>
          }
        />
        <StatCard
          label="平均スコア"
          value={data.stats.averageScore ? String(data.stats.averageScore) : "—"}
          unit="/ 100"
          delta={
            data.stats.averageDelta === 0
              ? "前月データなし"
              : formatDelta(data.stats.averageDelta, "点 vs 先月")
          }
          deltaTone={data.stats.averageDelta >= 0 ? "up" : "down"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          }
        />
        <StatCard
          label="バズ予測ヒット"
          value={String(data.stats.hitCount)}
          unit="本"
          delta={formatDelta(data.stats.hitDelta, "本 vs 先月")}
          deltaTone={data.stats.hitDelta >= 0 ? "up" : "down"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        />
        <StatCard
          label="今日の分析"
          value={String(data.stats.todayCount)}
          unit="回"
          delta={
            data.profile.plan === "free" ? `本日残り ${Math.max(0, 5 - data.stats.todayCount)} 回` : "無制限"
          }
          deltaTone="neutral"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />

        {/* Recent analyses */}
        <section className="surface-card col-span-12 p-6 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">最近の分析</h3>
              <p className="text-xs text-[var(--color-ink-soft)]">
                直近 {data.recentAnalyses.length} 件のフック
              </p>
            </div>
            <Link href="/history" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              すべて見る →
            </Link>
          </div>
          {data.recentAnalyses.length === 0 ? (
            <EmptyHistory />
          ) : (
            <div className="space-y-2.5">
              {data.recentAnalyses.slice(0, 3).map((h) => (
                <HookRow key={h.id} hook={h} />
              ))}
            </div>
          )}
        </section>

        {/* Quick tips */}
        <section className="surface-card col-span-12 p-6 lg:col-span-4">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[var(--color-ink)]">伸ばすヒント</h3>
            <p className="text-xs text-[var(--color-ink-soft)]">
              スコア80超えに頻出するパターン
            </p>
          </div>
          <ol className="space-y-3">
            {[
              ["1️⃣", "数字で具体性UP", "「3秒で」「99%が」のような数字は視線を止める"],
              ["2️⃣", "常識を破る", "「実は」「意外と」「嘘」で好奇心ギャップ"],
              ["3️⃣", "ターゲットを明示", "「30代女性へ」「副業の人へ」で自分ごと化"],
            ].map(([n, t, b]) => (
              <li key={t} className="flex gap-3">
                <span className="text-base">{n}</span>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">{t}</div>
                  <div className="text-xs leading-relaxed text-[var(--color-ink-soft)]">{b}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Plan upsell (only for free users) */}
        {data.profile.plan === "free" && (
          <section className="relative col-span-12 overflow-hidden rounded-[2rem] gradient-hero p-6 text-white shadow-lg shadow-violet-300/40">
            <div className="absolute -right-8 -bottom-8 size-44 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-lg font-bold leading-snug">
                  Pro なら、分析無制限 + Instagram実績レポート。
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/80">
                  Free は1日5回まで。Pro にすれば履歴・改善案・Instagram連携すべて使えます。
                </p>
              </div>
              <Link
                href="/settings/billing"
                className="inline-flex items-center gap-1 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--color-primary)] shadow-lg shadow-violet-900/20 transition hover:-translate-y-px"
              >
                プランを見る →
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */

function formatDelta(n: number, suffix: string) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n} ${suffix}`;
}

function StatCard({
  label,
  value,
  unit,
  delta,
  deltaTone,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon: React.ReactNode;
}) {
  const toneClass =
    deltaTone === "up"
      ? "text-emerald-600 bg-emerald-50"
      : deltaTone === "down"
        ? "text-rose-600 bg-rose-50"
        : "text-[var(--color-ink-soft)] bg-violet-50";
  return (
    <div className="surface-card col-span-6 p-5 md:col-span-3">
      <div className="flex items-start justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">
          {label}
        </div>
        <div className="grid size-9 place-items-center rounded-xl bg-violet-50 text-[var(--color-primary)]">
          <span className="size-4">{icon}</span>
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold tracking-tight text-[var(--color-ink)]">{value}</span>
        {unit && <span className="text-sm font-semibold text-[var(--color-ink-mute)]">{unit}</span>}
      </div>
      {delta && (
        <div className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${toneClass}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

function HookRow({ hook }: { hook: RecentAnalysis }) {
  const tone = hook.score >= 75 ? "high" : hook.score >= 55 ? "mid" : "low";
  const toneBadge =
    tone === "high"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "mid"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";
  const platformLabel: Record<Platform, string> = {
    instagram: "IG",
    shorts: "Shorts",
    tiktok: "TikTok",
  };
  const time = new Date(hook.createdAt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="group flex items-center gap-4 rounded-2xl bg-violet-50/40 p-3.5 transition hover:bg-white hover:shadow-md hover:shadow-violet-200/40">
      <div className={`grid size-12 shrink-0 place-items-center rounded-2xl font-mono text-sm font-bold ${toneBadge}`}>
        {hook.score}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[var(--color-ink)]">{hook.hookText}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-ink-mute)]">
          <span className="rounded-md bg-white px-1.5 py-0.5 font-semibold text-[var(--color-ink-soft)]">
            {platformLabel[hook.platform]}
          </span>
          <span>·</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-8 text-center">
      <p className="text-sm text-[var(--color-ink-soft)]">
        まだ分析履歴がありません。最初のフックを分析してみましょう。
      </p>
      <Link
        href="/analyze"
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-[var(--color-primary)] shadow-sm ring-1 ring-violet-100 transition hover:bg-violet-50"
      >
        分析を開始 →
      </Link>
    </div>
  );
}

function MiniCalendar({
  year,
  month,
  selected,
  activeDays,
}: {
  year: number;
  month: number;
  selected: number;
  activeDays: number[];
}) {
  const firstOffset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const active = new Set(activeDays);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="aspect-square" />;
          const isSelected = d === selected;
          const isActive = active.has(d);
          return (
            <div key={i} className="grid aspect-square place-items-center">
              <div
                className={`relative grid size-8 place-items-center rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-violet-300/60"
                    : isActive
                      ? "bg-violet-50 text-[var(--color-primary)]"
                      : "text-[var(--color-ink-soft)] hover:bg-violet-50"
                }`}
              >
                {d}
                {isActive && !isSelected && (
                  <span className="absolute -bottom-0.5 size-1 rounded-full bg-[var(--color-primary)]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeskIllustration() {
  return (
    <div className="relative hidden h-44 w-56 shrink-0 md:block">
      <div className="absolute right-2 top-2 size-32 rounded-3xl bg-white/15 backdrop-blur" />
      <div className="absolute right-6 top-6 size-24 rounded-2xl bg-white/25" />
      <div className="absolute right-10 top-10 size-16 rounded-xl bg-white/40" />
      <div className="absolute bottom-2 right-4 h-32 w-20 rounded-2xl bg-[var(--color-ink)]/80 p-1.5 shadow-2xl">
        <div className="h-full w-full rounded-xl bg-gradient-to-br from-violet-200 to-pink-200 p-2 text-[8px] font-bold text-[var(--color-ink)]">
          <div className="rounded-md bg-white/80 px-1.5 py-0.5">▶ Reels</div>
          <div className="mt-1 font-mono text-[18px] leading-none text-[var(--color-primary-dark)]">82</div>
          <div className="mt-0.5 text-[7px] text-[var(--color-ink-soft)]">/ 100</div>
        </div>
      </div>
      <div className="absolute left-0 top-8 flex items-center gap-0.5 rounded-xl bg-white px-2 py-1 shadow-lg">
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="size-3 text-[var(--color-accent-hot)]">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <div className="absolute bottom-6 left-0 grid size-12 place-items-center rounded-2xl bg-white text-[var(--color-primary)] shadow-lg">
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
    </div>
  );
}
