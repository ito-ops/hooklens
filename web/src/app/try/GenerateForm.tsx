"use client";

import Image from "next/image";
import { useState } from "react";
import type { Platform } from "@/types/domain";
import { groupedIndustries } from "@/lib/industries";

const PLATFORMS: { id: Platform; label: string; img: string }[] = [
  { id: "instagram", label: "IG", img: "/brand/instagram.png" },
  { id: "shorts", label: "Shorts", img: "/brand/youtube.jpg" },
  { id: "tiktok", label: "TikTok", img: "/brand/tiktok.png" },
];

const INDUSTRY_GROUPS = groupedIndustries();

interface GeneratedHook {
  text: string;
  appliedTechniques: string[];
  rationale: string;
  baseScore: number;
  predictedScore: number;
}

export function GenerateForm() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [industry, setIndustry] = useState<string>("working-holiday");
  const [target, setTarget] = useState("");
  const [script, setScript] = useState("");
  const [hooks, setHooks] = useState<GeneratedHook[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          industry,
          target: target || undefined,
          script: script || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "生成に失敗しました");
      }
      const data: { hooks: GeneratedHook[] } = await res.json();
      setHooks([...data.hooks].sort((a, b) => b.baseScore - a.baseScore));
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1500);
    } catch {
      /* clipboard 不可環境は無視 */
    }
  };

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Input card */}
      <section className="surface-card col-span-12 p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-[var(--color-primary)]">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            フック生成エンジン
          </span>
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
            {INDUSTRY_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Target */}
        <label className="mb-1.5 block text-xs font-bold text-[var(--color-ink-soft)]">
          ターゲット（誰に向けた動画か）
        </label>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="例: 英語に自信がないけどワーホリに行きたい25歳女性"
          className="mb-4 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
        />

        {/* Script */}
        <label className="mb-1.5 block text-xs font-bold text-[var(--color-ink-soft)]">
          動画の台本・内容（あるとフックの精度が上がります）
        </label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="動画で話す内容や台本を貼り付けてください。例: 私が実際にオーストラリアにワーホリで行ったときの総費用の内訳と、行く前に貯金すべき金額について解説する動画。英語力ゼロでも現地で仕事が見つかった方法も…"
          className="min-h-[140px] w-full resize-y rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
        />

        <div className="mt-4 flex items-center justify-between border-t border-violet-100 pt-4">
          <span className="font-mono text-xs text-[var(--color-ink-mute)]">{script.length}字</span>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {loading ? "生成中…" : "フックを生成する"}
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
      </section>

      {/* Results */}
      {hooks ? (
        <section className="surface-card col-span-12 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--color-ink)]">生成されたフック候補</h3>
              <p className="text-[11px] text-[var(--color-ink-soft)]">スコアの高い順に表示。気に入ったものをコピーして使えます。</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
              {hooks.length}件
            </span>
          </div>
          <div className="grid gap-3">
            {hooks.map((h, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl bg-violet-50/40 p-4 transition hover:bg-white hover:shadow-md hover:shadow-violet-200/40 md:flex-row md:items-center"
              >
                <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-white px-3 py-2 ring-1 ring-violet-100">
                  <span className="font-mono text-lg font-bold text-[var(--color-primary)]">{h.baseScore}</span>
                  <span className="text-[9px] font-semibold text-[var(--color-ink-mute)]">推定スコア</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold leading-relaxed text-[var(--color-ink)]">{h.text}</div>
                  {h.rationale && (
                    <div className="mt-1 text-[11px] text-[var(--color-ink-soft)]">💡 {h.rationale}</div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {h.appliedTechniques.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)] ring-1 ring-violet-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(h.text, i)}
                  className="shrink-0 rounded-xl bg-[var(--color-ink)] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[var(--color-primary)]"
                >
                  {copiedIdx === i ? "コピー済 ✓" : "コピー"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="surface-card col-span-12 grid place-items-center p-14 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-violet-50 text-[var(--color-primary)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-8">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-[var(--color-ink)]">ターゲットと台本から、フックを生成しましょう</h3>
          <p className="mt-1 max-w-md text-xs text-[var(--color-ink-soft)]">
            ターゲットと動画の内容を入力するほど、刺さるフック候補が出やすくなります。
          </p>
        </section>
      )}
    </div>
  );
}
