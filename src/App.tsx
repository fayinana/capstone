import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import NetworkStatus from "@/components/NetworkStatus";
import "./App.css";

// Layout
const Layout = lazy(() => import("@/components/Layout"));

// Pages
const Index = lazy(() => import("./pages/Index"));
const CarsPage = lazy(() => import("./pages/CarsPage"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const EditCarPage = lazy(() => import("./pages/EditCarPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CarNotFound = lazy(() => import("./pages/CarNotFound"));

// Create a query client with error handling defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      // Use meta for error handling in React Query v5+
      meta: {
        onError: (error: Error) => {
          console.error("Query error:", error);
        },
      },
    },
    mutations: {
      // Use meta for error handling in React Query v5+
      meta: {
        onError: (error: Error) => {
          console.error("Mutation error:", error);
        },
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ToastProvider>
        <TooltipProvider>
          <SonnerToaster richColors position="top-right" />
          <NetworkStatus />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Layout Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="cars" element={<CarsPage />} />
                  <Route path="cars/:id" element={<CarDetailPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profile/bookings" element={<BookingsPage />} />
                  <Route path="payment/:bookingId" element={<PaymentPage />} />
                  <Route
                    path="payment/success/:bookingId"
                    element={<PaymentSuccessPage />}
                  />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="car-not-found" element={<CarNotFound />} />
                </Route>

                {/* Auth */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPasswordPage />}
                />

                {/* Admin */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/cars/edit/:id" element={<EditCarPage />} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ToastProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
