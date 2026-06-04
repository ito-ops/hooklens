-- =====================================================================
-- Tsukami — Self-updating corpus & learned industry profiles
-- =====================================================================
-- 週次パイプラインが収集する「勝ちフックのコーパス」と、そこから蒸留した
-- 「業界別の学習プロファイル」を保持する。書き込みは service-role のみ
-- （cron / バックグラウンド）なので RLS は有効化しポリシーは作らない。
-- Idempotent。

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- hook_corpus — Apify で収集し、フックを文字起こしした勝ち動画
-- ---------------------------------------------------------------------
create table if not exists public.hook_corpus (
  id                  uuid primary key default uuid_generate_v4(),
  platform            platform_t not null,
  industry            text not null,
  source_url          text,
  shortcode           text,
  account             text,
  followers           int,
  views               int,
  likes               int,
  comments            int,
  -- 代理エンゲージメント指標（視聴維持率は非公開のため取得不可）
  engagement_rate     numeric,   -- (likes + comments) / views
  views_per_follower  numeric,   -- views / followers（フォロワー比の伸び）
  caption             text,
  hook_text           text,      -- 文字起こしした冒頭フック
  transcript          text,      -- 冒頭の少し長めの文字起こし（任意）
  raw                 jsonb,
  collected_at        timestamptz not null default now(),
  unique (platform, shortcode)
);

create index if not exists hook_corpus_industry_idx
  on public.hook_corpus (industry, collected_at desc);

-- ---------------------------------------------------------------------
-- industry_profiles — 勝ちフックから蒸留した、業界別の学習プロファイル
--   エンジンが採点/生成のたびに読み込み、プロンプトを最適化する。
-- ---------------------------------------------------------------------
create table if not exists public.industry_profiles (
  industry        text primary key,
  pattern_notes   text,    -- 蒸留した「勝ちパターン」の説明
  exemplars       jsonb,   -- [{ hook, why, metrics }] 実例集（フューショット用）
  technique_freq  jsonb,   -- { テクニック名: 出現数 }
  sample_size     int not null default 0,
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- pipeline_runs — 定期実行の可観測性
-- ---------------------------------------------------------------------
create table if not exists public.pipeline_runs (
  id           uuid primary key default uuid_generate_v4(),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  status       text not null default 'running',  -- running | success | error
  trigger      text,                              -- cron | manual
  stats        jsonb,
  error        text
);

create index if not exists pipeline_runs_started_idx
  on public.pipeline_runs (started_at desc);

alter table public.hook_corpus       enable row level security;
alter table public.industry_profiles enable row level security;
alter table public.pipeline_runs     enable row level security;
-- ポリシーは意図的に作成しない（service-role のみアクセス可能）。
