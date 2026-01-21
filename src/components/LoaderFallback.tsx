// components/CarLoaderProgress.tsx
import { CarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

const CarLoaderProgress = () => {
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 5; // Smooth randomness
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-[90%] max-w-2xl relative h-24">
        {/* Track line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted rounded-full" />

        {/* Car */}
        <div
          className="absolute -top-0 transform transition-transform duration-200 ease-out"
          style={{
            left: `calc(${progress}% - 1.5rem)`, // car width offset
          }}
        >
          <CarIcon
            size={40}
            className="text-yellow-300 drop-shadow-md animate-pulse"
          />
        </div>

        {/* Label */}
        <div className="text-center mt-20 font-medium text-secondary dark:text-yellow-300">
          Getting your ride ready... {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
};

export default CarLoaderProgress;
