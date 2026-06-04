"use client";

import Image from "next/image";
import { useState } from "react";
import type { AnalysisResult, BreakdownScores, Platform } from "@/types/domain";

const PLATFORMS: { id: Platform; label: string; img: string }[] = [
  { id: "instagram", label: "IG", img: "/brand/instagram.png" },
  { id: "shorts", label: "Shorts", img: "/brand/youtube.jpg" },
  { id: "tiktok", label: "TikTok", img: "/brand/tiktok.png" },
];

const INDUSTRIES = [
  "beauty", "fitness", "fashion", "food", "saas", "marketing",
  "side-business", "finance", "education", "self-improvement", "parenting", "health",
] as const;

const INDUSTRY_LABELS: Record<string, string> = {
  beauty: "美容・コスメ", fitness: "フィットネス", fashion: "ファッション",
  food: "グルメ・料理", saas: "BtoB SaaS", marketing: "マーケティング",
  "side-business": "副業・起業", finance: "投資・金融", education: "教育・受験",
  "self-improvement": "自己啓発", parenting: "子育て", health: "健康・医療",
};

const BREAKDOWN_LABELS: Record<keyof BreakdownScores, string> = {
  impact: "インパクト",
  curiosity: "好奇心喚起",
  clarity: "明確さ",
  targetFit: "ターゲット適合",
  emotion: "感情強度",
  specificity: "具体性",
  platformFit: "プラットフォーム適合",
};

export function AnalyzeForm() {
  const [hookText, setHookText] = useState("3秒で痩せる方法、実は99%の人が知らない。");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [industry, setIndustry] = useState<string>("fitness");
  const [target, setTarget] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!hookText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hookText,
          platform,
          industry,
          target: target || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "分析に失敗しました");
      }
      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") analyze();
  };

  return (
    <div className="grid grid-cols-12 gap-5">
        {/* Input card */}
        <section className="surface-card col-span-12 p-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-[var(--color-primary)]">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
              AI評価エンジン稼働中
            </span>
            <span className="rounded-full bg-violet-50/60 px-3 py-1 text-[11px] font-semibold text-[var(--color-ink-soft)]">
              ⌘ + ↵ で分析
            </span>
          </div>

          <textarea
            value={hookText}
            onChange={(e) => setHookText(e.target.value)}
            onKeyDown={onKey}
            placeholder="ここにフックを入力してください…  例: 3秒で痩せる方法、99%の人が知らない。"
            className="min-h-[88px] w-full resize-none bg-transparent text-2xl font-semibold leading-relaxed tracking-tight text-[var(--color-ink)] placeholder:font-medium placeholder:text-[var(--color-ink-mute)] focus:outline-none"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex gap-0.5 rounded-2xl bg-violet-50 p-1">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      platform === p.id
                        ? "bg-white text-[var(--color-primary)] shadow-sm"
                        : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <Image src={p.img} alt="" width={16} height={16} className="size-4 rounded" />
                    {p.label}
                  </button>
                ))}
              </div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="rounded-xl border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{INDUSTRY_LABELS[i] ?? i}</option>
                ))}
              </select>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="ターゲット（任意）"
                className="rounded-xl border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--color-ink-mute)]">{hookText.length}字</span>
              <button
                type="button"
                onClick={analyze}
                disabled={loading || !hookText.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
              >
                {loading ? "分析中…" : "分析する"}
                <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">⌘ ↵</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
        </section>

        {/* Results */}
        {result ? (
          <>
            <div className="col-span-12 lg:col-span-7">
              <ScoreHero result={result} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <BreakdownCard breakdown={result.breakdown} />
            </div>
            <div className="col-span-12">
              <ImprovementsCard improvements={result.improvements} />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <section className="surface-card col-span-12 grid place-items-center p-14 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-violet-50 text-[var(--color-primary)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-8">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-bold text-[var(--color-ink)]">フックを入力して、分析を開始しましょう</h3>
      <p className="mt-1 max-w-md text-xs text-[var(--color-ink-soft)]">
        プラットフォーム・業界・ターゲットを指定するほど、スコアリング精度と改善提案の質が上がります。
      </p>
    </section>
  );
}

function ScoreHero({ result }: { result: AnalysisResult }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[2rem] gradient-hero p-7 text-white shadow-xl shadow-violet-300/40">
      <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/70">総合スコア</div>
        <div className="mt-1 flex items-baseline">
          <span className="font-mono text-7xl font-bold leading-none tracking-tighter md:text-8xl">
            {result.totalScore}
          </span>
          <span className="ml-2 text-xl font-semibold text-white/70">/ 100</span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          業界平均 {result.growthRangeMin > 0 ? "+" : ""}
          {result.growthRangeMin}% 〜 {result.growthRangeMax > 0 ? "+" : ""}
          {result.growthRangeMax}% の伸びが期待できます
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-relaxed text-white/90 backdrop-blur">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60">強み</div>
          <div className="mb-3">{result.reasoning.strengths}</div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60">改善余地</div>
          <div>{result.reasoning.improvements}</div>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ breakdown }: { breakdown: BreakdownScores }) {
  const rows = Object.entries(BREAKDOWN_LABELS) as [keyof BreakdownScores, string][];
  return (
    <div className="surface-card h-full p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-base font-bold text-[var(--color-ink)]">内訳スコア</h3>
        <span className="text-[11px] font-semibold text-[var(--color-ink-mute)]">7項目</span>
      </div>
      <div className="space-y-1">
        {rows.map(([key, label]) => {
          const score = breakdown[key];
          const tone = score >= 75 ? "high" : score >= 55 ? "mid" : "low";
          return (
            <div
              key={key}
              className="grid grid-cols-[120px_1fr_42px] items-center gap-3 border-b border-violet-50 py-2.5 last:border-b-0"
            >
              <span className="text-xs font-semibold text-[var(--color-ink-soft)]">{label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-violet-50">
                <div
                  className={`h-full rounded-full ${
                    tone === "high"
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)]"
                      : tone === "mid"
                        ? "bg-gradient-to-r from-amber-400 to-orange-400"
                        : "bg-gradient-to-r from-rose-400 to-pink-400"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-right font-mono text-sm font-bold text-[var(--color-ink)]">{score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImprovementsCard({
  improvements,
}: {
  improvements: AnalysisResult["improvements"];
}) {
  return (
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--color-ink)]">もう一伸びさせる提案</h3>
          <p className="text-[11px] text-[var(--color-ink-soft)]">採用するとスコアが伸びます</p>
        </div>
        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
          {improvements.length}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {improvements.map((imp, i) => (
          <div
            key={i}
            className="group flex flex-col rounded-2xl bg-violet-50/40 p-4 transition hover:bg-white hover:shadow-md hover:shadow-violet-200/40"
          >
            <div className="mb-3 text-sm font-semibold leading-relaxed text-[var(--color-ink)]">
              {imp.text}
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {imp.appliedTechniques.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)] ring-1 ring-violet-100"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-sm font-bold text-emerald-700">
                  {imp.predictedScore}
                </span>
                {imp.delta > 0 && (
                  <span className="font-mono text-[11px] font-bold text-emerald-600">+{imp.delta}</span>
                )}
              </div>
              <button className="rounded-xl bg-[var(--color-ink)] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[var(--color-primary)]">
                採用 →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
