import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function will be triggered by a cron job to clean up expired bookings
Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    // First, mark completed bookings
    const { data: completedBookings, error: completedError } =
      await supabaseAdmin
        .from("bookings")
        .update({ status: "completed" })
        .eq("status", "confirmed")
        .lt("end_date", today)
        .select();

    if (completedError) {
      throw completedError;
    }

    // Then, delete bookings that were completed more than 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const cutoffDate = ninetyDaysAgo.toISOString().split("T")[0];

    const { data: deletedBookings, error: deleteError } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("status", "completed")
      .lt("end_date", cutoffDate)
      .select();

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({
        completedCount: completedBookings?.length || 0,
        deletedCount: deletedBookings?.length || 0,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error cleaning up bookings:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
