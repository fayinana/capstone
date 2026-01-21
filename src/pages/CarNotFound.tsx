import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CarNotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Search className="h-20 w-20 text-blue-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-blue-600">Car Not Found</h1>

          <p className="text-zinc-600 max-w-sm mx-auto">
            We couldn't find the car you're looking for. It may have been
            removed or the link is incorrect.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>

            <Button className="flex items-center justify-center" asChild>
              <Link to="/cars">Browse Cars</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarNotFound;
