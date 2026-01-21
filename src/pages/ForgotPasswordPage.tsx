import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { AlertCircle, CheckCircle, Mail } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Reset Link Sent",
        description:
          "If an account exists with this email, you will receive a password reset link.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      setError(error.message || "Failed to send reset link. Please try again.");
      toast({
        title: "Request Failed",
        description:
          error.message ||
          "There was an error sending the reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet
        title="Forgot Password | Teguaze "
        description="Reset your password to access your Teguaze  account."
        keywords="forgot password, reset password, account recovery, car rental login"
      />
      <Header />
      <main className="min-h-screen bg-black pt-20 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-zinc-900 rounded-lg border border-yellow-300/10 p-8">
            <h1 className="text-2xl font-barlow font-bold mb-2">
              Forgot Your Password?
            </h1>
            <p className="text-zinc-400 mb-6">
              Enter your email to receive a password reset link
            </p>

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
                  <AlertTitle>Check Your Email</AlertTitle>
                  <AlertDescription>
                    If an account exists with this email, we've sent a password
                    reset link. Please check your inbox and spam folder.
                  </AlertDescription>
                </Alert>
                <Button
                  className="w-full bg-yellow-300 text-black hover:bg-yellow-400"
                  onClick={() => navigate("/auth/login")}
                >
                  Back to Login
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 opacity-50" />
                            <Input
                              placeholder="your.email@example.com"
                              {...field}
                              className="flex-1"
                            />
                          </div>
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
                    {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
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
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;
