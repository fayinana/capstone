import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  X,
  Github,
  Linkedin,
  Twitter,
  User,
  LogOut,
  LogIn,
  UserPlus,
  BookMinus,
  LayoutDashboard,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/AuthContext";

const Header = () => {
  const { user, signOut, loading } = useAuthContext();
  const { isAdmin } = useAdmin();
  // Render a persistent UI based on initial state until we confirm auth status
  return (
    <header className="bg-black fixed top-0 left-0 w-full z-50 border-b border-yellow-300/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center font-bold text-xl">
          <img src={logo} alt="Teguaze  Logo" className="h-8 mr-2" />
          <span className="text-white font-barlow">Teguaze </span>
        </Link>

        {/* Navigation (Hidden on small screens) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-white/80 hover:text-yellow-300 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/cars"
            className="text-white/80 hover:text-yellow-300 transition-colors"
          >
            Cars
          </Link>
          <Link
            to="/about"
            className="text-white/80 hover:text-yellow-300 transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-white/80 hover:text-yellow-300 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Authentication and User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            // Show skeleton UI while loading auth state to prevent flicker
            <Skeleton className="h-10 w-24 bg-gray-800" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage alt={user.email || "User Avatar"} />
                    <AvatarFallback>
                      <User className="h-4 w-4 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile">Your Profile</Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile/bookings">Your Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="bg-black/20 border-yellow-300/50 text-white hover:bg-yellow-300 hover:text-black"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button className="bg-yellow-300 text-black hover:bg-yellow-400">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black text-white">
            <SheetHeader className="text-left">
              <SheetTitle>Teguaze </SheetTitle>
              <SheetDescription>
                Explore our premium car rental service.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <Link to="/" className="block py-2 hover:text-yellow-300">
                Home
              </Link>
              <Link to="/cars" className="block py-2 hover:text-yellow-300">
                Cars
              </Link>
              <Link to="/about" className="block py-2 hover:text-yellow-300">
                About
              </Link>
              <Link to="/contact" className="block py-2 hover:text-yellow-300">
                Contact
              </Link>
              {loading ? (
                <Skeleton className="h-10 w-full bg-gray-800 my-2" />
              ) : user ? (
                <>
                  <Link
                    to="/profile"
                    className="block py-2 hover:text-yellow-300"
                  >
                    Your Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block py-2 hover:text-yellow-300"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile/bookings"
                    className="block py-2 hover:text-yellow-300"
                  >
                    Your Bookings
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block py-2 hover:text-yellow-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block py-2 hover:text-yellow-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              className="absolute bottom-4 left-4 justify-start"
            >
              <a
                href="https://github.com/fayinana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-yellow-300"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <SheetClose asChild></SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
