import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Car, Calendar, Home, ArrowRight } from "lucide-react";

interface BookingDetails {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  car?: {
    title: string;
    brand: string;
    model: string;
    image: string;
  };
}

const PaymentSuccessPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);

        if (!bookingId) {
          throw new Error("Booking ID is missing");
        }

        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            car:car_id (
              title,
              brand,
              model,
              image
            )
          `
          )
          .eq("id", bookingId)
          .single();

        if (error) {
          throw error;
        }

        setBooking(data as BookingDetails);

        // If booking is still pending, update it to confirmed
        if (data && data.status === "pending") {
          const { error: updateError } = await supabase
            .from("bookings")
            .update({ status: "confirmed" })
            .eq("id", bookingId);

          if (updateError) {
            console.error("Error updating booking status:", updateError);
          }
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black pt-20 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
              <div className="h-96 flex flex-col items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-20 h-20 bg-yellow-300/10 rounded-full mb-8"></div>
                  <div className="h-6 w-64 bg-yellow-300/20 rounded mb-4"></div>
                  <div className="h-4 w-48 bg-yellow-300/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black pt-20 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-barlow font-bold mb-4">
                Booking Not Found
              </h1>
              <p className="text-zinc-400 mb-8">
                We couldn't find the booking you're looking for. It may have
                been removed or the link is invalid.
              </p>
              <Button
                onClick={() => navigate("/profile/bookings")}
                className="bg-yellow-300 text-black hover:bg-yellow-400"
              >
                View Your Bookings
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet
        title="Payment Successful | Teguaze "
        description="Your car rental payment was successful. Get ready for your trip!"
        keywords="payment success, car rental, booking confirmation"
      />
      <Header />
      <main className="min-h-screen bg-black pt-20 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-zinc-900 border-green-500/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 p-8 text-center border-b border-green-500/20">
                <div className="inline-flex h-20 w-20 rounded-full bg-green-500/10 items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-barlow font-bold text-white mb-2">
                  Payment Successful!
                </h1>
                <p className="text-zinc-400">
                  Your booking has been confirmed and is ready for your trip.
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                    {booking.car?.image && (
                      <img
                        src={booking.car.image}
                        alt={booking.car.title}
                        className="h-32 w-48 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-1">
                        {booking.car?.title}
                      </h2>
                      <p className="text-zinc-400 mb-3">
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center text-sm text-zinc-300 space-y-2 md:space-y-0 md:space-x-4">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-yellow-300" />
                          <span>{formatDate(booking.start_date)}</span>
                        </div>
                        <div className="hidden md:block text-zinc-500">to</div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-yellow-300" />
                          <span>{formatDate(booking.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 py-4 border-t border-b border-zinc-800">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Booking ID:</span>
                      <span className="font-medium">
                        {booking.id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <span className="font-medium text-green-500">
                        Confirmed
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Amount:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(booking.total_price)}
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-zinc-400 mb-4">
                      A confirmation email has been sent to your email address.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => navigate(`/cars/${booking.car_id}`)}
                        variant="outline"
                        className="border-yellow-300/20 text-yellow-300 hover:bg-yellow-300/10"
                      >
                        <Car className="mr-2 h-4 w-4" />
                        Car Details
                      </Button>
                      <Button
                        onClick={() => navigate("/profile/bookings")}
                        className="bg-yellow-300 text-black hover:bg-yellow-400"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Bookings
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800/50 p-4 text-center border-t border-zinc-700/50">
                <Link
                  to="/"
                  className="inline-flex items-center text-yellow-300 hover:text-yellow-400 transition-colors"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentSuccessPage;
