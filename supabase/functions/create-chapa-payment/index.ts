import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const CHAPA_SECRET_KEY = Deno.env.get("CHAPA_SECRET_KEY");

    if (!CHAPA_SECRET_KEY) {
      throw new Error("CHAPA_SECRET_KEY is not set in environment variables");
    }

    const { amount, email, firstName, lastName, bookingId, returnUrl, phone } =
      await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount provided");
    }

    if (!email) {
      throw new Error("Email is required for payment processing");
    }

    if (!firstName || !lastName) {
      throw new Error("First name and last name are required");
    }

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    if (!returnUrl) {
      throw new Error("Return URL is required");
    }

    // Generate a unique transaction reference
    const tx_ref = `rental-${bookingId}-${Date.now()}`;

    // Sanitize description to only include allowed characters
    // According to Chapa API, description can only contain letters, numbers, hyphens, underscores, spaces, and dots
    // and must not exceed 50 characters
    const sanitizedBookingId = bookingId
      .slice(0, 8)
      .replace(/[^a-zA-Z0-9-_.]/g, "");

    // Create payment request to Chapa API using fetch
    const response = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "ETB",
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || "",
          tx_ref,
          callback_url: returnUrl,
          return_url: returnUrl,
          customization: {
            title: "CarRentalPay", // Max 16 chars, no spaces to be safe
            description: `Booking ${sanitizedBookingId}`, // Properly sanitized and shortened
          },
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Chapa API error:", responseData);

      // Improved error handling with detailed error message
      let errorMessage = "Failed to initialize Chapa payment";

      if (responseData.message) {
        if (typeof responseData.message === "object") {
          // Handle structured validation errors
          errorMessage = Object.entries(responseData.message)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`
            )
            .join("; ");
        } else {
          errorMessage = responseData.message;
        }
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Return the checkout URL and transaction reference
    return new Response(
      JSON.stringify({
        checkout_url: responseData.data.checkout_url,
        tx_ref,
        paymentUrl: responseData.data.checkout_url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Chapa payment:", error);

    // Ensure detailed error message is returned
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
