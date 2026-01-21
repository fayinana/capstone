import React from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="border-b border-yellow-300/20">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-barlow font-bold uppercase">
                Subscribe to our newsletter
              </h3>
              <p className="text-white/70 mt-2">
                Stay updated with our latest offers and news
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border border-yellow-300/30 text-white px-4 py-2 rounded-md focus:outline-none focus:border-yellow-300 w-full sm:w-64"
              />
              <Button className="bg-yellow-300 text-black hover:bg-yellow-400 whitespace-nowrap">
                SUBSCRIBE
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-yellow-300" strokeWidth={1.5} />
              <span className="text-xl font-barlow font-bold tracking-wider">
                TEGUAZE
              </span>
            </div>
            <p className="text-sm text-white/70">
              Providing premium vehicles and parts for all your automotive
              needs. Experience excellence with every drive.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white/70 hover:text-yellow-300 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-yellow-300 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-yellow-300 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-barlow font-semibold text-lg mb-4 text-yellow-300 uppercase">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cars"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Cars</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-barlow font-semibold text-lg mb-4 text-yellow-300 uppercase">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/cars?type=sedan"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Car Rental</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cars?type=suv"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Car Parts</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cars?type=luxury"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Maintenance</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cars?type=electric"
                  className="text-white/70 hover:text-yellow-300 transition-colors text-sm flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Accessories</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-barlow font-semibold text-lg mb-4 text-yellow-300 uppercase">
              Contact
            </h3>
            <address className="not-italic text-white/70 text-sm space-y-3">
              <p className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-yellow-300 shrink-0 mt-1" />
                <span>123 Main Street, Addis Ababa, Ethiopia</span>
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-yellow-300 shrink-0" />
                <a
                  href="mailto:info@Teguaze .com"
                  className="hover:text-yellow-300 transition-colors"
                >
                  info@Teguaze .com
                </a>
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-yellow-300 shrink-0" />
                <a
                  href="tel:+251912345678"
                  className="hover:text-yellow-300 transition-colors"
                >
                  +251 91 234 5678
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-black border-t border-yellow-300/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm">
              © {currentYear} Teguaze . All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-white/50 text-sm hover:text-yellow-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-white/50 text-sm hover:text-yellow-300 transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
