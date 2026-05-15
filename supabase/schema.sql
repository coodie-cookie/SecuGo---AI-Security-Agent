-- SecuGo Supabase schema
-- Run this against your Supabase Postgres instance.
-- Designed for: GitHub OAuth via Supabase Auth + RLS-protected per-user data.

-- =========================================================
-- USERS PROFILE
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  github_username text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are self-readable"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are self-updatable"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-insert a profile row on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, github_username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- ONBOARDING STATE
-- =========================================================
create table if not exists public.onboarding_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed boolean not null default false,
  step integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.onboarding_state enable row level security;

create policy "onboarding self read"
  on public.onboarding_state for select
  using (auth.uid() = user_id);

create policy "onboarding self upsert"
  on public.onboarding_state for insert
  with check (auth.uid() = user_id);

create policy "onboarding self update"
  on public.onboarding_state for update
  using (auth.uid() = user_id);

-- =========================================================
-- REPOSITORIES
-- =========================================================
create type repo_visibility as enum ('public', 'private');
create type risk_level as enum ('safe', 'low', 'medium', 'high', 'critical');
create type scan_status as enum ('idle', 'queued', 'scanning', 'complete', 'failed');

create table if not exists public.repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  github_id bigint,
  name text not null,
  full_name text not null,
  description text,
  visibility repo_visibility not null default 'public',
  language text,
  stars integer default 0,
  default_branch text default 'main',
  github_updated_at timestamptz,
  risk_level risk_level not null default 'safe',
  scan_status scan_status not null default 'idle',
  last_scan_at timestamptz,
  vulnerability_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, full_name)
);

create index if not exists repositories_user_idx on public.repositories(user_id);

alter table public.repositories enable row level security;

create policy "repos self all"
  on public.repositories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- SCANS
-- =========================================================
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status scan_status not null default 'queued',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  files_scanned integer default 0,
  duration_ms integer,
  vulnerability_count integer not null default 0,
  critical_count integer not null default 0,
  high_count integer not null default 0,
  medium_count integer not null default 0,
  low_count integer not null default 0,
  log jsonb default '[]'::jsonb
);

create index if not exists scans_repo_idx on public.scans(repository_id);
create index if not exists scans_user_idx on public.scans(user_id);

alter table public.scans enable row level security;

create policy "scans self all"
  on public.scans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- VULNERABILITIES
-- =========================================================
create type vuln_severity as enum ('critical', 'high', 'medium', 'low');
create type vuln_category as enum (
  'secret', 'dependency', 'config', 'auth', 'injection', 'exposure'
);
create type vuln_status as enum ('open', 'resolved', 'ignored');

create table if not exists public.vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  repository_id uuid not null references public.repositories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  severity vuln_severity not null,
  category vuln_category not null,
  file text not null,
  line integer,
  description text not null,
  ai_explanation text,
  suggested_fix text,
  code_snippet text,
  fixed_snippet text,
  status vuln_status not null default 'open',
  detected_at timestamptz not null default now()
);

create index if not exists vulns_scan_idx on public.vulnerabilities(scan_id);
create index if not exists vulns_repo_idx on public.vulnerabilities(repository_id);
create index if not exists vulns_user_idx on public.vulnerabilities(user_id);
create index if not exists vulns_severity_idx on public.vulnerabilities(severity);

alter table public.vulnerabilities enable row level security;

create policy "vulns self all"
  on public.vulnerabilities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- AI CHAT MESSAGES (per-user assistant history)
-- =========================================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  context_repository_id uuid references public.repositories(id) on delete set null,
  context_vulnerability_id uuid references public.vulnerabilities(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists chat_user_idx on public.chat_messages(user_id, created_at desc);

alter table public.chat_messages enable row level security;

create policy "chat self all"
  on public.chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
