import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  ChevronRight,
  ArrowRightCircle,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import CarCard from "@/components/CarCard";
import { CARS } from "@/data/cars";
import Helmet from "@/components/Helmet";
import Banner from "@/components/Banner";
import BrandLogos from "@/components/BrandLogos";
import Service from "@/components/Service";
import { useQuery } from "@tanstack/react-query";
import { getCars } from "@/api/cars";
import { Skeleton } from "@/components/ui/skeleton";

const CarCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden bg-zinc-900 border border-yellow-300/10">
    <Skeleton className="h-48 w-full bg-zinc-800" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-6 w-3/4 bg-zinc-800" />
      <Skeleton className="h-4 w-1/2 bg-zinc-800" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-4 w-1/4 bg-zinc-800" />
        <Skeleton className="h-4 w-1/4 bg-zinc-800" />
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full bg-zinc-800" />
        ))}
      </div>
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-5 w-1/3 bg-zinc-800" />
        <Skeleton className="h-9 w-1/4 rounded-md bg-zinc-800" />
      </div>
    </div>
  </div>
);

const carLogos = [
  {
    name: "Mercedes-Benz",
    src: "https://www.carlogos.org/car-logos/mercedes-benz-logo.png",
  },
  {
    name: "Tesla",
    src: "https://www.carlogos.org/car-logos/tesla-logo.png",
  },
  {
    name: "BMW",
    src: "https://www.carlogos.org/car-logos/bmw-logo.png",
  },
  {
    name: "Renault",
    src: "https://www.carlogos.org/car-logos/renault-logo.png",
  },
  {
    name: "Ford",
    src: "https://www.carlogos.org/car-logos/ford-logo.png",
  },
  {
    name: "Porsche",
    src: "https://www.carlogos.org/car-logos/porsche-logo.png",
  },
];

