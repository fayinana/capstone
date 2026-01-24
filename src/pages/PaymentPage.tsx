import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import PaymentStripe from "@/components/PaymentStripe";
import PaymentChapa from "@/components/PaymentChapa";
import { differenceInDays, parseISO } from "date-fns";

interface BookingDetails {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  car: {
    title: string;
    brand: string;
    model: string;
    image: string;
    price: number;
  };
}

const PaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [rentalDays, setRentalDays] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: isLoading } = useAuth();

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
              image,
              price
            )
          `
          )
          .eq("id", bookingId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Booking not found");
        }

        setBooking({
          ...data,
          status: data.status as
            | "pending"
            | "confirmed"
            | "cancelled"
            | "completed",
        });

        // Calculate the number of rental days
        const startDate = parseISO(data.start_date);
        const endDate = parseISO(data.end_date);
        const days = differenceInDays(endDate, startDate) + 1;
        setRentalDays(days);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
        navigate("/profile/bookings");
      } finally {
        setLoading(false);
      }
    };

    if (user && bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, user, navigate, toast]);

  if (!user && !isLoading) {
    return <Navigate to="/auth/login" />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSimulatePayment = async () => {
    try {
      setProcessingPayment(true);

      // Simulating payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update booking status to confirmed
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", booking?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed.",
      });

      navigate(`/payment/success/${booking?.id}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <main className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="mb-6">
              The booking you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button onClick={() => navigate("/profile/bookings")}>
              Back to My Bookings
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Complete Your Payment</h1>
            <p className="text-muted-foreground">
              Choose your preferred payment method
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs defaultValue="stripe">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="chapa">Chapa</TabsTrigger>
                </TabsList>

                <TabsContent value="stripe">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pay with Stripe</CardTitle>
                      <CardDescription>
                        Secure and fast payment with credit or debit card
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PaymentStripe
                        amount={booking.total_price}
                        bookingId={booking.id}
                        onSuccess={() =>
                          navigate(`/payment/success/${booking?.id}`)
                        }
                      />
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        Your card information is encrypted and secure with
                        Stripe
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="chapa">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pay with Chapa</CardTitle>
                      <CardDescription>
                        Local payment options for Ethiopian customers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PaymentChapa
                        amount={booking.total_price}
                        bookingId={booking.id}
                        onSuccess={() =>
                          navigate(`/payment/success/${booking?.id}`)
                        }
                      />
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        Secure payments with Chapa, supporting multiple local
                        payment methods
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* For demo purposes - simulate payment success */}
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={handleSimulatePayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Simulate Successful Payment (Demo)"
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.car.image}
                        alt={booking.car.title}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{booking.car.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.car.brand} {booking.car.model}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Rental Period:</span>
                        <span className="text-sm font-medium">
                          {formatDate(booking.start_date)} -{" "}
                          {formatDate(booking.end_date)}
                        </span>
                      </div>

                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Duration:</span>
                        <span className="text-sm font-medium">
                          {rentalDays} {rentalDays === 1 ? "day" : "days"}
                        </span>
                      </div>

                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Daily Rate:</span>
                        <span className="text-sm font-medium">
                          {booking.car.price &&
                            formatCurrency(booking.car.price)}
                        </span>
                      </div>

                      <div className="flex justify-between mb-4">
                        <span className="text-sm">Status:</span>
                        <span className="text-sm font-medium capitalize px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(booking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/profile/bookings")}
                  >
                    Return to Bookings
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentPage;
