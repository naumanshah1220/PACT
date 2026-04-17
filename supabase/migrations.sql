-- Run this in Supabase SQL Editor to upgrade an existing database
-- All sections are additive and safe to run multiple times

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

-- 3. RLS for alms_requests (idempotent via exception handling)
alter table public.alms_requests enable row level security;
do $$ begin
  create policy "Anyone can read open alms requests"
    on public.alms_requests for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated can post alms request"
    on public.alms_requests for insert with check (auth.uid() = requester_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Requester can cancel own request"
    on public.alms_requests for update using (auth.uid() = requester_id);
exception when duplicate_object then null; end $$;

-- 4. Publish wagers to realtime
do $$ begin
  alter publication supabase_realtime add table public.wagers;
exception when others then null; end $$;

-- 5. hoard_announcements table
create table if not exists public.hoard_announcements (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  gold_added integer not null default 200,
  dismissed boolean default false,
  created_at timestamptz not null default now()
);
alter table public.hoard_announcements enable row level security;
do $$ begin
  create policy "Anyone can read hoard announcements"
    on public.hoard_announcements for select using (true);
exception when duplicate_object then null; end $$;

-- 6. Add last_daily_gold_at to users
alter table public.users add column if not exists last_daily_gold_at date;

-- 7. Add honorific to users
alter table public.users add column if not exists honorific text check (honorific in ('Sir', 'Lady'));

-- 8. Add spectators_allowed and practice to wagers
alter table public.wagers add column if not exists spectators_allowed boolean default false;
alter table public.wagers add column if not exists practice boolean default false;

-- 9. Add is_bot to users
alter table public.users add column if not exists is_bot boolean default false;

-- 10. Create bot court characters
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
values
  ('00000000-0000-0000-0001-000000000000', 'bot-friar@pact.internal',    crypt('pact-bot-no-login', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0002-000000000000', 'bot-cutpurse@pact.internal', crypt('pact-bot-no-login', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0003-000000000000', 'bot-merchant@pact.internal', crypt('pact-bot-no-login', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0004-000000000000', 'bot-oracle@pact.internal',   crypt('pact-bot-no-login', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.users (id, username, display_initials, gold_balance, honor_score, is_bot)
values
  ('00000000-0000-0000-0001-000000000000', 'TheMercifulFriar', 'MF', 9999, 100, true),
  ('00000000-0000-0000-0002-000000000000', 'TheCutpurse',      'CP', 9999,   0, true),
  ('00000000-0000-0000-0003-000000000000', 'TheMerchant',      'TM', 9999,  50, true),
  ('00000000-0000-0000-0004-000000000000', 'TheOracle',        'TO', 9999,  25, true)
on conflict (id) do nothing;

-- 11. Seed bot wagers (only if bot has no open wager)
insert into public.wagers (poster_id, gold_amount, timer_minutes, status, practice, spectators_allowed)
select '00000000-0000-0000-0001-000000000000', 10, 60, 'open', true, true
where not exists (select 1 from public.wagers where poster_id = '00000000-0000-0000-0001-000000000000' and status = 'open');

insert into public.wagers (poster_id, gold_amount, timer_minutes, status, practice, spectators_allowed)
select '00000000-0000-0000-0002-000000000000', 15, 60, 'open', true, true
where not exists (select 1 from public.wagers where poster_id = '00000000-0000-0000-0002-000000000000' and status = 'open');

insert into public.wagers (poster_id, gold_amount, timer_minutes, status, practice, spectators_allowed)
select '00000000-0000-0000-0003-000000000000', 20, 120, 'open', true, true
where not exists (select 1 from public.wagers where poster_id = '00000000-0000-0000-0003-000000000000' and status = 'open');

insert into public.wagers (poster_id, gold_amount, timer_minutes, status, practice, spectators_allowed)
select '00000000-0000-0000-0004-000000000000', 25, 60, 'open', true, true
where not exists (select 1 from public.wagers where poster_id = '00000000-0000-0000-0004-000000000000' and status = 'open');
