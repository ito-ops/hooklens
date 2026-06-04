import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";

type NavKey = "dashboard" | "analyze" | "history" | "reports" | "library" | "settings";

async function loadUserBadge(planFallback?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, creator_name, plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const displayName =
      profile?.creator_name ?? profile?.company_name ?? (user.email?.split("@")[0] ?? "User");
    const initial = displayName.slice(0, 1).toUpperCase();
    const planName = (profile?.plan ?? "free") as "free" | "pro" | "team";
    const planLabel = { free: "Free", pro: "Pro", team: "Team" }[planName] ?? planFallback ?? "Free";
    return {
      email: user.email ?? "",
      plan: planLabel,
      initial,
      displayName,
    };
  } catch {
    return null;
  }
}

const NAV_ITEMS: { key: NavKey; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "ダッシュボード",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="2" />
        <rect x="14" y="3" width="7" height="5" rx="2" />
        <rect x="14" y="12" width="7" height="9" rx="2" />
        <rect x="3" y="16" width="7" height="5" rx="2" />
      </svg>
    ),
  },
  {
    key: "analyze",
    href: "/analyze",
    label: "分析",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    key: "history",
    href: "/history",
    label: "履歴",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    key: "reports",
    href: "/reports",
    label: "レポート",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 3 5-6" />
      </svg>
    ),
  },
  {
    key: "library",
    href: "/library",
    label: "ライブラリ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h6v16H4z" />
        <path d="M14 4h6v9h-6z" />
        <path d="M14 17h6v3h-6z" />
      </svg>
    ),
  },
  {
    key: "settings",
    href: "/settings",
    label: "設定",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.16.4.51.69.95.79h.06A2 2 0 1 1 20.4 14l-.05.01a1.7 1.7 0 0 0-.95.99z" />
      </svg>
    ),
  },
];

export function Sidebar({ active }: { active?: NavKey }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[88px] shrink-0 flex-col items-center gap-1 border-r border-violet-100/70 bg-white/70 py-6 backdrop-blur-md">
      <Link href="/dashboard" className="mb-6 grid size-12 place-items-center">
        <Image src="/logo.png" alt="Tsukami" width={48} height={48} className="size-10 object-contain" />
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              title={item.label}
              className={`group relative grid size-12 place-items-center rounded-2xl transition ${
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-lg shadow-violet-300/50"
                  : "text-[var(--color-ink-soft)] hover:bg-violet-50 hover:text-[var(--color-primary)]"
              }`}
            >
              <span className="size-5">{item.icon}</span>
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-2.5 py-1 text-xs font-semibold text-white shadow-lg group-hover:block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-2 grid size-12 place-items-center rounded-2xl text-[var(--color-ink-soft)] hover:bg-violet-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    </aside>
  );
}

export async function Topbar({
  title,
  subtitle,
  plan = "Pro",
}: {
  title?: string;
  subtitle?: string;
  plan?: string;
}) {
  const badge = await loadUserBadge(plan);
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-2 py-2">
      <div className="min-w-0">
        {title && (
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-2xl bg-white/80 px-4 py-2.5 text-sm shadow-sm shadow-violet-200/40 ring-1 ring-violet-100 backdrop-blur md:flex">
          <svg className="size-4 text-[var(--color-ink-mute)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="検索…"
            className="w-44 bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:outline-none"
          />
          <span className="rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-primary)]">
            ⌘K
          </span>
        </div>

        <button className="relative grid size-11 place-items-center rounded-2xl bg-white/80 text-[var(--color-ink-soft)] shadow-sm shadow-violet-200/40 ring-1 ring-violet-100 hover:text-[var(--color-primary)]">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[var(--color-accent-hot)] ring-2 ring-white" />
        </button>

        {badge ? (
          <UserMenu
            email={badge.email}
            plan={badge.plan}
            initial={badge.initial}
            displayName={badge.displayName}
          />
        ) : (
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/80 py-1.5 pl-1.5 pr-3.5 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100">
            <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-hot)] text-xs font-bold text-white">
              T
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-bold text-[var(--color-ink)]">Tsukami User</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                {plan}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function AppShell({
  active,
  title,
  subtitle,
  plan,
  children,
}: {
  active?: NavKey;
  title?: string;
  subtitle?: string;
  plan?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <Sidebar active={active} />
      <div className="flex min-w-0 flex-1 flex-col px-6 py-6 md:px-10">
        <Topbar title={title} subtitle={subtitle} plan={plan} />
        <div className="mt-6 flex-1 pb-12">{children}</div>
      </div>
    </div>
  );
}

/** Backwards-compatible top nav for legacy pages. Prefer AppShell. */
export function AppNav({ plan = "Free" }: { plan?: string }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-violet-100 bg-white/85 px-8 py-3 backdrop-blur-md">
      <Link href="/dashboard" className="block">
        <Image src="/logo.png" alt="Tsukami" width={300} height={89} className="h-10 w-auto" />
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/analyze" className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-violet-50">分析</Link>
        <Link href="/history" className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-violet-50">履歴</Link>
        <span className="ml-2 inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">{plan}</span>
        <div className="ml-2 size-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-hot)]" />
      </div>
    </nav>
  );
}
