/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import CarsFilter from "@/components/CarsFilter";
import { useQuery } from "@tanstack/react-query";
import { getCars } from "@/api/cars";
import { Car } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, ArrowUpDown, Car as CarIcon } from "lucide-react";
import Helmet from "@/components/Helmet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1"),
  );
  const PAGE_SIZE = 6;

  // Extract search params and apply filters
  useEffect(() => {
    const filters: any = {};
    const location = searchParams.get("location");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const fuelType = searchParams.get("fuelType");
    const transmission = searchParams.get("transmission");
    const page = searchParams.get("page");

    if (location) filters.location = location;
    if (brand) filters.brand = brand;
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (fuelType) filters.fuelType = fuelType;
    if (transmission) filters.transmission = transmission;
    if (page) setCurrentPage(parseInt(page));

    setAppliedFilters(filters);
  }, [searchParams]);

  // Fetch cars with applied filters and pagination
  const {
    data: carsData = { cars: [], totalCount: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cars", appliedFilters, currentPage, PAGE_SIZE],
    queryFn: () =>
      getCars({ ...appliedFilters, page: currentPage, limit: PAGE_SIZE }),
  });

  const { cars = [], totalCount = 0 } = carsData;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Apply sorting to the cars list
  const sortedCars = [...(cars || [])].sort((a, b) => {
    const valueA = sortBy === "price" ? a.price : a.rating || 0;
    const valueB = sortBy === "price" ? b.price : b.rating || 0;
    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });

  // Handle sorting
  const handleSort = (by: "price" | "rating") => {
    if (sortBy === by) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(by);
      setSortOrder("asc");
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  // Generate pagination items
  const generatePagination = () => {
    const items = [];
    const maxVisiblePages = 5;

    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => currentPage !== 1 && handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    // Calculate start and end pages
    const startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisiblePages / 2),
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => currentPage !== i && handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() =>
              currentPage !== totalPages && handlePageChange(totalPages)
            }
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  // CarCard skeleton for loading state
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

  return (
    <>
      <Helmet
        title="Browse Cars | Teguaze "
        description="Browse our selection of rental cars in Addis Ababa. Find the perfect car for your needs at affordable prices."
        keywords="car rental, Addis Ababa, Ethiopia, affordable cars, luxury cars, SUV, sedan"
      />
      <Header />
      <main className="pt-20 bg-black text-white min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2 font-barlow">
            Browse <span className="text-yellow-300">Cars</span>
          </h1>
          <p className="text-gray-400 mb-6">
            Find the perfect car for your journey in Ethiopia
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with filters */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-lg border border-yellow-300/10 sticky top-24">
                <CarsFilter initialValues={appliedFilters} />
              </div>
            </div>

            {/* Main content with cars */}
            <div className="lg:col-span-3">
              {/* Sort controls */}
              <div className="bg-zinc-900 rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center border border-yellow-300/10">
                <div className="flex items-center mb-4 sm:mb-0">
                  <SlidersHorizontal className="mr-2 h-5 w-5 text-yellow-300" />
                  <span className="font-medium">Sort By:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortBy === "price" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("price")}
                    className={
                      sortBy === "price"
                        ? "bg-yellow-300 text-black hover:bg-yellow-400"
                        : "border-yellow-300/20"
                    }
                  >
                    Price{" "}
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 ${
                        sortBy === "price" ? "text-black" : "text-yellow-300"
                      }`}
                    />
                  </Button>
                  <Button
                    variant={sortBy === "rating" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("rating")}
                    className={
                      sortBy === "rating"
                        ? "bg-yellow-300 text-black hover:bg-yellow-400"
                        : "border-yellow-300/20"
                    }
                  >
                    Rating{" "}
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 ${
                        sortBy === "rating" ? "text-black" : "text-yellow-300"
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Cars grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <CarCardSkeleton key={index} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <div className="text-red-500 mb-4">
                    Error loading cars. Please try again.
                  </div>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-yellow-300 text-black hover:bg-yellow-400"
                  >
                    Retry
                  </Button>
                </div>
              ) : sortedCars.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900 rounded-lg border border-yellow-300/10">
                  <CarIcon className="h-16 w-16 mx-auto text-yellow-300/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Cars Found</h3>
                  <p className="text-gray-400 mb-4">
                    We couldn't find any cars matching your criteria. Please try
                    adjusting your filters.
                  </p>
                  <Button
                    onClick={() => {
                      searchParams.delete("brand");
                      searchParams.delete("location");
                      searchParams.delete("minPrice");
                      searchParams.delete("maxPrice");
                      searchParams.delete("fuelType");
                      searchParams.delete("transmission");
                      searchParams.set("page", "1");
                      setSearchParams(searchParams);
                    }}
                    className="bg-yellow-300 text-black hover:bg-yellow-400"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-gray-400">
                      Showing{" "}
                      <span className="text-white">
                        {sortedCars.length} of {totalCount}
                      </span>{" "}
                      cars
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedCars.map((car: Car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                currentPage > 1 &&
                                handlePageChange(currentPage - 1)
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {generatePagination()}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                currentPage < totalPages &&
                                handlePageChange(currentPage + 1)
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CarsPage;
