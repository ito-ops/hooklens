"use client";

import { useRef, useState } from "react";
import type { AnalysisResult, Platform } from "@/types/domain";
import { AnalyzeForm } from "@/app/analyze/AnalyzeForm";
import { GenerateForm } from "./GenerateForm";

type LastInput = { hookText: string; platform: Platform; industry: string; target?: string };
type Mode = "analyze" | "generate";

export function TryClient() {
  const [mode, setMode] = useState<Mode>("analyze");
  const [last, setLast] = useState<{ result: AnalysisResult; input: LastInput } | null>(null);
  const [verdict, setVerdict] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const sessionId = useRef<string>("");

  if (!sessionId.current && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    sessionId.current = crypto.randomUUID();
  }

  const onResult = (result: AnalysisResult, input: LastInput) => {
    setLast({ result, input });
    // 新しい分析が出たらフィードバック状態をリセット
    setVerdict(null);
    setComment("");
    setSent(false);
  };

  const sendFeedback = async (v: "up" | "down") => {
    if (!last) return;
    setVerdict(v);
    setSending(true);
    try {
      await fetch("/api/try-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hookText: last.input.hookText,
          platform: last.input.platform,
          industry: last.input.industry,
          target: last.input.target,
          totalScore: last.result.totalScore,
          breakdown: last.result.breakdown,
          improvements: last.result.improvements,
          verdict: v,
          comment: comment || undefined,
          sessionId: sessionId.current || undefined,
        }),
      });
      setSent(true);
    } catch {
      // フィードバック送信失敗はテスト体験を止めない
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-violet-100/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]">Tsukami</span>
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-primary)]">
              ベータ体験版
            </span>
          </div>
          <span className="hidden text-xs font-semibold text-[var(--color-ink-soft)] sm:block">
            ログイン不要・無料でお試しいただけます
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* Mode tabs */}
        <div className="mb-5 inline-flex gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-violet-100">
          <button
            type="button"
            onClick={() => setMode("analyze")}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
              mode === "analyze"
                ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] text-white shadow"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            フックを分析
          </button>
          <button
            type="button"
            onClick={() => setMode("generate")}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
              mode === "generate"
                ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] text-white shadow"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            フックを生成
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
            {mode === "analyze" ? "フックを分析してみる" : "フックを生成してみる"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            {mode === "analyze"
              ? "ショート動画の冒頭コピーを入力すると、AIが11観点でスコアリングし、改善案を提案します。出てきた点数の精度を上げるため、ぜひ率直なフィードバックをお願いします。"
              : "ターゲットと動画の台本を入力すると、AIがその内容に最適化したフック（つかみ）の候補を生成し、その場でスコアリングします。"}
          </p>
        </div>

        {mode === "generate" ? (
          <GenerateForm />
        ) : (
          <>
            <AnalyzeForm onResult={onResult} />

        {/* Feedback bar */}
        {last && (
          <section className="surface-card mt-5 p-6">
            {sent ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                <span className="grid size-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">✓</span>
                フィードバックありがとうございます！精度改善に活用させていただきます。
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-[var(--color-ink)]">
                  この点数（{last.result.totalScore}点）、妥当だと感じましたか？
                </h3>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                  ご意見はスコアリング精度の改善に使わせていただきます（任意・匿名）。
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="気づいた点があれば自由にどうぞ（例: もっと高い／低いはず、改善案がイマイチ など）"
                  className="mt-3 min-h-[64px] w-full resize-none rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => sendFeedback("up")}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${
                      verdict === "up"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    👍 妥当だと思う
                  </button>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => sendFeedback("down")}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${
                      verdict === "down"
                        ? "bg-rose-600 text-white"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    }`}
                  >
                    👎 ずれている気がする
                  </button>
                </div>
              </>
            )}
          </section>
        )}
          </>
        )}
      </main>
    </div>
  );
}
