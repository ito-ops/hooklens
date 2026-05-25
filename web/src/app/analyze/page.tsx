"use client";

import Image from "next/image";
import { useState } from "react";
import type { AnalysisResult, BreakdownScores, Platform } from "@/types/domain";
import { AppNav } from "@/components/AppNav";

const PLATFORMS: { id: Platform; label: string; img: string }[] = [
  { id: "instagram", label: "IG", img: "/brand/instagram.png" },
  { id: "shorts", label: "Shorts", img: "/brand/youtube.jpg" },
  { id: "tiktok", label: "TikTok", img: "/brand/tiktok.png" },
];

const INDUSTRIES = [
  "beauty",
  "fitness",
  "fashion",
  "food",
  "saas",
  "marketing",
  "side-business",
  "finance",
  "education",
  "self-improvement",
  "parenting",
  "health",
] as const;

const INDUSTRY_LABELS: Record<string, string> = {
  beauty: "美容・コスメ",
  fitness: "フィットネス",
  fashion: "ファッション",
  food: "グルメ・料理",
  saas: "BtoB SaaS",
  marketing: "マーケティング",
  "side-business": "副業・起業",
  finance: "投資・金融",
  education: "教育・受験",
  "self-improvement": "自己啓発",
  parenting: "子育て",
  health: "健康・医療",
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

export default function AnalyzePage() {
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
    <>
      <AppNav plan="Pro" />

      {/* Hero input section */}
      <section className="relative mx-auto max-w-3xl px-6 pt-14 pb-8 text-center">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 20% -10%, rgba(79,70,229,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.08) 0%, transparent 50%)",
          }}
        />
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-[var(--color-primary)]">
          <span className="inline-block size-2 animate-pulse rounded-full bg-[var(--color-success)]" />
          AI評価エンジン稼働中
        </span>
        <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          フックを<span className="gradient-text">入力</span>するだけ。
        </h1>
        <p className="mb-10 text-base text-slate-600">
          最初の3秒で視聴者の心をつかむフックを、11の観点でスコアリング＆改善提案。
        </p>

        {/* Giant input card */}
        <div className="rounded-3xl border-2 border-slate-100 bg-white p-7 text-left shadow-xl shadow-slate-200/50 transition focus-within:border-[var(--color-primary)] focus-within:shadow-2xl focus-within:shadow-indigo-200/50">
          <textarea
            value={hookText}
            onChange={(e) => setHookText(e.target.value)}
            onKeyDown={onKey}
            placeholder="ここにフックを入力してください…  例: 3秒で痩せる方法、99%の人が知らない。"
            className="min-h-[90px] w-full resize-none bg-transparent text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 placeholder:font-medium placeholder:text-slate-400 focus:outline-none"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Platform pills */}
              <div className="inline-flex gap-0.5 rounded-xl bg-slate-100 p-1">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      platform === p.id
                        ? "bg-white text-[var(--color-primary)] shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
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
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {INDUSTRY_LABELS[i] ?? i}
                  </option>
                ))}
              </select>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="ターゲット（任意）"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">{hookText.length}字</span>
              <button
                type="button"
                onClick={analyze}
                disabled={loading || !hookText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
              >
                {loading ? "分析中…" : "分析する"}
                <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">⌘ ↵</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
      </section>

      {/* Results */}
      {result && (
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <ScoreHero result={result} />
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <BreakdownCard breakdown={result.breakdown} />
            <ImprovementsCard improvements={result.improvements} />
          </div>
        </section>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function ScoreHero({ result }: { result: AnalysisResult }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-md shadow-slate-200/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" />
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">総合スコア</div>
      <div className="mt-2 flex items-baseline">
        <span className="gradient-text font-mono text-7xl font-bold leading-none tracking-tighter md:text-8xl">
          {result.totalScore}
        </span>
        <span className="ml-2 text-2xl font-semibold text-slate-400">/ 100</span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
        業界平均 {result.growthRangeMin > 0 ? "+" : ""}
        {result.growthRangeMin}% 〜 {result.growthRangeMax > 0 ? "+" : ""}
        {result.growthRangeMax}% の伸びが期待できます
      </div>
      <div className="mt-5 rounded-lg border-l-4 border-[var(--color-primary)] bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
        <strong className="text-slate-900">強み: </strong>
        {result.reasoning.strengths}
        <br />
        <strong className="text-slate-900">改善余地: </strong>
        {result.reasoning.improvements}
      </div>
    </div>
  );
}

function BreakdownCard({ breakdown }: { breakdown: BreakdownScores }) {
  const rows = Object.entries(BREAKDOWN_LABELS) as [keyof BreakdownScores, string][];
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-md shadow-slate-200/30">
      <h3 className="mb-4 text-base font-bold">内訳スコア</h3>
      <div>
        {rows.map(([key, label]) => {
          const score = breakdown[key];
          const tone = score >= 75 ? "high" : score >= 55 ? "mid" : "low";
          return (
            <div
              key={key}
              className="grid grid-cols-[140px_1fr_48px] items-center gap-4 border-b border-slate-100 py-2.5 last:border-b-0"
            >
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
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
              <span className="text-right font-mono text-sm font-bold text-slate-900">{score}</span>
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
    <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-md shadow-slate-200/30">
      <h3 className="mb-4 text-base font-bold">もう一伸びさせる提案</h3>
      <div className="space-y-3">
        {improvements.map((imp, i) => (
          <div
            key={i}
            className="rounded-xl border border-transparent bg-slate-50 p-4 transition hover:border-[var(--color-primary)] hover:bg-white hover:shadow-sm"
          >
            <div className="mb-3 text-base font-semibold leading-relaxed text-slate-900">
              {imp.text}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {imp.appliedTechniques.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {imp.delta > 0 && (
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    +{imp.delta}
                  </span>
                )}
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-sm font-bold text-emerald-700">
                  {imp.predictedScore}
                </span>
                <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800">
                  採用 →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
