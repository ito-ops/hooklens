import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(79,70,229,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 50%)",
        }}
      />
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="Tsukami" width={300} height={89} className="h-12 w-auto" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">無料アカウント作成</h1>
        <p className="mb-8 text-center text-sm text-slate-500">
          1日5回まで分析が無料。クレジットカード不要。
        </p>

        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              メールアドレス
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              パスワード（8文字以上）
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-3 focus:ring-indigo-100"
            />
          </div>

          <Link
            href="/onboarding"
            className="block rounded-xl bg-[var(--color-primary)] py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[var(--color-primary-dark)]"
          >
            無料ではじめる
          </Link>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>または</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleで登録
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          登録すると、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
