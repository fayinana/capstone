
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ErrorPageProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  homeButtonText?: string;
  showBackButton?: boolean;
  backgroundColor?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "An Error Occurred",
  message = "We're sorry, but something went wrong. Please try again later.",
  icon = <AlertCircle className="h-20 w-20 text-red-500" />,
  homeButtonText = "Return Home",
  showBackButton = true,
  backgroundColor = "from-red-50 to-white"
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className={`min-h-[70vh] flex items-center justify-center bg-gradient-to-b ${backgroundColor} p-4`}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              {icon}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-red-600">{title}</h1>
          
          <p className="text-zinc-600 max-w-sm mx-auto">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
            
            <Button
              className="flex items-center justify-center"
              asChild
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                {homeButtonText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ErrorPage;
