import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCarById, updateCar } from "@/api/cars";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "@/components/Helmet";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Car } from "@/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminEditCarForm } from "@/components/admin/AdminEditCarForm";
import ReviewSection from "@/components/ReviewSection";

const EditCarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: car,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["car", id],
    queryFn: () => getCarById(id || ""),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedCar: Partial<Car>) => updateCar(id || "", updatedCar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car", id] });
      toast({
        title: "Success",
        description: "Car details updated successfully",
      });
      navigate("/admin");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update car details. Please try again.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Car updated successfully",
    });
    navigate("/admin");
  };

  return (
    <>
      <Helmet
        title="Edit Car | Teguaze Admin"
        description="Edit car details in the Teguaze admin panel"
      />
      <Header />
      <main className="bg-black text-white pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            className="mb-6 border-yellow-300/50 text-white hover:bg-yellow-300 hover:text-black"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Button>

          <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-300/10">
            <h1 className="text-2xl font-barlow font-bold mb-6">
              Edit <span className="text-yellow-300">Car</span>
            </h1>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
                <span className="ml-2">Loading car details...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">
                  Error loading car details. Please try again.
                </p>
                <Button
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["car", id] })
                  }
                  className="bg-yellow-300 text-black hover:bg-yellow-400"
                >
                  Retry
                </Button>
              </div>
            ) : car ? (
              <div className="space-y-10">
                <AdminEditCarForm car={car} onSuccess={handleSuccess} />

                <div className="pt-8 border-t border-yellow-300/10">
                  <ReviewSection carId={id || ""} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 mb-4">Car not found</p>
                <Button
                  onClick={() => navigate("/admin")}
                  className="bg-yellow-300 text-black hover:bg-yellow-400"
                >
                  Back to Admin
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EditCarPage;
