import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white/85 px-8 py-3 backdrop-blur-md">
        <Link href="/" className="block">
          <Image
            src="/logo.png"
            alt="Tsukami"
            width={300}
            height={89}
            priority
            className="h-11 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[var(--color-primary-dark)]"
          >
            無料ではじめる
          </Link>
        </div>
      </nav>

      <main className="relative mx-auto flex max-w-5xl flex-1 flex-col items-center px-6 pt-24 pb-32 text-center">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 50% -10%, rgba(79,70,229,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 50%)",
          }}
        />

        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-[var(--color-primary)]">
          <span className="inline-block size-2 animate-pulse rounded-full bg-[var(--color-success)]" />
          Instagram / YouTube Shorts / TikTok 対応
        </span>

        <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          最初の<span className="gradient-text">3秒</span>を、
          <br className="hidden md:block" />
          データで磨く。
        </h1>

        <p className="mb-10 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
          ショート動画の伸びを決める「冒頭フック」を、AIが多角的にスコアリング。
          改善案まで一気に提示する、クリエイターのためのコピー診断ツール。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-[var(--color-primary)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-px hover:bg-[var(--color-primary-dark)]"
          >
            無料で分析を試す →
          </Link>
          <button className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-medium text-slate-700 transition hover:bg-slate-50">
            ▶ 30秒デモを見る
          </button>
        </div>

        <div className="mt-16 flex gap-16">
          {[
            { num: "11", label: "評価観点" },
            { num: "25", label: "対応業界" },
            { num: "<3s", label: "分析時間" },
          ].map((s) => (
            <div key={s.label}>
              <div className="gradient-text font-mono text-4xl font-bold">{s.num}</div>
              <div className="mt-1 text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 px-8 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-slate-500">
          <Image
            src="/logo.png"
            alt="Tsukami"
            width={200}
            height={59}
            className="h-8 w-auto opacity-60"
          />
          <span>© 2026 Tsukami</span>
        </div>
      </footer>
    </>
  );
}
