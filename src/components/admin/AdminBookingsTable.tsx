import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  Ban,
  Car as CarIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Booking, Car } from "@/types";
import exp from "constants";
import { log } from "console";

// Extended Booking type to include payment_status
interface ExtendedBooking extends Booking {
  payment_status?: "pending" | "paid" | "failed";
}

// Interface for Supabase booking data
interface SupabaseBooking {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status?: string;
  total_price: number;
  created_at: string;
  updated_at?: string;
  cars?: any;
  user?: any;
}

const AdminBookingsTable = () => {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] =
    useState<ExtendedBooking | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "cancel" | null>(
    null
  );
  const queryClient = useQueryClient();
  const {
    data: bookings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      // const { data, error } = await supabase
      //   .from("bookings")
      //   .select(
      //     `
      //     *,
      //     car:car_id (
      //       id, title, brand, model, image, year, price, location,
      //       transmission, seats, fuel_type, features, images, description
      //     ),
      //     user:user_id (
      //       id, email
      //     )
      //   `
      //   )
      //   .order("created_at", { ascending: false });
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          cars (
          id , title, brand, model, image, year, price, location,
          transmission, seats, fuel_type, features, images, description
          )
        `
        )
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching bookings:", error);
        throw error; // This will trigger the error state in the query
      }

      // Process the data to match our expected types
      const processedData = data.map((booking: SupabaseBooking) => {
        const bookingData: ExtendedBooking = {
          ...booking,
          status:
            (booking.status as
              | "pending"
              | "confirmed"
              | "completed"
              | "cancelled") || "pending",
          payment_status:
            (booking.payment_status as "pending" | "paid" | "failed") ||
            "pending",
          car: booking.cars
            ? ({
                ...booking.cars,
                fuelType: booking.cars?.fuel_type,
                availableFrom: new Date(),
                availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                rating: 4.5,
                reviewCount: 10,
                review_count: 10,
              } as Car)
            : undefined,
        };
        return bookingData;
      });

      return processedData;
    },
  }); // Check for expired bookings and clean them up
  useEffect(() => {
    const cleanupExpiredBookings = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Find completed bookings (end date has passed)
        const { data: expiredBookings, error: findError } = await supabase
          .from("bookings")
          .select("id")
          .eq("status", "confirmed")
          .lt("end_date", today);
        if (findError) {
          console.error("Error finding expired bookings:", findError);
          return;
        }

        if (expiredBookings && expiredBookings.length > 0) {
          // Update bookings to completed status
          const { error: updateError } = await supabase
            .from("bookings")
            .update({ status: "completed" })
            .in(
              "id",
              expiredBookings.map((b) => b.id)
            );

          if (updateError) {
            console.error("Error updating expired bookings:", updateError);
          } else {
            refetch();
          }
        }
      } catch (error) {
        console.error("Error in booking cleanup:", error);
      }
    };

    // Run the cleanup when component mounts
    cleanupExpiredBookings();

    // Also run the cleanup every 24 hours
    const interval = setInterval(cleanupExpiredBookings, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleAction = async () => {
    if (!selectedBooking || !actionType) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: actionType === "confirm" ? "confirmed" : "cancelled",
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      toast({
        title:
          actionType === "confirm" ? "Booking Confirmed" : "Booking Cancelled",
        description: `Booking #${selectedBooking.id.substring(0, 8)} has been ${
          actionType === "confirm" ? "confirmed" : "cancelled"
        }.`,
        variant: actionType === "confirm" ? "default" : "destructive",
      });

      refetch();
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Could not update booking status",
        variant: "destructive",
      });
    } finally {
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border border-green-500/30";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border border-red-500/30";
      default:
        return "bg-yellow-300/10 text-yellow-300 border border-yellow-300/30";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-300/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow>
                <TableHead className="font-semibold text-white">
                  Booking
                </TableHead>
                <TableHead className="font-semibold text-white">Car</TableHead>
                <TableHead className="font-semibold text-white">
                  Dates
                </TableHead>
                <TableHead className="font-semibold text-white">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-white">
                  Price
                </TableHead>
                <TableHead className="font-semibold text-white text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((item) => (
                <TableRow key={item} className="border-t border-yellow-300/10">
                  <TableCell>
                    <Skeleton className="h-10 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-300/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900 text-center">
            <TableRow>
              <TableHead className="font-semibold text-white">
                Booking
              </TableHead>
              <TableHead className="font-semibold text-white">Car</TableHead>
              <TableHead className="font-semibold text-white">Dates</TableHead>
              <TableHead className="font-semibold text-white">Status</TableHead>
              <TableHead className="font-semibold text-white">Price</TableHead>
              <TableHead className="font-semibold text-white text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="border-t border-yellow-300/10 text-start"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        #{booking.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {booking.car?.image && (
                        <img
                          src={booking.car.image}
                          alt={booking.car.title}
                          className="h-10 w-10 object-cover rounded-md"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <p className="font-medium">{booking.car?.title}</p>
                        <p className="text-sm text-zinc-500">
                          {booking.car?.brand} {booking.car?.model}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(booking.start_date).toLocaleDateString()} -
                      </span>
                      <span className="font-medium">
                        {new Date(booking.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ETB {booking.total_price.toFixed(2)}
                    </span>
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
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-zinc-900 border-yellow-300/20"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            window.location.href = `/cars/${booking.car_id}`;
                          }}
                        >
                          <CarIcon className="mr-2 h-4 w-4" />
                          <span>View Car</span>
                        </DropdownMenuItem>
                        {booking.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActionType("confirm");
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Confirm Booking</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActionType("cancel");
                              }}
                              className="text-red-500 focus:text-red-500"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Cancel Booking</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-zinc-500"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!selectedBooking && !!actionType}
        onOpenChange={() => {
          setSelectedBooking(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent className="bg-zinc-900 border-yellow-300/20">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "confirm" ? "Confirm Booking" : "Cancel Booking"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "confirm"
                ? `Are you sure you want to confirm booking #${selectedBooking?.id.substring(
                    0,
                    8
                  )}?`
                : `Are you sure you want to cancel booking #${selectedBooking?.id.substring(
                    0,
                    8
                  )}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">
              No, go back
            </AlertDialogCancel>
            <AlertDialogAction
              className={`${
                actionType === "confirm"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
              onClick={handleAction}
            >
              {actionType === "confirm"
                ? "Yes, confirm booking"
                : "Yes, cancel booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBookingsTable;
