-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS
create sequence if not exists player_number_seq start 1001;
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_initials text not null check (char_length(display_initials) <= 2),
  gold_balance integer not null default 50,
  honor_score integer not null default 0,
  is_banned boolean not null default false,
  banned_until timestamptz,
  newbie_day integer not null default 1,
  player_number integer unique default nextval('player_number_seq'),
  created_at timestamptz not null default now()
);

-- WAGERS
create table public.wagers (
  id uuid primary key default uuid_generate_v4(),
  poster_id uuid not null references public.users(id),
  gold_amount integer not null check (gold_amount > 0),
  timer_minutes integer not null check (timer_minutes between 5 and 1440),
  status text not null default 'open' check (status in ('open','active','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- DUELS
create table public.duels (
  id uuid primary key default uuid_generate_v4(),
  wager_id uuid not null references public.wagers(id),
  player1_id uuid not null references public.users(id),
  player2_id uuid not null references public.users(id),
  player1_decision text check (player1_decision in ('pledge','betray')),
  player2_decision text check (player2_decision in ('pledge','betray')),
  player1_messaged boolean not null default false,
  player2_messaged boolean not null default false,
  deadline timestamptz not null,
  status text not null default 'active' check (status in ('active','completed','void')),
  outcome text check (outcome in ('both_pledge','both_betray','p1_betray','p2_betray','p1_silent','p2_silent','both_silent')),
  seal_requested_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- MESSAGES
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  duel_id uuid not null references public.duels(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- ALMS DONATIONS (history log)
create table public.alms_donations (
  id uuid primary key default uuid_generate_v4(),
  donor_id uuid not null references public.users(id),
  recipient_id uuid not null references public.users(id),
  gold_amount integer not null check (gold_amount > 0),
  created_at timestamptz not null default now()
);

-- ALMS REQUESTS (request board)
create table public.alms_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.users(id),
  gold_amount integer not null check (gold_amount > 0 and gold_amount <= 100),
  message text check (char_length(message) <= 200),
  status text not null default 'open' check (status in ('open','fulfilled','cancelled')),
  fulfilled_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- HOARD (single row)
create table public.hoard (
  id uuid primary key default uuid_generate_v4(),
  balance integer not null default 0
);
insert into public.hoard (balance) values (200);

-- INDEXES
create index idx_wagers_status on public.wagers(status);
create index idx_wagers_poster on public.wagers(poster_id);
create index idx_duels_players on public.duels(player1_id, player2_id);
create index idx_duels_status on public.duels(status);
create index idx_messages_duel on public.messages(duel_id, created_at);
create index idx_alms_requests_status on public.alms_requests(status);
create index idx_alms_requests_requester on public.alms_requests(requester_id);

-- REALTIME
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.duels;
alter publication supabase_realtime add table public.wagers;

-- ROW LEVEL SECURITY
alter table public.users enable row level security;
alter table public.wagers enable row level security;
alter table public.duels enable row level security;
alter table public.messages enable row level security;
alter table public.alms_donations enable row level security;
alter table public.alms_requests enable row level security;
alter table public.hoard enable row level security;

-- USERS policies
create policy "Users can read all profiles" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- WAGERS policies
create policy "Anyone can read open wagers" on public.wagers for select using (true);
create policy "Authenticated can post wagers" on public.wagers for insert with check (auth.uid() = poster_id);
create policy "Poster can cancel wager" on public.wagers for update using (auth.uid() = poster_id);

-- DUELS policies
create policy "Duel players can read duel" on public.duels for select using (
  auth.uid() = player1_id or auth.uid() = player2_id
);
create policy "Authenticated can create duel" on public.duels for insert with check (
  auth.uid() = player2_id
);
create policy "Duel players can update duel" on public.duels for update using (
  auth.uid() = player1_id or auth.uid() = player2_id
);

-- MESSAGES policies
create policy "Duel participants can read messages" on public.messages for select using (
  exists (
    select 1 from public.duels d
    where d.id = duel_id
    and (d.player1_id = auth.uid() or d.player2_id = auth.uid())
  )
);
create policy "Duel participants can send messages" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.duels d
    where d.id = duel_id
    and (d.player1_id = auth.uid() or d.player2_id = auth.uid())
    and d.status = 'active'
  )
);

-- ALMS DONATIONS policies
create policy "Anyone can read alms" on public.alms_donations for select using (true);
create policy "Authenticated can donate" on public.alms_donations for insert with check (auth.uid() = donor_id);

-- ALMS REQUESTS policies
create policy "Anyone can read open alms requests" on public.alms_requests for select using (true);
create policy "Authenticated can post alms request" on public.alms_requests for insert with check (auth.uid() = requester_id);
create policy "Requester can cancel own request" on public.alms_requests for update using (auth.uid() = requester_id);

-- HOARD policies
create policy "Anyone can read hoard" on public.hoard for select using (true);

-- FUNCTION: handle new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, display_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_initials', upper(left(split_part(new.email, '@', 1), 2)))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
