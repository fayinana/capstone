import { useQuery } from "@tanstack/react-query";
import { Car } from "@/types";
import { getSimilarCars } from "@/api/cars";

// Custom hook to get similar cars based on criteria
const useSimilarCars = (currentCar: Car | null) => {
  return useQuery({
    queryKey: ["similarCars", currentCar?.id],
    queryFn: () => getSimilarCars(currentCar?.id || ""),
    enabled: !!currentCar?.id, // Only run the query if we have a current car ID
  });
};

export default useSimilarCars;
