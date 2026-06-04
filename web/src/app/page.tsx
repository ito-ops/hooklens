import Image from "next/image";
import Link from "next/link";
import { GradientBlurBg } from "@/components/ui/gradient-blur-bg";

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Grid + glow background (all sides) */}
      <GradientBlurBg variant="all" />

      <div className="relative z-10">
        <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-violet-100/60 bg-white/80 px-6 py-3 backdrop-blur-md md:px-10">
          <Link href="/" className="block">
            <Image src="/logo.png" alt="Tsukami" width={300} height={89} priority className="h-10 w-auto" />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <a href="#features" className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">機能</a>
            <a href="#pricing" className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">料金</a>
            <a href="#faq" className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]">よくある質問</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-violet-50">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px hover:bg-[var(--color-primary-dark)]"
            >
              無料ではじめる
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:px-10">
          {/* Hero */}
          <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-sm shadow-violet-200/40 ring-1 ring-violet-100">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
                Instagram / YouTube Shorts / TikTok 対応
              </span>

              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-ink)] md:text-7xl">
                最初の<span className="gradient-text">3秒</span>を、
                <br />
                データで磨く。
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--color-ink-soft)] md:text-lg">
                ショート動画の伸びを決める「冒頭フック」を、AIが11観点で多角的にスコアリング。
                改善案まで一気に提示する、クリエイターのためのコピー診断ツール。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-7 py-4 text-base font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px"
                >
                  無料で分析を試す →
                </Link>
                <button className="rounded-2xl bg-white px-7 py-4 text-base font-medium text-[var(--color-ink)] shadow-sm ring-1 ring-violet-100 transition hover:bg-violet-50">
                  ▶ 30秒デモを見る
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-10">
                {[
                  { num: "11", label: "評価観点" },
                  { num: "25", label: "対応業界" },
                  { num: "<3s", label: "分析時間" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="gradient-text font-mono text-4xl font-bold">{s.num}</div>
                    <div className="mt-1 text-xs text-[var(--color-ink-mute)]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration + floating preview cards */}
            <HeroPreview />
          </section>

          {/* Feature row */}
          <section id="features" className="mt-28">
            <div className="mb-12 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">FEATURES</div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
                ただ点数を出すだけじゃない。
              </h2>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                スコア・根拠・改善案・採用 → 再スコア。フックを磨くサイクル全部を1画面で。
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                tag="01 / Score"
                title="11観点で多角採点"
                body="インパクト、好奇心、ターゲット適合、プラットフォーム適合まで。スコアの内訳が見える。"
                illustration="/storyset/target.svg"
                tint="from-violet-50 to-violet-100/40"
              />
              <FeatureCard
                tag="02 / Reason"
                title="根拠は隠さない"
                body="どの特徴量で減点されたか、Gemini評価の理由まで全て表示。改善ポイントが具体的に分かる。"
                illustration="/storyset/search.svg"
                tint="from-pink-50 to-rose-100/40"
              />
              <FeatureCard
                tag="03 / Next"
                title="改善案 → 採用 → 再スコア"
                body="提案の予測スコアまで提示。採用するとそのままフックが書き換わり、再分析がワンクリック。"
                illustration="/storyset/innovation.svg"
                tint="from-amber-50 to-orange-100/40"
              />
            </div>
          </section>

          {/* Closing CTA with winners illustration */}
          <section className="mt-24">
            <div className="relative grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-50 via-white to-pink-50 p-8 ring-1 ring-violet-100 md:grid-cols-[1.2fr_1fr] md:p-12">
              <div className="absolute -right-16 -top-16 size-56 rounded-full bg-violet-200/40 blur-3xl" />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  START FREE
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
                  次の1本から、
                  <br />
                  「3秒で離脱されない」を。
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  クレジットカード不要。1日5回まで無料で診断できます。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-hot)] px-7 py-4 text-base font-bold text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-px"
                  >
                    無料ではじめる →
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-2xl bg-white px-7 py-4 text-base font-medium text-[var(--color-ink)] shadow-sm ring-1 ring-violet-100 transition hover:bg-violet-50"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
              <div className="relative grid place-items-center">
                <Image
                  src="/storyset/winners.svg"
                  alt=""
                  width={420}
                  height={300}
                  unoptimized
                  className="h-auto w-full max-w-sm"
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-violet-100/60 bg-white/40 px-6 py-8 md:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-[var(--color-ink-mute)]">
            <Image src="/logo.png" alt="Tsukami" width={200} height={59} className="h-8 w-auto opacity-60" />
            <span>© 2026 Tsukami</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-md">
      {/* Storyset illustration */}
      <Image
        src="/storyset/data-report.svg"
        alt=""
        width={520}
        height={400}
        unoptimized
        priority
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Floating score card */}
      <div className="absolute right-2 top-2 w-60 overflow-hidden rounded-3xl gradient-hero p-5 text-white shadow-2xl shadow-violet-400/40">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">総合スコア</div>
        <div className="mt-1 flex items-baseline">
          <span className="font-mono text-5xl font-bold leading-none tracking-tighter">82</span>
          <span className="ml-1.5 text-sm font-semibold text-white/70">/ 100</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
          業界平均 +18〜34% の伸び
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            ["インパクト", 88],
            ["好奇心喚起", 84],
            ["具体性", 76],
          ].map(([label, pct]) => (
            <div key={label as string} className="flex items-center gap-2 text-[10px] font-semibold text-white/90">
              <span className="w-20 truncate">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-right font-mono">{pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement card */}
      <div className="absolute bottom-4 left-0 w-64 rounded-3xl bg-white p-4 shadow-2xl shadow-violet-300/30 ring-1 ring-violet-100">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-violet-50 text-[var(--color-primary)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <span className="text-[11px] font-bold text-[var(--color-ink-soft)]">改善案 #1</span>
          <span className="ml-auto font-mono text-[11px] font-bold text-emerald-600">+7</span>
        </div>
        <div className="text-sm font-semibold leading-snug text-[var(--color-ink)]">
          「3秒で痩せる方法、99%の人が知らない理由とは？」
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {["数字の具体化", "逆説", "疑問形"].map((t) => (
            <span key={t} className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Tiny stats pill */}
      <div className="absolute bottom-0 right-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ring-1 ring-violet-100">
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="size-3 text-[var(--color-accent-hot)]">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
        <span className="text-[10px] font-bold text-[var(--color-ink)]">4.9</span>
      </div>
    </div>
  );
}

function FeatureCard({
  tag,
  title,
  body,
  illustration,
  tint,
}: {
  tag: string;
  title: string;
  body: string;
  illustration: string;
  tint: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-violet-100/80 shadow-sm shadow-violet-200/30 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-200/40">
      {/* Illustration area */}
      <div
        className={`relative mb-5 grid h-44 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${tint}`}
      >
        <Image
          src={illustration}
          alt=""
          width={320}
          height={240}
          unoptimized
          className="h-36 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-mute)]">{tag}</div>
      <h3 className="mt-1 text-lg font-bold text-[var(--color-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{body}</p>
    </div>
  );
}
