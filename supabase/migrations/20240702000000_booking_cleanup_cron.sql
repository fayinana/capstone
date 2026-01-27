
-- Set up a cron job to run the cleanup-bookings function daily at midnight
select
  cron.schedule(
    'daily-booking-cleanup',
    '0 0 * * *', -- Run at midnight every day
    $$
    select net.http_post(
      url := 'https://lsfbhljttfpzcejlkygj.functions.supabase.co/cleanup-bookings',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
    $$
  );
