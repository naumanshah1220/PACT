-- Enable pg_cron extension (run as superuser in Supabase dashboard)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Resolve expired duels every 5 minutes
SELECT cron.schedule(
  'resolve-expired-duels',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/resolve-expired-duels',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body := '{}'
  );
  $$
);

-- Midnight gold grants
SELECT cron.schedule(
  'midnight-gold-grants',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/midnight-grants',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body := '{}'
  );
  $$
);
