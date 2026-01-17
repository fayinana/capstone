
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCarsList } from "@/components/admin/AdminCarsList";
import { AdminCarForm } from "@/components/admin/AdminCarForm";
import AdminBookingsTable from "@/components/admin/AdminBookingsTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { ShieldAlert, Users, Car, Calendar, Settings, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPage = () => {
  const { isAdmin, isLoading } = useAdmin();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real dashboard statistics
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      try {
        // Get car count
        const { count: carsCount, error: carsError } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true });

        if (carsError) throw carsError;

        // Get active bookings count
        const { count: activeBookingsCount, error: activeBookingsError } =
          await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "confirmed");

        if (activeBookingsError) throw activeBookingsError;

        // Get total bookings count
        const { count: totalBookingsCount, error: totalBookingsError } =
          await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true });

        if (totalBookingsError) throw totalBookingsError;

        // Get completed bookings count
        const { count: completedBookingsCount, error: completedBookingsError } =
          await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed");

        if (completedBookingsError) throw completedBookingsError;

        // Get users count from profiles table
        const { count: usersCount, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;

        // Calculate revenue (sum of booking total_price)
        const { data: revenueData, error: revenueError } = await supabase
          .from("bookings")
          .select("total_price")
          .in("status", ["confirmed", "completed"]);

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData.reduce(
          (sum, booking) => sum + (booking.total_price || 0),
          0
        );

        // Get recent bookings for trend analysis
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentBookings, error: recentBookingsError } = await supabase
          .from("bookings")
          .select("created_at, total_price")
          .gte("created_at", thirtyDaysAgo.toISOString());

        if (recentBookingsError) throw recentBookingsError;

        const recentRevenue = recentBookings.reduce(
          (sum, booking) => sum + (booking.total_price || 0),
          0
        );

        return {
          carsCount: carsCount || 0,
          activeBookingsCount: activeBookingsCount || 0,
          totalBookingsCount: totalBookingsCount || 0,
          completedBookingsCount: completedBookingsCount || 0,
          usersCount: usersCount || 0,
          totalRevenue,
          recentRevenue,
          recentBookingsCount: recentBookings.length,
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    enabled: !!isAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black pt-20 text-white px-4">
          <div className="container mx-auto py-10">
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-20 h-1 bg-yellow-300 mb-8"></div>
                <div className="h-6 w-32 bg-yellow-300/20 rounded mb-4"></div>
                <div className="h-4 w-64 bg-yellow-300/10 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user && !loading) {
    navigate("/auth/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black pt-20 text-white">
          <div className="container mx-auto py-10 text-center">
            <div className="flex flex-col items-center justify-center h-64">
              <ShieldAlert className="w-16 h-16 text-yellow-300 mb-4" />
              <h1 className="text-3xl font-bold mb-2 font-barlow">
                Access Denied
              </h1>
              <p className="text-white/70 mb-6">
                You don't have permission to access the admin panel.
              </p>
              <Button
                className="bg-yellow-300 text-black hover:bg-yellow-400"
                onClick={() => navigate("/")}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleActionComplete = (message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    });
  };

  // Dashboard stat card with loading state
  const StatCard = ({
    title,
    description,
    value,
    icon: Icon,
    action,
    isLoading,
    trend,
  }: {
    title: string;
    description: string;
    value: number | string;
    icon: any;
    action: () => void;
    isLoading: boolean;
    trend?: string;
  }) => (
    <Card className="bg-zinc-900 border-yellow-300/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-yellow-300 flex items-center">
          <Icon className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-white/60">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-16 bg-zinc-800 mb-1" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">
                {title === "Cars"
                  ? "Active vehicles"
                  : title === "Bookings"
                  ? "Active reservations"
                  : title === "Users"
                  ? "Registered users"
                  : "Total earned"}
              </p>
              {trend && (
                <div className="flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {trend}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-yellow-300/20 hover:bg-yellow-300 hover:text-black"
          onClick={action}
        >
          {title === "Cars"
            ? "Manage Cars"
            : title === "Bookings"
            ? "Manage Bookings"
            : title === "Users"
            ? "View Users"
            : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <Helmet
        title="Admin Dashboard | Teguaze"
        description="Admin dashboard for Teguaze car rental platform."
        keywords="admin, dashboard, car management, bookings"
      />
      <Header />
      <main className="min-h-screen bg-black pt-20 text-white px-4">
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-barlow font-bold mb-2">
                Admin <span className="text-yellow-300">Dashboard</span>
              </h1>
              <p className="text-white/60">Manage your car rental platform</p>
            </div>
          </div>

          <Tabs
            defaultValue="dashboard"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-zinc-900 border border-yellow-300/10">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="cars"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
              >
                Cars
              </TabsTrigger>
              <TabsTrigger
                value="add-car"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
              >
                Add Car
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
              >
                Bookings
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
              >
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Cars"
                  description="Manage your vehicle fleet"
                  value={dashboardStats?.carsCount || 0}
                  icon={Car}
                  action={() => setActiveTab("cars")}
                  isLoading={isLoadingStats}
                />

                <StatCard
                  title="Bookings"
                  description="Track your reservations"
                  value={dashboardStats?.activeBookingsCount || 0}
                  icon={Calendar}
                  action={() => setActiveTab("bookings")}
                  isLoading={isLoadingStats}
                  trend={dashboardStats?.recentBookingsCount ? `+${dashboardStats.recentBookingsCount} this month` : undefined}
                />

                <StatCard
                  title="Users"
                  description="Customer management"
                  value={dashboardStats?.usersCount || 0}
                  icon={Users}
                  action={() => setActiveTab("users")}
                  isLoading={isLoadingStats}
                />

                <StatCard
                  title="Revenue"
                  description="Total earnings"
                  value={dashboardStats?.totalRevenue ? `$${dashboardStats.totalRevenue.toLocaleString()}` : "$0"}
                  icon={TrendingUp}
                  action={() => setActiveTab("bookings")}
                  isLoading={isLoadingStats}
                  trend={dashboardStats?.recentRevenue ? `$${dashboardStats.recentRevenue.toLocaleString()} this month` : undefined}
                />
              </div>

              <Card className="bg-zinc-900 border-yellow-300/20 mt-6">
                <CardHeader>
                  <CardTitle className="text-yellow-300 flex items-center">
                    <Settings className="mr-2 h-5 w-5" /> System Overview
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Platform summary and real-time statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex justify-between">
                          <Skeleton className="h-5 w-32 bg-zinc-800" />
                          <Skeleton className="h-5 w-16 bg-zinc-800" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">System Status</span>
                        <span className="text-green-400">Operational</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Total Revenue</span>
                        <span>
                          ${(dashboardStats?.totalRevenue || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Active Bookings</span>
                        <span>{dashboardStats?.activeBookingsCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          Completed Bookings
                        </span>
                        <span>
                          {dashboardStats?.completedBookingsCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          Total Bookings
                        </span>
                        <span>
                          {dashboardStats?.totalBookingsCount || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <p className="text-xs text-white/40">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="cars" className="space-y-4">
              <AdminCarsList />
            </TabsContent>

            <TabsContent value="add-car" className="space-y-4">
              <AdminCarForm
                onSuccess={() => {
                  handleActionComplete(
                    "The car has been successfully added to the database."
                  );
                  setActiveTab("cars");
                }}
              />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-300/10">
                <h2 className="text-xl font-barlow font-semibold mb-6">
                  Booking Management
                </h2>
                <AdminBookingsTable />
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-300/10">
                <h2 className="text-xl font-barlow font-semibold mb-6">
                  User Management
                </h2>
                <AdminUsersTable />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminPage;
