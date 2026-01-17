import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Eye, CreditCard, X, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInDays, parseISO } from "date-fns";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Booking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  car: {
    title: string;
    brand: string;
    model: string;
    image: string;
    price: number;
  };
  rental_days?: number;
}

const BookingsPage = () => {
  const { user, loading: isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Type cast to ensure status is of type BookingStatus and calculate rental days
        const typedBookings =
          data?.map((booking) => {
            // Calculate rental days
            const startDate = parseISO(booking.start_date);
            const endDate = parseISO(booking.end_date);
            const days = differenceInDays(endDate, startDate) + 1;

            return {
              ...booking,
              status: booking.status as BookingStatus,
              car: booking.car,
              rental_days: days,
            };
          }) || [];

        setBookings(typedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, toast]);

  if (!user && !isLoading) {
    return <Navigate to="/auth/login" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
    }).format(amount);
  };

  const handlePayment = (booking: Booking) => {
    navigate(`/payment/${booking.id}`);
  };

  const handleViewCar = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" as BookingStatus }
            : booking
        )
      );

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Skeleton loader for the table
  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Car</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            {/* Car */}
            <TableCell>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </TableCell>

            {/* Dates */}
            <TableCell>
              <Skeleton className="h-4 w-[140px]" />
            </TableCell>

            {/* Duration with calendar icon */}
            <TableCell>
              <div className="flex items-center text-sm space-x-2">
                <Calendar className="h-3 w-3 opacity-50" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            </TableCell>

            {/* Price */}
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>

            {/* Status */}
            <TableCell>
              <Skeleton className="h-6 w-[80px] rounded-full" />
            </TableCell>

            {/* Actions with menu icon */}
            <TableCell className="text-right">
              <div className="flex justify-end">
                <MoreHorizontal className="h-4 w-4 opacity-50" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your car rental bookings in Addis Ababa
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                All your past and upcoming bookings with Teguaze Ethiopia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You don't have any bookings yet
                  </p>
                  <Button onClick={() => navigate("/cars")}>Browse Cars</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <img
                              src={booking.car.image}
                              alt={booking.car.title}
                              className="h-12 w-12 rounded-md object-cover"
                              loading="lazy"
                            />
                            <div>
                              <div className="font-medium">
                                {booking.car.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.car.brand} {booking.car.model}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(booking.start_date)} -{" "}
                            {formatDate(booking.end_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 opacity-70" />
                            {booking.rental_days}{" "}
                            {booking.rental_days === 1 ? "day" : "days"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(booking.total_price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(booking.status)}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                aria-label="Open menu"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewCar(booking.car_id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Car</span>
                              </DropdownMenuItem>

                              {booking.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handlePayment(booking)}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Pay Now</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    <span>Cancel</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {bookings.length > 0 && (
              <CardFooter className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </>
  );
};

export default BookingsPage;
