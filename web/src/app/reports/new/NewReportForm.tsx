"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INDUSTRIES = [
  ["beauty", "美容・コスメ"],
  ["fitness", "フィットネス"],
  ["fashion", "ファッション"],
  ["food", "グルメ・料理"],
  ["saas", "BtoB SaaS"],
  ["marketing", "マーケティング"],
  ["side-business", "副業・起業"],
  ["finance", "投資・金融"],
  ["education", "教育・受験"],
  ["self-improvement", "自己啓発"],
  ["parenting", "子育て"],
  ["health", "健康・医療"],
  ["other", "その他"],
] as const;

export function NewReportForm() {
  const router = useRouter();
  const [urlText, setUrlText] = useState("");
  const [industry, setIndustry] = useState("beauty");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedUrls = urlText
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("http"));

  const submit = async () => {
    if (parsedUrls.length === 0) {
      setError("Instagram の投稿URLを1つ以上入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: parsedUrls, industry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "失敗しました");
      router.push("/reports");
    } catch (e) {
      setError(e instanceof Error ? e.message : "失敗しました");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          Instagram 投稿URL（1行に1つ、最大20件）
        </label>
        <textarea
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          placeholder={"https://www.instagram.com/p/...\nhttps://www.instagram.com/p/..."}
          className="min-h-[200px] w-full rounded-2xl border border-violet-100 bg-white p-4 font-mono text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
        />
        <div className="mt-2 text-xs text-[var(--color-ink-mute)]">
          認識URL: <span className="font-mono font-bold">{parsedUrls.length}</span> 件
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          業界
        </label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="rounded-2xl border border-violet-100 bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
        >
          {INDUSTRIES.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading || parsedUrls.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
        >
          {loading ? "解析中…" : `${parsedUrls.length} 件のレポートを生成`}
        </button>
        <span className="text-xs text-[var(--color-ink-mute)]">
          Apify でデータ取得 → Gemini で各フックを評価します（30秒〜2分）
        </span>
      </div>
    </>
  );
}
