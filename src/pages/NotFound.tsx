import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-black text-white p-4 mt-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-4 rounded-full">
              <AlertTriangle className="h-20 w-20 text-yellow-500" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-yellow-500">404</h1>
          <h2 className="text-2xl font-semibold text-zinc-800">
            Page Not Found
          </h2>

          <p className="text-zinc-600 max-w-sm mx-auto">
            We couldn't find the page you're looking for. The page may have been
            moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center justify-center"
            >
              Go Back
            </Button>

            <Button className="flex items-center justify-center" asChild>
              <Link to="/" className="!text-black">
                <Home className="mr-2 h-4 w-4 text-black" />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
