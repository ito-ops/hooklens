"use client";

import { useState } from "react";

type Props =
  | { kind: "checkout"; plan: "pro" | "team"; label: string; accent?: boolean }
  | { kind: "portal"; label: string; accent?: boolean };

export function BillingActions(props: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = props.kind === "checkout" ? "/api/stripe/checkout" : "/api/stripe/portal";
      const init: RequestInit =
        props.kind === "checkout"
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: props.plan }),
            }
          : { method: "POST" };
      const res = await fetch(url, init);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "失敗しました");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "失敗しました");
      setLoading(false);
    }
  };

  const cls =
    props.kind === "checkout" && props.accent
      ? "w-full rounded-2xl bg-white py-3 text-sm font-bold text-[var(--color-primary)] shadow-lg shadow-violet-900/20 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      : "w-full rounded-2xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="w-full">
      <button type="button" onClick={handleClick} disabled={loading} className={cls}>
        {loading ? "処理中…" : props.label}
      </button>
      {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
