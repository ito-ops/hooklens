"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([""]);

  const togglePlatform = (id: string) =>
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
    // TODO: send to /api/profiles when Supabase wired up
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-12 shadow-xl shadow-slate-200/40">
        <div className="mb-8">
          <Image src="/logo.png" alt="Tsukami" width={300} height={89} className="h-10 w-auto" />
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] transition-all duration-300"
                style={{ width: step >= s ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="mb-2 text-xs font-bold tracking-wider text-slate-400">
          STEP {step} / 4
        </div>

        {step === 1 && (
          <>
            <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              はじめまして。
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-slate-600">
              何とお呼びすればよいですか？個人クリエイターでも法人でもOKです。
            </p>
            <div className="mb-10">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                会社名 / クリエイター名
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例: 株式会社サンプル / コスメ系yuki"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-base transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-indigo-100"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
              主戦場のプラットフォームは？
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-slate-600">
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
                        ? "border-[var(--color-primary)] bg-indigo-50/40"
                        : "border-slate-200 bg-white hover:bg-slate-50"
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
            <p className="mb-8 text-sm leading-relaxed text-slate-600">
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
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
            <p className="mb-8 text-sm leading-relaxed text-slate-600">
              ご自身のアカウント、または参考にしている競合アカウントのURLを貼ってください（任意・複数可）。
            </p>
            <div className="mb-10 space-y-2">
              {urls.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={u}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder="https://www.instagram.com/your_account/"
                    className="flex-1 rounded-lg border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-indigo-100"
                  />
                  {urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrl(i)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
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
                <div className="mt-6 rounded-xl bg-gradient-to-br from-indigo-50/60 to-pink-50/60 p-4 text-sm leading-relaxed text-slate-700">
                  <strong className="mb-1 block">プロファイル プレビュー</strong>
                  「<strong>{companyName || "—"}</strong>」さん（
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

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
          >
            ← 戻る
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              次へ →
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-px"
            >
              はじめる →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