const Index = () => {
  // Fetch cars with applied filters
  const {
    data: featuredCars = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cars"],
    queryFn: () => getCars(),
  });
  const testimonials = [
    {
      id: 1,
      text: "Teguaze  made my trip to Addis Ababa seamless. The car was in perfect condition and the booking process was super easy!",
      author: "Daniel T.",
      location: "Addis Ababa",
    },
    {
      id: 2,
      text: "Excellent service and a great selection of cars. The prices are competitive and the staff was very helpful throughout the rental process.",
      author: "Meron A.",
      location: "Dire Dawa",
    },
    {
      id: 3,
      text: "I've used many car rental services before, but Teguaze  stands out for their reliability and customer service. Highly recommended!",
      author: "Eyob M.",
      location: "Hawassa",
    },
  ];

  const services = [
    {
      title: "BRAKES AND SUSPENSION",
      description:
        "We ensure proper brake and suspension adjustments to provide safe handling on all roads in all conditions.",
    },
    {
      title: "EXTERIOR ACCESSORIES",
      description:
        "Enhance your vehicle's appearance and functionality with our premium exterior accessories.",
    },
    {
      title: "ENGINE COMPONENTS",
      description:
        "We provide high-quality engine components designed for maximum performance and durability.",
    },
    {
      title: "MAINTENANCE ESSENTIALS",
      description:
        "Keep your car running smoothly with our comprehensive selection of maintenance essentials.",
    },
  ];

  return (
    <>
      <Helmet
        title="Teguaze  | Premium Car Parts & Rental Services"
        description="Experience the best in automotive with Teguaze . We provide premium car rentals and authentic parts service. Explore our range and book today."
        keywords="car rental, premium cars, car parts, automotive parts, car service, brakes, engine components, maintenance"
      />
      {/* <Header /> */}
      <main className="bg-black text-white">
        {/* Hero Section */}
        <Banner />
        {/* Brand Logos */}
        <section className="bg-zinc-900 py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
              {carLogos.map((logo, index) => (
                <BrandLogos logo={logo} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Discount Banner */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="bg-zinc-900 rounded-lg overflow-hidden relative">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                <div className="p-8 md:p-12">
                  <h2 className="text-2xl md:text-4xl font-barlow font-bold mb-4">
                    GET <span className="text-yellow-300">80% OFF</span> FROM
                    ANY BRANDS
                  </h2>
                  <p className="mb-6 text-white/70">
                    Let us know the car issues we will fix them. Limited time
                    offer.
                  </p>
                  <div className="flex gap-x-4 lg:gap-x-8 justify-center items-center flex-wrap">
                    <div className="bg-yellow-300/10 rounded-md p-4 inline-block mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-yellow-300 text-black rounded-md h-12 w-12 flex items-center justify-center">
                          <span className="font-barlow font-bold text-xl">
                            24
                          </span>
                        </div>
                        <div>
                          <p className="text-yellow-300 text-sm">
                            9:00 am - 7:00 pm
                          </p>
                          <p className="text-white/60 text-xs">
                            Business Hours
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-yellow-300 text-black hover:bg-yellow-400"
                      asChild
                    >
                      <Link to="/contact" className="!text-black">
                        CONTACT US
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2670&auto=format&fit=crop"
                    alt="Luxury car on offer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-barlow font-bold">
                SERVICES
              </h2>
              <div className="w-20 h-1 bg-yellow-300 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <Service service={service} index={index} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2583&auto=format&fit=crop"
                alt="Car showcase"
                className="rounded-lg mx-auto mb-6 max-h-80 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-barlow font-bold">
                Why <span className="text-yellow-300">Choose Us</span> for Your
                Car Parts
              </h2>
              <div className="w-20 h-1 bg-yellow-300 mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="bg-black p-6 rounded-lg border border-yellow-300/10 hover:border-yellow-300/30 transition-all hover:translate-y-[-5px]">
                <div className="mb-4 w-16 h-16 bg-yellow-300/10 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-barlow font-bold text-xl mb-3">
                  Wide Range of Parts
                </h3>
                <p className="text-white/70 mb-4">
                  Our inventory boasts a vast collection of parts from all major
                  manufacturers. Whether you need OEM, aftermarket, or
                  performance parts, we've got you covered.
                </p>
                <div className="w-10 h-1 bg-yellow-300"></div>
              </div>

              <div className="bg-black p-6 rounded-lg border border-yellow-300/10 hover:border-yellow-300/30 transition-all hover:translate-y-[-10px]">
                <div className="mb-4 w-16 h-16 bg-yellow-300/10 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-barlow font-bold text-xl mb-3">
                  Quality Assurance
                </h3>
                <p className="text-white/70 mb-4">
                  We understand the importance of quality parts for your
                  vehicle. That's why we thoroughly inspect every part to ensure
                  it meets our stringent standards.
                </p>
                <div className="w-10 h-1 bg-yellow-300"></div>
              </div>

              <div className="bg-black p-6 rounded-lg border border-yellow-300/10 hover:border-yellow-300/30 transition-all hover:translate-y-[-10px]">
                <div className="mb-4 w-16 h-16 bg-yellow-300/10 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <h3 className="font-barlow font-bold text-xl mb-3">
                  Fast Shipping
                </h3>
                <p className="text-white/70 mb-4">
                  We understand that getting your car back on the road is
                  important. That's why we offer fast shipping options to get
                  your parts to you as quickly as possible.
                </p>
                <div className="w-10 h-1 bg-yellow-300"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Cars */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl md:text-4xl font-barlow font-bold">
                Featured <span className="text-yellow-300">Cars</span>
              </h2>
              <Button
                variant="outline"
                className="border-yellow-300/50 text-white hover:bg-yellow-300 hover:!text-black"
                asChild
              >
                <Link to="/cars" className="group">
                  View All{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3].map((index) => <CarCardSkeleton key={index} />)
              ) : Array.isArray(featuredCars) ? (
                <p className="col-span-3 text-center py-8 text-white/70">
                  No cars available at the moment.
                </p>
              ) : featuredCars?.cars?.length > 0 ? (
                featuredCars?.cars
                  .slice(0, 3)
                  .map((car) => <CarCard key={car.id} car={car} />)
              ) : (
                <p className="col-span-3 text-center py-8 text-white/70">
                  No cars available at the moment.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-zinc-900 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-barlow font-bold mb-8">
                Our <span className="text-yellow-300">Features</span>
              </h2>

              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Advanced Safety Features
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Infotainment and Connectivity
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Driver Assistance and Automation
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Comfort and Convenience
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Premium Audio Systems
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Advanced Lighting
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-yellow-300 mr-3"></span>
                  <span className="font-barlow font-medium text-lg">
                    Advanced Navigation Systems
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop"
              alt="Luxury car silhouette"
              className="object-cover h-full w-full opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent"></div>
          </div>
        </section>

        {/* Join Us Call to Action */}
        <section className="py-20 bg-black relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-barlow font-bold mb-6">
                Prepared to <span className="text-yellow-300">Join</span> You On
                Your Adventure
              </h2>
              <p className="text-white/70 mb-8">
                Lorem ipsum is simply dummy text of the printing and typesetting
                industry. Lorem ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
              <Button
                className="bg-yellow-300 !text-black hover:bg-yellow-400"
                size="lg"
                asChild
              >
                <Link to="/contact">CONTACT US</Link>
              </Button>
            </div>
          </div>

          <div className="w-full h-40 absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 w-full h-full"
            >
              <path
                fillOpacity="0.05"
                fill="#FFD249"
                d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,208C960,203,1056,117,1152,101.3C1248,85,1344,139,1392,165.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-zinc-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-center mb-12">
              What Our Customers <span className="text-yellow-300">Say</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-black p-6 rounded-lg border border-yellow-300/10"
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-300">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-white/80 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-300/20 flex items-center justify-center mr-3">
                      <span className="text-yellow-300 font-bold">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-white/60">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search Form Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-barlow font-bold mb-4">
                Find Your Perfect <span className="text-yellow-300">Car</span>
              </h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Use our advanced search to find the perfect car for your needs
              </p>
            </div>
            <SearchForm className="bg-zinc-900 border border-yellow-300/20" />
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
