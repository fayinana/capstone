import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the webhook payload
    const payload = await req.json();

    // Verify the webhook secret (optional but recommended)
    const webhookSecret = Deno.env.get("CHAPA_WEBHOOK_SECRET");
    const signatureHeader = req.headers.get("chapa-signature");

    // Extract tx_ref from the payload
    const { tx_ref, status } = payload;

    if (!tx_ref) {
      throw new Error(
        "Transaction reference (tx_ref) is missing in the webhook payload"
      );
    }

    // Extract booking ID from tx_ref (assuming format: rental-{bookingId}-{timestamp})
    const bookingIdMatch = tx_ref.match(/^rental-([a-zA-Z0-9-]+)-\d+$/);
    if (!bookingIdMatch) {
      throw new Error(`Invalid transaction reference format: ${tx_ref}`);
    }

    const bookingId = bookingIdMatch[1];

    // Update booking payment status based on Chapa status
    if (status === "success") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking payment status:", updateError);
        throw new Error(
          `Failed to update booking payment status: ${updateError.message}`
        );
      }
    } else if (status === "failed") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking payment status:", updateError);
        throw new Error(
          `Failed to update booking payment status: ${updateError.message}`
        );
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing Chapa webhook:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error processing webhook",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
