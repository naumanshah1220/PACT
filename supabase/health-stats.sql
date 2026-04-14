-- Run this in the Supabase SQL Editor
-- Adds a function the health-check API can call to get usage stats

create or replace function public.get_db_stats()
returns json language sql security definer as $$
  select json_build_object(
    'db_size_mb',    pg_database_size(current_database()) / 1024 / 1024,
    'message_count', (select count(*) from public.messages),
    'active_duels',  (select count(*) from public.duels where status = 'active'),
    'user_count',    (select count(*) from public.users),
    'open_wagers',   (select count(*) from public.wagers where status = 'open')
  );
$$;
