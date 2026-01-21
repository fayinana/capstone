
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Banner() {
  return (
    <section className="relative h-screen flex items-center">
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2670&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />

      <div className="container mx-auto px-4 relative z-20 flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-barlow font-bold mb-4 leading-tight">
            PREMIUM{" "}
            <span className="text-yellow-300">
              CAR
              <br />
              RENTALS
            </span>{" "}
            SERVICE
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/80 max-w-xl">
            Experience luxury and comfort with our premium car rental service. Choose from our wide selection of vehicles for your next adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="bg-yellow-300 text-black hover:bg-yellow-400"
              size="lg"
              asChild
            >
              <Link to="/cars" className="group !text-black">
                Browse Cars
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-yellow-300/50 text-white hover:bg-yellow-300 hover:text-black"
              asChild
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
