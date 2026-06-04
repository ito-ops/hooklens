-- =====================================================================
-- Tsukami — try_feedback
-- =====================================================================
-- Anonymous feedback captured from the public /try test page.
-- Writes happen only via the service-role key (server-side), so RLS is
-- enabled with NO policies → blocked for anon/authenticated, bypassed
-- by the service role. Idempotent: safe to re-run.

create extension if not exists "uuid-ossp";

create table if not exists public.try_feedback (
  id            uuid primary key default uuid_generate_v4(),
  hook_text     text not null,
  platform      platform_t not null,
  industry      text not null,
  target        text,
  total_score   int,
  breakdown     jsonb,
  improvements  jsonb,
  -- スコアが妥当だったか: 'up' = 妥当 / 'down' = ずれている
  verdict       text check (verdict in ('up', 'down')),
  comment       text,
  -- 緩いセッション識別（同一ブラウザの連続利用をまとめる用、任意）
  session_id    text,
  created_at    timestamptz not null default now()
);

create index if not exists try_feedback_created_at_idx
  on public.try_feedback (created_at desc);

alter table public.try_feedback enable row level security;
-- ポリシーは意図的に作成しない（service-role のみ書き込み可能）。
