/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
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
import { Loader2, Mail, Phone, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentChapaProps {
  amount: number;
  bookingId: string;
  onSuccess: () => void;
}

const PaymentChapa = ({ amount, bookingId, onSuccess }: PaymentChapaProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Get the current URL for the return URL
      const returnUrl = `${window.location.origin}/payment/success/${bookingId}`;

      const { data: chapaData, error: chapaError } =
        await supabase.functions.invoke("create-chapa-payment", {
          body: {
            amount,
            bookingId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            returnUrl,
          },
        });

      if (chapaError) {
        console.error("Supabase function error:", chapaError);
        throw new Error(chapaError.message || "Failed to initialize payment");
      }

      if (chapaData?.error) {
        console.error("Chapa payment error:", chapaData.error);
        throw new Error(chapaData.error || "Failed to initialize payment");
      }

      if (!chapaData?.paymentUrl) {
        throw new Error("No payment URL received from payment provider");
      }

      // Store payment details in local storage for verification later
      localStorage.setItem(
        `payment_${bookingId}`,
        JSON.stringify({
          tx_ref: chapaData.tx_ref,
          timestamp: Date.now(),
        })
      );

      // Redirect to Chapa checkout page
      window.location.href = chapaData.paymentUrl;
    } catch (error: any) {
      console.error("Error processing payment:", error);
      setError(
        error.message ||
          "There was an error setting up the payment. Please try again."
      );
      toast({
        title: "Payment Setup Failed",
        description:
          error.message ||
          "There was an error setting up the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <p className="font-medium">Enter your details</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 opacity-50" />
                    <Input
                      placeholder="john.doe@example.com"
                      {...field}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 opacity-50" />
                    <Input
                      placeholder="+251 91 234 5678"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d+]/g, "");
                        field.onChange(value);
                      }}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "ETB",
                  }).format(amount)}
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-center space-x-4 mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="logo-docs"
              style={{ width: 100 }}
              viewBox="0 0 550 158"
              fill="none"
            >
              <path
                opacity="0.59"
                d="M67.6381 70.6415H202.698C202.698 80.5633 198.757 90.0787 191.741 97.0944C184.725 104.11 175.21 108.052 165.288 108.052H67.7581C62.7986 108.052 58.0421 106.081 54.5352 102.574C51.0283 99.0675 49.0581 94.3111 49.0581 89.3515C49.0581 84.3911 51.028 79.6336 54.5346 76.1251C58.0412 72.6166 62.7976 70.6442 67.7581 70.6415H67.6381Z"
                fill="#8DC63F"
              ></path>
              <path
                opacity="0.59"
                d="M201.088 21.3015L174.088 58.7115H209.548C219.47 58.7115 228.985 54.7701 236.001 47.7544C243.017 40.7387 246.958 31.2233 246.958 21.3015H201.088Z"
                fill="#8DC63F"
              ></path>
              <path
                opacity="0.59"
                d="M128.338 58.0215L154.788 21.3015H67.9281C80.3961 21.2958 92.6258 24.718 103.28 31.1941C113.934 37.6702 122.603 46.9509 128.338 58.0215Z"
                fill="#8DC63F"
              ></path>
              <path
                d="M128.628 58.7115L128.338 58.1415L127.938 58.7115H128.628Z"
                fill="#7DC242"
              ></path>
              <path
                d="M155.708 20.3315L154.788 21.3315L128.338 58.0215L128.628 58.5915H127.938L119.278 70.6415L91.1681 109.262C87.8654 113.137 83.6487 116.129 78.8994 117.966C74.1501 119.803 69.0178 120.427 63.9666 119.782C58.9155 119.137 54.1046 117.244 49.9691 114.273C45.8336 111.301 42.5038 107.346 40.2807 102.765C38.0577 98.1838 37.0115 93.1207 37.2367 88.0335C37.462 82.9463 38.9516 77.9955 41.5708 73.6286C44.1901 69.2617 47.8564 65.6164 52.2384 63.0224C56.6203 60.4284 61.5797 58.9674 66.6681 58.7715H127.938L128.338 58.1915C122.626 47.0892 113.967 37.7739 103.311 31.2667C92.6555 24.7596 80.4137 21.3119 67.9281 21.3015H63.8581C52.5215 21.9933 41.5388 25.5137 31.9125 31.5412C22.2861 37.5687 14.3229 45.9114 8.74968 55.8076C3.17646 65.7039 0.170797 76.8385 0.0070675 88.195C-0.156662 99.5515 2.52676 110.768 7.81236 120.821C13.098 130.874 20.8174 139.443 30.2659 145.745C39.7145 152.048 50.5912 155.883 61.9031 156.901C73.215 157.92 84.6019 156.088 95.0241 151.575C105.446 147.061 114.572 140.009 121.568 131.062L124.098 127.672L165.408 70.6715L174.068 58.7415L201.068 21.3315L207.898 12.1515C199.888 6.32737 189.896 3.91777 180.112 5.45124C170.328 6.98472 161.552 12.3361 155.708 20.3315Z"
                fill="#7DC242"
              ></path>
            </svg>
          </div>

          <div className="text-xs text-center text-muted-foreground mt-2">
            <p>
              Secure payment processing by Chapa, Ethiopia's leading payment
              provider
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentChapa;
