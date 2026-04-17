-- Run this in Supabase SQL Editor to upgrade an existing database
-- These are additive changes safe to run on a live DB

-- 1. Add player_number to users
create sequence if not exists player_number_seq start 1001;
alter table public.users
  add column if not exists player_number integer unique default nextval('player_number_seq');
update public.users set player_number = nextval('player_number_seq') where player_number is null;

-- 2. Create alms_requests table
create table if not exists public.alms_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.users(id),
  gold_amount integer not null check (gold_amount > 0 and gold_amount <= 100),
  message text check (char_length(message) <= 200),
  status text not null default 'open' check (status in ('open','fulfilled','cancelled')),
  fulfilled_by uuid references public.users(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_alms_requests_status on public.alms_requests(status);
create index if not exists idx_alms_requests_requester on public.alms_requests(requester_id);
alter table public.alms_requests enable row level security;
create policy "Anyone can read open alms requests" on public.alms_requests for select using (true);
create policy "Authenticated can post alms request" on public.alms_requests for insert with check (auth.uid() = requester_id);
create policy "Requester can cancel own request" on public.alms_requests for update using (auth.uid() = requester_id);

-- 3. Publish wagers to realtime
alter publication supabase_realtime add table public.wagers;

-- 4. Create hoard_announcements table
create table if not exists public.hoard_announcements (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  gold_added integer not null default 200,
  created_at timestamptz not null default now()
);
alter table public.hoard_announcements enable row level security;
create policy "Anyone can read hoard announcements" on public.hoard_announcements for select using (true);

-- 5. Add last_daily_gold_at to users
alter table public.users
  add column if not exists last_daily_gold_at date;

-- 6. Add honorific to users (Sir / Lady / null)
alter table public.users
  add column if not exists honorific text check (honorific in ('Sir','Lady'));
