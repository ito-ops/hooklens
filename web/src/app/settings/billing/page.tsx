import { AppShell } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";
import { BillingActions } from "./BillingActions";

type SearchParams = Promise<{ success?: string; canceled?: string }>;

interface Plan {
  id: "free" | "pro" | "team";
  name: string;
  price: string;
  perMonth?: boolean;
  tagline: string;
  features: string[];
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "¥0",
    tagline: "気軽に試したい個人向け",
    features: ["1日5回までの分析", "改善案 3パターン", "履歴 30日保存"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "¥2,980",
    perMonth: true,
    tagline: "本気で伸ばしたいクリエイター・SNS担当者向け",
    featured: true,
    features: [
      "分析・履歴 無制限",
      "改善案 5パターン",
      "Instagram実績レポート 月20件",
      "競合アカウント分析 月10件",
      "PDF / 共有リンク",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "¥14,800",
    perMonth: true,
    tagline: "代理店・複数アカウント運用するチーム向け",
    features: [
      "Pro 機能すべて",
      "Instagram レポート 月100件",
      "競合分析 月50件",
      "チームメンバー 10人",
      "API連携",
    ],
  },
];

export default async function BillingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_customer_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const currentPlan = (profile?.plan ?? "free") as Plan["id"];
  const hasCustomer = !!profile?.stripe_customer_id;

  return (
    <AppShell active="settings" title="プラン・お支払い" subtitle="ご利用プランの確認とアップグレード。">
      <div className="grid grid-cols-12 gap-5">
        {params.success === "1" && (
          <div className="col-span-12 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
            🎉 アップグレード完了！プランが反映されるまで数十秒かかる場合があります。
          </div>
        )}
        {params.canceled === "1" && (
          <div className="col-span-12 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">
            アップグレードはキャンセルされました。
          </div>
        )}

        {/* Current plan summary */}
        <section className="surface-card col-span-12 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">
                現在のプラン
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[var(--color-ink)]">
                  {PLANS.find((p) => p.id === currentPlan)?.name}
                </span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  {currentPlan}
                </span>
              </div>
            </div>
            {hasCustomer && (
              <BillingActions kind="portal" label="支払い情報を管理" />
            )}
          </div>
        </section>

        {/* Pricing grid */}
        {PLANS.map((p) => {
          const isCurrent = p.id === currentPlan;
          return (
            <section
              key={p.id}
              className={`relative col-span-12 overflow-hidden rounded-3xl p-7 md:col-span-4 ${
                p.featured
                  ? "gradient-hero text-white shadow-2xl shadow-violet-300/40 ring-1 ring-violet-300"
                  : "surface-card"
              }`}
            >
              {p.featured && (
                <div className="absolute right-5 top-5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                  人気
                </div>
              )}
              <div className={`text-xs font-bold uppercase tracking-wider ${p.featured ? "text-white/70" : "text-[var(--color-ink-mute)]"}`}>
                {p.name}
              </div>
              <div className={`mt-1 text-sm ${p.featured ? "text-white/90" : "text-[var(--color-ink-soft)]"}`}>
                {p.tagline}
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-bold tracking-tight">{p.price}</span>
                {p.perMonth && (
                  <span className={`text-sm font-semibold ${p.featured ? "text-white/70" : "text-[var(--color-ink-mute)]"}`}>
                    / 月
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <svg className={`mt-0.5 size-4 shrink-0 ${p.featured ? "text-white" : "text-emerald-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className={p.featured ? "text-white/95" : "text-[var(--color-ink-soft)]"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {isCurrent ? (
                  <div
                    className={`flex w-full items-center justify-center rounded-2xl py-3 text-sm font-bold ${
                      p.featured ? "bg-white/15 text-white" : "bg-violet-50 text-[var(--color-primary)]"
                    }`}
                  >
                    ご利用中のプラン
                  </div>
                ) : p.id === "free" ? (
                  <div className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-medium text-[var(--color-ink-mute)]">
                    Pro / Team から戻すには「支払い情報を管理」へ
                  </div>
                ) : (
                  <BillingActions
                    kind="checkout"
                    plan={p.id}
                    label={`${p.name} にアップグレード`}
                    accent={p.featured}
                  />
                )}
              </div>
            </section>
          );
        })}

        <section className="col-span-12 rounded-2xl bg-violet-50/50 p-5 text-xs leading-relaxed text-[var(--color-ink-soft)]">
          ※ 決済は Stripe を経由します。クレジットカード情報は Tsukami に保存されません。
          いつでもキャンセル可能で、次回更新日まで Pro 機能を利用できます。
        </section>
      </div>
    </AppShell>
  );
}
