"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/(auth)/actions";

interface Props {
  email: string;
  plan: string;
  initial: string;
  displayName: string;
}

export function UserMenu({ email, plan, initial, displayName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-2xl bg-white/80 py-1.5 pl-1.5 pr-3.5 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100 transition hover:bg-white"
      >
        <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-hot)] text-xs font-bold text-white">
          {initial}
        </div>
        <div className="hidden text-left sm:block">
          <div className="max-w-[120px] truncate text-xs font-bold text-[var(--color-ink)]">
            {displayName}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            {plan}
          </div>
        </div>
        <svg
          className={`size-3.5 text-[var(--color-ink-mute)] transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-white shadow-xl shadow-violet-300/40 ring-1 ring-violet-100">
          <div className="border-b border-violet-100 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-hot)] text-sm font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[var(--color-ink)]">{displayName}</div>
                <div className="truncate text-[11px] text-[var(--color-ink-mute)]">{email}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {plan} プラン
            </div>
          </div>

          <div className="py-1.5">
            <MenuLink href="/settings" label="アカウント設定" icon={iconSettings} />
            <MenuLink href="/settings/billing" label="プラン・お支払い" icon={iconCard} />
            <MenuLink href="/onboarding" label="プロファイル編集" icon={iconUser} />
          </div>

          <form action={logoutAction} className="border-t border-violet-100 py-1.5">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <span className="size-4">{iconLogout}</span>
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:bg-violet-50 hover:text-[var(--color-ink)]"
    >
      <span className="size-4">{icon}</span>
      {label}
    </Link>
  );
}

const iconSettings = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 10v6m11-11h-6M7 12H1m16.95-7.07l-4.24 4.24M9.29 14.71l-4.24 4.24m0-14.02l4.24 4.24m5.42 5.42l4.24 4.24" />
  </svg>
);
const iconCard = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const iconUser = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const iconLogout = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
