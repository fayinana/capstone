/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";
import { Car } from "@/types";

export const getCars = async (filters: any = {}) => {
  try {
    let query = supabase.from("cars").select("*", { count: "exact" });

    // Apply filters if provided
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.brand) {
      query = query.eq("brand", filters.brand);
    }

    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.fuelType) {
      query = query.eq("fuel_type", filters.fuelType);
    }

    if (filters.transmission) {
      query = query.eq("transmission", filters.transmission);
    }

    // Add pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;

    // Execute query with pagination
    const {
      data: cars,
      error,
      count,
    } = await query
      .range(start, start + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cars:", error);
      throw new Error("Failed to fetch cars");
    }

    // Return cars and total count for pagination
    return {
      cars: cars as Car[],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Error in getCars:", error);
    throw error;
  }
};
export const getCarById = async (id: string) => {
  try {
    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (carError) {
      console.error("Error fetching car by ID:", carError);
      throw new Error("Failed to fetch car details");
    }

    // Fetch average rating from reviews table
    const { data: ratingData, error: ratingError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("car_id", id);

    if (ratingError) {
      console.error("Error fetching ratings:", ratingError);
    }

    const averageRating =
      ratingData && ratingData.length > 0
        ? ratingData.reduce((acc, r) => acc + r.rating, 0) / ratingData.length
        : null;

    return {
      ...car,
      rating: averageRating,
      reviewCount: ratingData ? ratingData.length : 0,
      // attach rating
    } as Car & { averageRating: number | null };
  } catch (error) {
    console.error("Error in getCarById:", error);
    throw error;
  }
};

export const getSimilarCars = async (carId: string, limit = 3) => {
  try {
    // First get the current car to find its brand
    const { data: currentCar, error: carError } = await supabase
      .from("cars")
      .select("brand")
      .eq("id", carId)
      .single();

    if (carError) {
      console.error("Error fetching current car:", carError);
      throw new Error("Failed to fetch car details");
    }

    // Then find similar cars with the same brand
    const { data: similarCars, error } = await supabase
      .from("cars")
      .select("*")
      .neq("id", carId) // Exclude the current car
      .eq("brand", currentCar.brand)
      .limit(limit);

    if (error) {
      console.error("Error fetching similar cars:", error);
      throw new Error("Failed to fetch similar cars");
    }

    return similarCars as Car[];
  } catch (error) {
    console.error("Error in getSimilarCars:", error);
    throw error;
  }
};

export const getCarsByBrand = async (brand: string) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("brand", brand);

    if (error) {
      console.error("Error fetching cars by brand:", error);
      throw new Error("Failed to fetch cars by brand");
    }

    return data as Car[];
  } catch (error) {
    console.error("Error in getCarsByBrand:", error);
    throw error;
  }
};

export const getPopularCars = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching popular cars:", error);
      throw new Error("Failed to fetch popular cars");
    }

    return data as Car[];
  } catch (error) {
    console.error("Error in getPopularCars:", error);
    throw error;
  }
};

export const getCarsByIds = async (ids: string[]) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .in("id", ids);

    if (error) {
      console.error("Error fetching cars by IDs:", error);
      throw new Error("Failed to fetch cars by IDs");
    }

    return data as Car[];
  } catch (error) {
    console.error("Error in getCarsByIds:", error);
    throw error;
  }
};

// Add the missing functions
export const createCar = async (carData: Omit<Car, "id">) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .insert([carData])
      .select()
      .single();

    if (error) {
      console.error("Error creating car:", error);
      throw new Error("Failed to create car");
    }

    return data as Car;
  } catch (error) {
    console.error("Error in createCar:", error);
    throw error;
  }
};

export const updateCar = async (id: string, carData: Partial<Car>) => {
  try {
    // Convert Date fields to ISO strings if necessary
    const formattedData = { ...carData };

    if (formattedData.available_from instanceof Date) {
      formattedData.available_from = formattedData.available_from.toISOString();
    }
    if (
      formattedData.available_from &&
      typeof formattedData.available_from !== "string"
    ) {
      formattedData.available_from = formattedData.available_from.toString();
    }
    if (
      formattedData.available_from &&
      formattedData.available_from instanceof Date
    ) {
      formattedData.available_from = formattedData.available_from.toISOString();
    }

    if (formattedData.available_to instanceof Date) {
      formattedData.available_to = formattedData.available_to.toISOString();
    }
    if (
      formattedData.available_to &&
      typeof formattedData.available_to !== "string"
    ) {
      formattedData.available_to = formattedData.available_to.toString();
    }
    if (
      formattedData.available_to &&
      formattedData.available_to instanceof Date
    ) {
      formattedData.available_to = formattedData.available_to.toISOString();
    }

    delete formattedData.rating;
    delete formattedData.reviewCount;
    delete formattedData.availableFrom;
    delete formattedData.availableTo;

    const { data, error } = await supabase
      .from("cars")
      .update(formattedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating car:", error);
      throw new Error("Failed to update car");
    }

    return data as Car;
  } catch (error) {
    console.error("Error in updateCar:", error);
    throw error;
  }
};

export const deleteCar = async (id: string) => {
  try {
    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      console.error("Error deleting car:", error);
      throw new Error("Failed to delete car");
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCar:", error);
    throw error;
  }
};

export const uploadCarImage = async (file: File): Promise<string> => {
  try {
    // Generate a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `cars/${fileName}`;

    // Upload the file
    const { error } = await supabase.storage
      .from("cars")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }

    // Get the public URL
    const { data } = supabase.storage.from("cars").getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error in uploadCarImage:", error);
    throw error;
  }
};

// Get car reviews
export const getCarReviews = async (carId: string) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        profiles:user_id (
          first_name,
          last_name
        )
      `
      )
      .eq("car_id", carId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching car reviews:", error);
      throw new Error("Failed to fetch reviews");
    }

    return data;
  } catch (error) {
    console.error("Error in getCarReviews:", error);
    throw error;
  }
};

// Add a review
export const addReview = async (reviewData: {
  car_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  booking_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          ...reviewData,
          booking_id: reviewData.booking_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding review:", error);
      throw new Error("Failed to add review");
    }

    return data;
  } catch (error) {
    console.error("Error in addReview:", error);
    throw error;
  }
};
