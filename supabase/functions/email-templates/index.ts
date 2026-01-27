import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Email templates for different scenarios
const templates = {
  welcome: {
    subject: "Welcome to Teguaze !",
    html: (data: { firstName: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Teguaze </title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #000;
            padding: 20px;
            text-align: center;
            color: #eab308;
            font-weight: bold;
            font-size: 24px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
          }
          .footer {
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
            border: 1px solid #ddd;
          }
          .button {
            background-color: #eab308;
            color: #000;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Teguaze 
        </div>
        <div class="content">
          <h2>Welcome to Teguaze , ${data.firstName || "Valued Customer"}!</h2>
          <p>We're excited to have you on board! Teguaze  is your premium destination for car rentals in Ethiopia.</p>
          <p>With our service, you can:</p>
          <ul>
            <li>Browse a wide selection of vehicles</li>
            <li>Book and manage your rentals online</li>
            <li>Enjoy competitive rates and special offers</li>
            <li>Experience hassle-free pick-up and drop-off</li>
          </ul>
          <div style="text-align: center;">
            <a href="https://Teguaze .com/cars" class="button">Explore Available Cars</a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>
        </div>
        <div class="footer">
          &copy; 2023 Teguaze  | Addis Ababa, Ethiopia<br>
          <a href="https://Teguaze .com/terms">Terms of Service</a> | <a href="https://Teguaze .com/privacy">Privacy Policy</a>
        </div>
      </body>
      </html>
    `,
  },
  booking_confirmation: {
    subject: "Your Teguaze  Booking Confirmation",
    html: (data: {
      bookingId: string;
      car: string;
      startDate: string;
      endDate: string;
      totalPrice: number;
    }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #000;
            padding: 20px;
            text-align: center;
            color: #eab308;
            font-weight: bold;
            font-size: 24px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
          }
          .booking-details {
            background-color: #fff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #eee;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .footer {
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
            border: 1px solid #ddd;
          }
          .button {
            background-color: #eab308;
            color: #000;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .price {
            font-size: 24px;
            font-weight: bold;
            color: #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Teguaze 
        </div>
        <div class="content">
          <h2>Your Booking is Confirmed!</h2>
          <p>Thank you for choosing Teguaze  for your car rental needs. Your booking details are below:</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <strong>Booking Reference:</strong>
              <span>${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <strong>Vehicle:</strong>
              <span>${data.car}</span>
            </div>
            <div class="detail-row">
              <strong>Pick-up Date:</strong>
              <span>${data.startDate}</span>
            </div>
            <div class="detail-row">
              <strong>Return Date:</strong>
              <span>${data.endDate}</span>
            </div>
            <div class="detail-row">
              <strong>Total Price:</strong>
              <span class="price">$${data.totalPrice}</span>
            </div>
          </div>
          
          <p>We've sent the full details to your registered email address. You can also view your booking in your account dashboard.</p>
          
          <div style="text-align: center;">
            <a href="https://Teguaze .com/profile/bookings" class="button">View My Booking</a>
          </div>
          
          <p>If you need to make any changes to your booking or have any questions, please contact us as soon as possible.</p>
        </div>
        <div class="footer">
          &copy; 2023 Teguaze  | Addis Ababa, Ethiopia<br>
          <a href="https://Teguaze .com/terms">Terms of Service</a> | <a href="https://Teguaze .com/privacy">Privacy Policy</a>
        </div>
      </body>
      </html>
    `,
  },
  password_reset: {
    subject: "Reset Your Teguaze  Password",
    html: (data: { resetLink: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #000;
            padding: 20px;
            text-align: center;
            color: #eab308;
            font-weight: bold;
            font-size: 24px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
          }
          .footer {
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
            border: 1px solid #ddd;
          }
          .button {
            background-color: #eab308;
            color: #000;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid #ffeeba;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Teguaze 
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your Teguaze  account password. If you didn't make this request, you can safely ignore this email.</p>
          
          <div style="text-align: center;">
            <a href="${data.resetLink}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #eee; padding: 10px; border-radius: 4px;">${data.resetLink}</p>
          
          <div class="warning">
            <strong>Note:</strong> This link is valid for 24 hours. After that, you'll need to request a new password reset.
          </div>
        </div>
        <div class="footer">
          &copy; 2023 Teguaze  | Addis Ababa, Ethiopia<br>
          <a href="https://Teguaze .com/terms">Terms of Service</a> | <a href="https://Teguaze .com/privacy">Privacy Policy</a>
        </div>
      </body>
      </html>
    `,
  },
};

// Handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        message: "Email templates API is running",
        available_templates: Object.keys(templates),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // For POST requests to send or get template HTML
  if (req.method === "POST") {
    try {
      const { templateName, data } = await req.json();

      if (!templateName || !templates[templateName as keyof typeof templates]) {
        return new Response(JSON.stringify({ error: "Template not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const template = templates[templateName as keyof typeof templates];
      const html = template.html(data);

      return new Response(
        JSON.stringify({
          subject: template.subject,
          html: html,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // For other methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
