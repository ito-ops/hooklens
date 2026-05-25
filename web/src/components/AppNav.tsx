import Image from "next/image";
import Link from "next/link";

export function AppNav({ plan = "Free" }: { plan?: string }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white/85 px-8 py-3 backdrop-blur-md">
      <Link href="/dashboard" className="block">
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
          href="/analyze"
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          分析
        </Link>
        <Link
          href="/history"
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          履歴
        </Link>
        <Link
          href="/reports"
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          レポート
        </Link>
        <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
          {plan}
        </span>
        <div className="ml-2 size-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-hot)]" />
      </div>
    </nav>
  );
}
