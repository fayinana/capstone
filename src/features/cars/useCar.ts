import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car } from "@/types";
import { handleError, NotFoundError } from "@/utils/errors";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// Helper function to transform DB car to frontend Car type
const mapDbCarToFrontend = (dbCar: any): Car => {
  if (!dbCar) return {} as Car;

  // Ensure transmission is a valid value
  const transmission =
    dbCar.transmission === "automatic" || dbCar.transmission === "manual"
      ? dbCar.transmission
      : "automatic"; // Default to automatic if invalid

  return {
    id: dbCar.id,
    brand: dbCar.brand || "",
    model: dbCar.model || "",
    description: dbCar.description || "",
    price: dbCar.price || 0,
    location: dbCar.location || "",
    year: dbCar.year || new Date().getFullYear(),
    fuel_type:
      (dbCar.fuel_type as "petrol" | "diesel" | "electric" | "hybrid") ||
      "petrol",
    fuelType:
      (dbCar.fuel_type as "petrol" | "diesel" | "electric" | "hybrid") ||
      "petrol",
    transmission: transmission,
    seats: dbCar.seats || 4,
    image: dbCar.image || "",
    images: dbCar.images || [dbCar.image] || [],
    features: dbCar.features || [],
    rating: dbCar.rating || 4.5,
    reviewCount: dbCar.review_count || 10,
    review_count: dbCar.review_count || 10,
    title: dbCar.title || `${dbCar.brand || ""} ${dbCar.model || ""}`,
    owner_id: dbCar.owner_id,
    created_at: dbCar.created_at,
    updated_at: dbCar.updated_at,
    availableFrom: dbCar.available_from || null,
    availableTo: dbCar.available_to || null,
  };
};

export const fetchCars = async (): Promise<Car[]> => {
  try {
    // Fetch from Supabase
    const { data, error } = await supabase.from("cars").select("*");

    if (error) {
      console.error("Error fetching cars from Supabase:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("No cars found");
    }

    // Map the data to our Car type
    return (data || []).map(mapDbCarToFrontend);
  } catch (error) {
    console.error("Error in fetchCars:", error);
    throw handleError(error); // Transform to our app error format
  }
};

export const fetchCarById = async (id: string): Promise<Car> => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError(`Car with ID ${id} not found`);
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundError(`Car with ID ${id} not found`);
    }

    return mapDbCarToFrontend(data);
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error);
    throw handleError(error);
  }
};

const useCars = (options: any = {}) => {
  const { handleApiError } = useErrorHandler();

  return useQuery<Car[]>({
    queryKey: ["cars"],
    queryFn: fetchCars,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    onError: (error) => {
      handleApiError(error, {
        fallbackMessage: "Failed to load cars. Please try again later.",
        showToast: true,
      });
    },
    ...options,
  });
};

export default useCars;
