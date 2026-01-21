
import React from "react";
import { Link } from "react-router-dom";
import { Car } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Fuel, Gauge } from "lucide-react";

interface CarCardProps {
  car: Car;
  className?: string;
}

const CarCard: React.FC<CarCardProps> = ({ car, className = "" }) => {
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Use nullish coalescing and optional chaining to handle missing data
  const title = car.title || `${car.brand || ''} ${car.model || ''}`.trim() || 'Unnamed Car';
  const fuelType = car.fuelType || car.fuel_type || "Gasoline";
  const seats = car.seats || 4;
  const transmission = car.transmission || "Automatic";
  const rating = car.rating || 4.5;
  const location = car.location || "Unknown location";

  return (
    <Card
      className={`overflow-hidden bg-zinc-900 border-yellow-300/10 hover:border-yellow-300/30 transition-all duration-300 group ${className}`}
    >
      <div className="relative overflow-hidden h-48">
        <Link to={`/cars/${car.id}`}>
          <img
            src={car.image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy" // Add lazy loading for better performance
          />
        </Link>
        <div className="absolute top-2 right-2">
          <Badge className="bg-yellow-300 text-black hover:bg-yellow-400">
            {fuelType}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/cars/${car.id}`} className="no-highlight">
            <h3 className="text-lg font-barlow font-medium text-white hover:text-yellow-300 transition-colors">
              {title}
            </h3>
          </Link>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-300 mr-1" />
            <span className="text-white">{rating}</span>
          </div>
        </div>

        <div className="flex items-center mb-3 text-white/70">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center justify-center p-1.5 bg-zinc-800 rounded text-xs text-white/80">
            <Users className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
            {seats} seats
          </div>
          <div className="flex items-center justify-center p-1.5 bg-zinc-800 rounded text-xs text-white/80">
            <Gauge className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
            {transmission}
          </div>
          <div className="flex items-center justify-center p-1.5 bg-zinc-800 rounded text-xs text-white/80">
            <Fuel className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
            {fuelType}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold text-yellow-300">
              {formatPrice(car.price)}
            </span>
            <span className="text-xs text-white/60 ml-1">/day</span>
          </div>
          <Button
            asChild
            className="bg-yellow-300 !text-black hover:bg-yellow-400 font-semibold"
          >
            <Link to={`/cars/${car.id}`}>Rent Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
