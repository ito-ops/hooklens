import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export default function DashboardPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ようこそ。</h1>
            <p className="mt-1 text-sm text-slate-500">
              フックを分析して、最初の3秒を磨いていきましょう。
            </p>
          </div>
          <Link
            href="/analyze"
            className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-px"
          >
            + フックを分析する
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              今月の分析回数
            </div>
            <div className="mt-3 font-mono text-4xl font-bold tracking-tight">0</div>
            <div className="mt-2 text-xs text-slate-500">Free: 1日5回まで</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              平均スコア
            </div>
            <div className="mt-3 font-mono text-4xl font-bold tracking-tight text-slate-300">—</div>
            <div className="mt-2 text-xs text-slate-500">最初の分析を実行してください</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              プロファイル
            </div>
            <div className="mt-3 text-base font-bold">未設定</div>
            <Link href="/onboarding" className="mt-2 inline-block text-xs font-semibold text-[var(--color-primary)] hover:underline">
              プロファイルを設定 →
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
          <p className="text-sm text-slate-500">
            まだ分析履歴がありません。最初のフックを分析してみましょう。
          </p>
          <Link
            href="/analyze"
            className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            分析画面へ →
          </Link>
        </div>
      </main>
    </>
  );
}
