import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const formSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract the token from the URL
      const urlParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");
      const type = urlParams.get("type");

      if (!accessToken || type !== "recovery") {
        throw new Error(
          "Invalid or expired password reset link. Please request a new one."
        );
      }

      // Set the session from tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken as string,
        refresh_token: refreshToken as string,
      });

      if (sessionError) {
        throw sessionError;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Password Reset Successful",
        description:
          "Your password has been reset successfully. You can now login with your new password.",
        variant: "success",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      toast({
        title: "Password Reset Failed",
        description:
          error.message ||
          "There was an error resetting your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet
        title="Reset Password | Teguaze "
        description="Reset your password to access your Teguaze  account."
        keywords="reset password, new password, account access, car rental login"
      />
      <Header />
      <main className="min-h-screen bg-black pt-20 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-zinc-900 rounded-lg border border-yellow-300/10 p-8">
            <h1 className="text-2xl font-barlow font-bold mb-2">
              Reset Your Password
            </h1>
            <p className="text-zinc-400 mb-6">Enter your new password below</p>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-500/10 border-green-500/30 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your password has been reset successfully. You will be
                    redirected to the login page shortly.
                  </AlertDescription>
                </Alert>
                <Button
                  className="w-full bg-yellow-300 text-black hover:bg-yellow-400"
                  onClick={() => navigate("/auth/login")}
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-yellow-300 text-black hover:bg-yellow-400"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <p className="text-zinc-400">
                Remember your password?{" "}
                <Button
                  variant="link"
                  className="text-yellow-300 p-0"
                  onClick={() => navigate("/auth/login")}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ResetPasswordPage;
