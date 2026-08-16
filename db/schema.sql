-- Supabase/PostgreSQL baseline for Sargam.io.
-- Apply through a reviewed Supabase migration after authentication is selected.

create extension if not exists pgcrypto;

create type public.transcription_state as enum (
  'queued', 'processing', 'completed', 'failed'
);

create type public.credit_ledger_reason as enum (
  'purchase', 'transcription_debit', 'transcription_refund', 'admin_adjustment'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Source URLs must be normalized before insertion. Keep provider/model version in
-- the cache key so an improved provider output can coexist or be invalidated.
create table public.song_cache (
  id uuid primary key default gen_random_uuid(),
  normalized_source_url text not null,
  source_fingerprint text not null,
  provider text not null,
  provider_version text not null,
  provider_job_id text,
  state public.transcription_state not null default 'queued',
  title text,
  artist text,
  detected_key text,
  bpm numeric(6,2),
  midi_events jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (source_fingerprint, provider, provider_version)
);

create index song_cache_state_idx on public.song_cache (state, created_at desc);

create table public.transcription_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_cache_id uuid references public.song_cache(id) on delete set null,
  normalized_source_url text not null,
  root_midi smallint not null check (root_midi between 0 and 127),
  instrument text not null check (instrument in ('harmonium', 'keyboard', 'bansuri', 'guitar', 'sitar')),
  created_at timestamptz not null default now()
);

create index transcription_requests_user_idx on public.transcription_requests (user_id, created_at desc);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.transcription_requests(id) on delete set null,
  reason public.credit_ledger_reason not null,
  amount integer not null check (amount <> 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.song_cache enable row level security;
alter table public.transcription_requests enable row level security;
alter table public.credit_ledger enable row level security;

create policy "users can view their own profile" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "users can update their own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "users can view their own transcription requests" on public.transcription_requests
  for select using ((select auth.uid()) = user_id);
create policy "users can view their own credit ledger" on public.credit_ledger
  for select using ((select auth.uid()) = user_id);

-- No client write policy is intentionally provided. Credit debits, cache writes,
-- and requests must be created through a server-side DAL after authz/rate checks.
