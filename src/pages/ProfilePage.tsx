import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/auth";
import { useUpdateProfile, useUserProfile } from "@/hooks/user";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "@/components/Helmet";
import { Shield, UserCircle, BadgeCheck } from "lucide-react";
import { Navigate } from "react-router-dom";

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone_number: string;
}

const ProfilePage = () => {
  const { toast } = useToast();
  const { user, loading: isLoadingUser } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user?.id || null);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone_number: profile?.phone_number || "",
    },
  });

  const onSubmit = (data: ProfileForm) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    updateProfile({
      userId: user.id,
      profile: data,
    });
  };

  if (!user && !isLoadingUser) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <>
      <Helmet
        title="My Profile | Teguaze "
        description="Manage your profile and account settings on Teguaze "
      />
      <Header />
      <main className="py-16 bg-black">
        <div className="container max-w-4xl mx-auto px-4">
          <Tabs defaultValue="profile" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                My Account
              </h1>
              <TabsList className="bg-gray-900">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-yellow-300/20 bg-zinc-900 text-white">
                <CardHeader className="border-b border-yellow-300/10 pb-6">
                  <CardTitle className="text-2xl flex items-center">
                    <BadgeCheck className="w-5 h-5 mr-2 text-yellow-300" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-3/4 bg-gray-800" />
                      <Skeleton className="h-8 w-full bg-gray-800" />
                      <Skeleton className="h-8 w-full bg-gray-800" />
                      <Skeleton className="h-8 w-1/2 bg-gray-800" />
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm p-4 bg-red-500/10 rounded-md">
                      Failed to load profile. Please try again later.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-yellow-300">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback className="bg-yellow-300 text-black text-xl">
                                {profile?.first_name?.[0] || ""}
                                {profile?.last_name?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-300 text-black rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                              >
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow space-y-4 w-full">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label
                                htmlFor="firstName"
                                className="text-gray-300"
                              >
                                First name
                              </Label>
                              <Input
                                id="firstName"
                                className=" border-gray-700 focus:border-yellow-300 focus:ring-yellow-300/20"
                                defaultValue={profile?.first_name}
                                {...register("first_name", {
                                  required: "First name is required",
                                })}
                              />
                              {errors.first_name && (
                                <p className="text-red-500 text-sm">
                                  {errors.first_name.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="lastName"
                                className="text-gray-300"
                              >
                                Last name
                              </Label>
                              <Input
                                id="lastName"
                                className=" border-gray-700 focus:border-yellow-300 focus:ring-yellow-300/20"
                                defaultValue={profile?.last_name}
                                {...register("last_name", {
                                  required: "Last name is required",
                                })}
                              />
                              {errors.last_name && (
                                <p className="text-red-500 text-sm">
                                  {errors.last_name.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={user?.email || ""}
                              className=" border-gray-700"
                              disabled
                            />
                            <p className="text-sm text-gray-500">
                              Your email cannot be changed
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300">
                              Phone number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              className=" border-gray-700 focus:border-yellow-300 focus:ring-yellow-300/20"
                              defaultValue={profile?.phone_number || ""}
                              {...register("phone_number")}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="bg-yellow-300 text-black hover:bg-yellow-400 transition-colors"
                        >
                          {isPending ? "Saving..." : "Save changes"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="border-yellow-300/20 bg-zinc-900 text-white">
                <CardHeader className="border-b border-yellow-300/10 pb-6">
                  <CardTitle className="text-2xl flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-yellow-300" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-gray-300">
                      Current password
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      className=" border-gray-700 focus:border-yellow-300 focus:ring-yellow-300/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-300">
                      New password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      className=" border-gray-700 focus:border-yellow-300 focus:ring-yellow-300/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">
                      Confirm new password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className=" border-gray-700 focus:border-yellow-300 focus:ring-yellow-300/20"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="bg-yellow-300 text-black hover:bg-yellow-400 transition-colors"
                    >
                      Update password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
