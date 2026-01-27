
-- Function to invoke the cleanup-bookings edge function
CREATE OR REPLACE FUNCTION invoke_cleanup_bookings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT INTO result
    content::json
  FROM
    http((
      'POST',
      'https://lsfbhljttfpzcejlkygj.supabase.co/functions/v1/cleanup-bookings',
      ARRAY[
        ('Content-Type', 'application/json'),
        ('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZmJobGp0dGZwemNlamxreWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzQ0MzksImV4cCI6MjA1ODcxMDQzOX0.4yWr6aP2KThJPKGVYSop4ktzIyumEHXYwh_I6KC0LhI')
      ],
      '{}',
      30
    ));
  
  RETURN result;
END;
$$;

-- Schedule a daily job to run at midnight
SELECT cron.schedule(
  'cleanup-expired-bookings',  -- job name
  '0 0 * * *',                 -- daily at midnight
  $$SELECT invoke_cleanup_bookings()$$
);
