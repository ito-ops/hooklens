"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { signupAction, googleSignInAction, type AuthState } from "../(auth)/actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signupAction, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 10%, rgba(124,110,245,0.20) 0%, transparent 55%), radial-gradient(circle at 80% 30%, rgba(255,93,143,0.12) 0%, transparent 55%)",
        }}
      />

      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="relative hidden overflow-hidden rounded-[2rem] gradient-hero p-10 text-white shadow-2xl shadow-violet-400/40 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[var(--color-accent-hot)]/30 blur-3xl" />
          <div className="relative">
            <Image src="/logo.png" alt="Tsukami" width={200} height={59} className="h-9 w-auto brightness-0 invert" />
            <h2 className="mt-12 text-3xl font-bold leading-tight">
              無料で、
              <br />今日から磨ける。
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              1日5回まで無料分析。クレジットカード登録は不要です。
            </p>
          </div>
          <div className="relative space-y-3">
            {[
              "11観点での自動スコアリング",
              "AIによる改善案の自動生成",
              "プラットフォーム別の最適化",
              "業界平均との比較レポート",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm font-semibold">
                <span className="grid size-6 place-items-center rounded-full bg-white/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-10">
          <div className="mb-8 flex justify-center lg:hidden">
            <Image src="/logo.png" alt="Tsukami" width={300} height={89} className="h-11 w-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">無料アカウントを作成</h1>
          <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">1日5回まで無料。クレジットカード不要。</p>

          <form action={formAction} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">メールアドレス</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">パスワード（8文字以上）</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-violet-100"
              />
            </div>

            {state?.error && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="block w-full rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "作成中…" : "無料ではじめる"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-[var(--color-ink-mute)]">
            <div className="h-px flex-1 bg-violet-100" />
            <span>または</span>
            <div className="h-px flex-1 bg-violet-100" />
          </div>

          <form action={googleSignInAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-white py-3 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-violet-50"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Googleで登録
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--color-ink-mute)]">
            登録すると、利用規約とプライバシーポリシーに同意したものとみなされます。
          </p>
          <p className="mt-3 text-center text-sm text-[var(--color-ink-soft)]">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">ログイン</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
