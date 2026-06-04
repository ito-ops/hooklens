"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { saveProfileAction } from "./actions";
import type { Platform } from "@/types/domain";

const PLATFORMS = [
  { id: "instagram", name: "Instagram Reels", img: "/brand/instagram.png" },
  { id: "shorts", name: "YouTube Shorts", img: "/brand/youtube.jpg" },
  { id: "tiktok", name: "TikTok", img: "/brand/tiktok.png" },
] as const;

const INDUSTRIES = [
  "美容・コスメ",
  "フィットネス",
  "ファッション",
  "グルメ・料理",
  "旅行",
  "BtoB SaaS",
  "マーケティング",
  "副業・起業",
  "投資・金融",
  "教育・受験",
  "プログラミング",
  "自己啓発",
  "子育て・育児",
  "ペット",
  "健康・医療",
  "お笑い",
  "ゲーム",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([""]);
  const [saving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (id: Platform) =>
    setPlatforms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleIndustry = (i: string) =>
    setIndustries((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  const updateUrl = (i: number, v: string) =>
    setUrls((s) => s.map((u, idx) => (idx === i ? v : u)));
  const addUrl = () => setUrls((s) => [...s, ""]);
  const removeUrl = (i: number) =>
    setUrls((s) => (s.length > 1 ? s.filter((_, idx) => idx !== i) : s));

  const canProceed =
    (step === 1 && companyName.trim().length > 0) ||
    (step === 2 && platforms.length > 0) ||
    (step === 3 && industries.length > 0) ||
    step === 4;

  const finish = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveProfileAction({
        companyName,
        platforms,
        industries,
        urls,
      });
      // saveProfileAction redirects on success; only return value is an error.
      if (result && "error" in result && result.error) setError(result.error);
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 10%, rgba(124,110,245,0.20) 0%, transparent 55%), radial-gradient(circle at 80% 30%, rgba(255,93,143,0.12) 0%, transparent 55%)",
        }}
      />
      <div className="surface-card w-full max-w-2xl p-10 md:p-12">
        <div className="mb-8 flex items-center justify-between">
          <Image src="/logo.png" alt="Tsukami" width={300} height={89} className="h-10 w-auto" />
          <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-[var(--color-primary)]">
            STEP {step} / 4
          </span>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] transition-all duration-300"
                style={{ width: step >= s ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              はじめまして。
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              何とお呼びすればよいですか？個人クリエイターでも法人でもOKです。
            </p>
            <div className="mb-10">
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
                会社名 / クリエイター名
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例: 株式会社サンプル / コスメ系yuki"
                className="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-base transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              主戦場のプラットフォームは？
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              複数選択できます。投稿しているプラットフォームすべて選んでください。
            </p>
            <div className="mb-10 grid grid-cols-3 gap-3">
              {PLATFORMS.map((p) => {
                const selected = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex flex-col items-center rounded-2xl border-2 px-3 py-5 transition ${
                      selected
                        ? "border-[var(--color-primary)] bg-violet-50/60"
                        : "border-violet-100 bg-white hover:bg-violet-50/40"
                    }`}
                  >
                    <Image
                      src={p.img}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="mb-2 size-14 rounded-xl object-contain"
                    />
                    <div className="text-sm font-semibold">{p.name}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              業界・専門分野は？
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              複数選択できます。フックの評価軸を業界に合わせて調整します。
            </p>
            <div className="mb-10 flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => {
                const selected = industries.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleIndustry(i)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm shadow-violet-300/40"
                        : "border-violet-100 bg-white text-[var(--color-ink-soft)] hover:bg-violet-50/40"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              参考にしたいアカウントは？
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              ご自身のアカウント、または参考にしている競合アカウントのURLを貼ってください（任意・複数可）。
            </p>
            <div className="mb-10 space-y-2">
              {urls.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={u}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder="https://www.instagram.com/your_account/"
                    className="flex-1 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
                  />
                  {urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrl(i)}
                      className="grid size-11 place-items-center rounded-2xl bg-white text-[var(--color-ink-mute)] ring-1 ring-violet-100 hover:bg-rose-50 hover:text-rose-500"
                      title="削除"
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addUrl}
                className="px-1 py-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                + URLを追加
              </button>

              {(companyName || platforms.length > 0 || industries.length > 0) && (
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-50/80 to-pink-50/60 p-5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  <strong className="mb-1 block text-[var(--color-ink)]">プロファイル プレビュー</strong>
                  「<strong className="text-[var(--color-primary)]">{companyName || "—"}</strong>」さん（
                  {platforms
                    .map((id) => PLATFORMS.find((p) => p.id === id)?.name)
                    .filter(Boolean)
                    .join(" × ") || "—"}{" "}
                  / {industries.slice(0, 3).join("・") || "—"}
                  {industries.length > 3 ? "…" : ""}）の文脈で、フックを評価・改善案生成します。
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="flex items-center justify-between border-t border-violet-100 pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || saving}
            className="rounded-2xl border border-violet-100 bg-white px-6 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-violet-50 disabled:opacity-30 disabled:hover:bg-white"
          >
            ← 戻る
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              className="rounded-2xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:bg-violet-200 disabled:shadow-none"
            >
              次へ →
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "保存中…" : "はじめる →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
