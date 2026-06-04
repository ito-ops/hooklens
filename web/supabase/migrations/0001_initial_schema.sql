-- =====================================================================
-- Tsukami / HookLens — Initial schema
-- =====================================================================
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Idempotent: safe to re-run after edits.

-- =====================================================================
-- Extensions
-- =====================================================================
create extension if not exists "uuid-ossp";

-- =====================================================================
-- Enums
-- =====================================================================
do $$ begin
  create type plan_tier as enum ('free', 'pro', 'team');
exception when duplicate_object then null; end $$;

do $$ begin
  create type platform_t as enum ('instagram', 'shorts', 'tiktok');
exception when duplicate_object then null; end $$;

do $$ begin
  create type usage_action as enum ('analyze', 'report', 'scrape', 'competitor');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- profiles — onboarding-created analysis profile per user
-- =====================================================================
create table if not exists public.profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  company_name        text,
  creator_name        text,
  primary_platforms   platform_t[] not null default '{}',
  industries          text[] not null default '{}',
  reference_urls      text[] not null default '{}',
  tone_note           text,
  plan                plan_tier not null default 'free',
  stripe_customer_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- =====================================================================
-- analyses — hook-scoring history
-- =====================================================================
create table if not exists public.analyses (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  profile_id        uuid references public.profiles(id) on delete set null,
  hook_text         text not null,
  platform          platform_t not null,
  industry          text not null,
  target            text,
  total_score       int not null,
  growth_range_min  int,
  growth_range_max  int,
  breakdown         jsonb not null,
  improvements      jsonb not null default '[]'::jsonb,
  base_score        int,
  llm_score         int,
  reasoning         jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists analyses_user_id_idx       on public.analyses(user_id);
create index if not exists analyses_created_at_idx    on public.analyses(created_at desc);
create index if not exists analyses_total_score_idx   on public.analyses(total_score desc);

-- =====================================================================
-- favorites
-- =====================================================================
create table if not exists public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  tag         text,
  created_at  timestamptz not null default now(),
  unique (user_id, analysis_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);

-- =====================================================================
-- ig_posts — Apify-fetched Instagram post snapshots
-- =====================================================================
create table if not exists public.ig_posts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  profile_id      uuid references public.profiles(id) on delete set null,
  instagram_url   text not null,
  shortcode       text,
  caption         text,
  hook_extracted  text,
  impressions     int,
  reach           int,
  likes           int,
  comments        int,
  saves           int,
  shares          int,
  posted_at       timestamptz,
  fetched_at      timestamptz not null default now()
);

create index if not exists ig_posts_user_id_idx on public.ig_posts(user_id);

-- =====================================================================
-- reports — Pro performance / competitor reports
-- =====================================================================
create table if not exists public.reports (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete set null,
  type        text not null check (type in ('performance', 'competitor')),
  source_urls text[] not null default '{}',
  hook_ids    uuid[] not null default '{}',
  summary     jsonb,
  pdf_url     text,
  created_at  timestamptz not null default now()
);

create index if not exists reports_user_id_idx on public.reports(user_id);

-- =====================================================================
-- usage_logs — for plan-quota enforcement & analytics
-- =====================================================================
create table if not exists public.usage_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  action      usage_action not null,
  cost_units  int not null default 1,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists usage_logs_user_action_created_idx
  on public.usage_logs(user_id, action, created_at desc);

-- =====================================================================
-- updated_at auto-touch trigger
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles    enable row level security;
alter table public.analyses    enable row level security;
alter table public.favorites   enable row level security;
alter table public.ig_posts    enable row level security;
alter table public.reports     enable row level security;
alter table public.usage_logs  enable row level security;

-- Policy template: each user can CRUD only their own rows.
do $$
declare
  t text;
begin
  foreach t in array array['profiles','analyses','favorites','ig_posts','reports','usage_logs']
  loop
    execute format('drop policy if exists "%s_select_own" on public.%I;', t, t);
    execute format('drop policy if exists "%s_insert_own" on public.%I;', t, t);
    execute format('drop policy if exists "%s_update_own" on public.%I;', t, t);
    execute format('drop policy if exists "%s_delete_own" on public.%I;', t, t);

    execute format($p$create policy "%s_select_own" on public.%I
      for select using (auth.uid() = user_id);$p$, t, t);
    execute format($p$create policy "%s_insert_own" on public.%I
      for insert with check (auth.uid() = user_id);$p$, t, t);
    execute format($p$create policy "%s_update_own" on public.%I
      for update using (auth.uid() = user_id);$p$, t, t);
    execute format($p$create policy "%s_delete_own" on public.%I
      for delete using (auth.uid() = user_id);$p$, t, t);
  end loop;
end $$;

-- =====================================================================
-- Auto-create an empty profile row on user signup
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
