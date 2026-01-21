import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCarById } from "@/api/cars";
import { Car, ShareData } from "@/types";
import {
  MapPin,
  Users,
  Fuel,
  Calendar as CalendarIcon,
  Settings,
  Zap,
  CheckCircle2,
  Star,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import Helmet from "@/components/Helmet";
import useSimilarCars from "@/hooks/useSimilarCars";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays, addDays, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReviewSection from "@/components/ReviewSection";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const CarDetailPage = () => {
  const { id: carId } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { toast } = useToast();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [numDays, setNumDays] = useState<number>(0);

  const { data: similarCars = [], isLoading: isLoadingSimilarCars } =
    useSimilarCars(car);

  useEffect(() => {
    if (car && dateRange.from && dateRange.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      setNumDays(days);
      setTotalPrice(car.price * days);
    } else {
      setNumDays(0);
      setTotalPrice(0);
    }
  }, [dateRange, car]);

  useEffect(() => {
    const loadCarData = async () => {
      setLoading(true);
      try {
        if (!carId) throw new Error("Car ID is missing");
        const carData = await getCarById(carId);

        if (carData.images && carData.images.length > 0) {
          setMainImage(carData.images[0]);
        } else if (carData.image) {
          setMainImage(carData.image);
        }

        setCar(carData);

        if (user) {
          const { data: bookings } = await supabase
            .from("bookings")
            .select("*")
            .eq("car_id", carId)
            .eq("user_id", user.id)
            .in("status", ["pending", "confirmed"])
            .limit(1);

          setBookingId(bookings && bookings.length > 0 ? bookings[0].id : null);
          setUserHasBooking(bookings && bookings.length > 0);
        }
      } catch (err) {
        console.error("Error loading car:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load car details"),
        );
        toast({
          title: "Error",
          description: "Failed to load car details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      loadCarData();
    }
  }, [carId, navigate, toast, user]);

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book this car",
        variant: "default",
      });
      navigate("/auth/login");
      return;
    }

    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Date Selection Required",
        description: "Please select your rental period",
        variant: "destructive",
      });
      return;
    }

    createBooking();
  };

  const createBooking = async () => {
    if (!user || !car || !dateRange.from || !dateRange.to) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          car_id: car.id,
          user_id: user.id,
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUserHasBooking(true);

      navigate(`/payment/${data.id}`);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description:
          "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!car) return;

    const shareData: ShareData = {
      title: `Teguaze  Ethiopia - ${car.title}`,
      text: `Check out this ${car.year} ${car.brand} ${car.model} available for rent in Addis Ababa!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Car details link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const today = new Date();
  const maxDate = addDays(today, 30);

  const disabledDates = (date: Date) => {
    return date < today || date > maxDate;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center text-white bg-black min-h-screen pt-24">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-96 bg-zinc-800 rounded-lg mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 bg-zinc-800 rounded-lg" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="w-full h-64 bg-zinc-800 rounded-lg mb-4" />
              <Skeleton className="w-full h-40 bg-zinc-800 rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center text-white bg-black min-h-screen pt-24">
          <h1 className="text-3xl font-bold mb-4 font-barlow">
            Error Loading Car Details
          </h1>
          <p className="mb-6 text-white/70">
            There was an error loading the car details. Please try again later.
          </p>
          <Button
            asChild
            className="bg-yellow-300 text-black hover:bg-yellow-400"
          >
            <Link to="/cars">Back to Cars</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center text-white bg-black min-h-screen pt-24">
          <h1 className="text-3xl font-bold mb-4 font-barlow">Car Not Found</h1>
          <p className="mb-6 text-white/70">
            Sorry, the car you're looking for doesn't exist.
          </p>
          <Button
            asChild
            className="bg-yellow-300 text-black hover:bg-yellow-400"
          >
            <Link to="/cars">Back to Cars</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const fuelType = car.fuelType || car.fuel_type;
  const transmission = car.transmission;
  const rating = car.rating || 0;
  const reviewCount = car.reviewCount || car.review_count || 0;
  const images = car.images || [car.image];
  return (
    <>
      <Helmet
        title={`${car.title} | Teguaze  Ethiopia Car Details`}
        description={`Explore the ${car.title} (${car.year}) with ${car.seats} seats and ${fuelType} engine. Available for rent in Addis Ababa at ETB ${car.price}/day.`}
        keywords={`${car.brand}, ${car.title}, car rental, ${fuelType}, ${car.transmission}, Addis Ababa, Ethiopia`}
      />
      <Header />
      <main className="bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-10">
          <Button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 mb-4 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-zinc-900 rounded-lg overflow-hidden mb-4 border border-yellow-300/10">
                <div className="relative">
                  <img
                    src={mainImage || car.image}
                    alt={car.title}
                    className="w-full h-96 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full bg-black/50 border-yellow-300/20 text-white hover:bg-yellow-300/20"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full bg-black/50 border-yellow-300/20 text-white hover:bg-yellow-300/20"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden h-24 border-2 ${
                      mainImage === image
                        ? "border-yellow-300"
                        : "border-transparent"
                    }`}
                    onClick={() => setMainImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${car.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-zinc-900 p-6 rounded-lg shadow-md border border-yellow-300/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-barlow font-bold">
                      {car.title}
                    </h1>
                    <p className="text-white/60">
                      {car.year} • {transmission}
                    </p>
                  </div>
                  <Badge className="bg-yellow-300 text-black hover:bg-yellow-400">
                    Available
                  </Badge>
                </div>

                <div className="flex items-center mb-6">
                  <span className="text-yellow-300 mr-1">★</span>
                  <span className="font-medium">{rating.toFixed(2)}</span>
                  <span className="text-white/60 ml-1">
                    ({reviewCount} reviews)
                  </span>
                </div>

                <div className="mb-6 p-4 bg-black rounded-md border border-yellow-300/10">
                  <div className="mb-4">
                    <label className="block text-white/80 mb-2">
                      Select Rental Period
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal border-yellow-300/20 hover:bg-zinc-800",
                            !dateRange.from && "text-white/60",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                                {format(dateRange.to, "MMM dd, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Select dates</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-zinc-900 border border-yellow-300/20"
                        align="start"
                      >
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={today}
                          selected={dateRange}
                          onSelect={(newDateRange) =>
                            setDateRange(newDateRange as DateRange)
                          }
                          disabled={disabledDates}
                          numberOfMonths={1}
                          className={cn(
                            "p-3 pointer-events-auto text-white bg-zinc-900",
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {numDays > 0 && (
                    <div className="text-white/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Daily Rate:</span>
                        <span>ETB {car.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Duration:</span>
                        <span>
                          {numDays} {numDays === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <div className="border-t border-yellow-300/10 pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span className="text-yellow-300">
                            ETB {totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-yellow-300 text-black hover:bg-yellow-400"
                  onClick={handleBookNow}
                  disabled={userHasBooking || !dateRange.from || !dateRange.to}
                >
                  {userHasBooking
                    ? "Already Booked"
                    : dateRange.from && dateRange.to
                      ? `Book for ETB ${totalPrice}`
                      : "Select Dates to Book"}
                </Button>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-yellow-300 mr-3" />
                    <span className="text-white/80">
                      {car.location}, Addis Ababa
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-yellow-300 mr-3" />
                    <span className="text-white/80">{car.year}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-yellow-300 mr-3" />
                    <span className="text-white/80">{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 text-yellow-300 mr-3" />
                    <span className="capitalize text-white/80">
                      {transmission} Transmission
                    </span>
                  </div>
                  <div className="flex items-center">
                    {fuelType === "electric" ? (
                      <Zap className="w-5 h-5 text-yellow-300 mr-3" />
                    ) : (
                      <Fuel className="w-5 h-5 text-yellow-300 mr-3" />
                    )}
                    <span className="capitalize text-white/80">{fuelType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-yellow-300/10">
                <TabsTrigger
                  value="description"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="description"
                className="p-6 bg-zinc-900 rounded-lg mt-2 border border-yellow-300/10"
              >
                <h3 className="text-xl font-barlow font-semibold mb-4">
                  About This Car
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {car.description}
                </p>
              </TabsContent>
              <TabsContent
                value="features"
                className="p-6 bg-zinc-900 rounded-lg mt-2 border border-yellow-300/10"
              >
                <h3 className="text-xl font-barlow font-semibold mb-4">
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features &&
                    car.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle2
                          className="w-5 h-5 text-yellow-300 mr-2"
                          strokeWidth={1.5}
                        />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                </div>
              </TabsContent>
              <TabsContent
                value="reviews"
                className="p-6 bg-zinc-900 rounded-lg mt-2 border border-yellow-300/10"
              >
                <div className="flex items-center mb-6">
                  <div className="bg-black py-2 px-4 rounded-lg border border-yellow-300/20">
                    <div className="flex items-center">
                      <span className="text-3xl font-barlow font-bold mr-2 text-yellow-300">
                        {rating}
                      </span>
                      <div>
                        <div className="flex mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(rating)
                                  ? "text-yellow-300 fill-yellow-300"
                                  : "text-white/20"
                              }`}
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-white/60">
                          {reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {!user ? (
                  <p className="text-white/60 italic mb-6">
                    Login to see all reviews and leave your own.
                  </p>
                ) : (
                  <ReviewSection
                    bookingId={bookingId}
                    carId={car.id}
                  ></ReviewSection>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-barlow font-bold mb-6">
              Similar Cars You Might Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingSimilarCars ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 rounded-lg overflow-hidden shadow-sm border border-yellow-300/10"
                    >
                      <Skeleton className="h-48 bg-zinc-800 w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                        <Skeleton className="h-6 w-1/4 bg-zinc-800" />
                      </div>
                    </div>
                  ))}
                </>
              ) : similarCars.length > 0 ? (
                similarCars.map((similarCar) => (
                  <div
                    key={similarCar.id}
                    className="bg-zinc-900 rounded-lg overflow-hidden shadow-sm border border-yellow-300/10 hover:border-yellow-300/30 transition-colors"
                  >
                    <Link to={`/cars/${similarCar.id}`} className="block">
                      <div className="relative">
                        <img
                          src={similarCar.image}
                          alt={similarCar.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-barlow font-semibold text-lg">
                          {similarCar.title}
                        </h3>
                        <p className="text-yellow-300 font-bold mt-2">
                          ETB {similarCar.price}/day
                        </p>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-white/60">
                  No similar cars found at the moment
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CarDetailPage;
