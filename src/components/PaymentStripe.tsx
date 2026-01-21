import React, { useState, useEffect } from "react";
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
import { Loader2, CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QJYY5GA0wrO0cN7jTclbencDjfMCRd1pxv8c5zIen5zKSbJyVF7RNOGnLvKxFWuJcjR4LWUKykP2ljfDg9u3ICY00AA3wBPWr"
);

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof formSchema>;

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  amount: number;
  bookingId: string;
}

const StripePaymentForm = ({
  clientSecret,
  onSuccess,
  amount,
  bookingId,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + `/payment/success/${bookingId}`,
          payment_method_data: {
            billing_details: {
              name: data.name,
              email: data.email,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        throw error;
      } else {
        const { error } = await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId);

        if (error) {
          throw error;
        }

        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed.",
        });

        onSuccess();
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description:
          error.message ||
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name on Card</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Card Details</FormLabel>
          <PaymentElement />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !stripe || !elements}
          >
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
                  currency: "USD",
                }).format(amount)}
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Payments secured with 256-bit encryption</span>
        </div>
      </form>
    </Form>
  );
};

interface PaymentStripeProps {
  amount: number;
  bookingId: string;
  onSuccess: () => void;
}

const PaymentStripe = ({
  amount,
  bookingId,
  onSuccess,
}: PaymentStripeProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.functions.invoke(
          "create-payment-intent",
          {
            body: { amount, bookingId, paymentMethod: "stripe" },
          }
        );

        if (error) throw error;

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Payment Setup Failed",
          description:
            "There was an error setting up the payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          Failed to initialize payment. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#FFD249",
        colorBackground: "#121212",
        colorText: "#ffffff",
        colorDanger: "#ff4444",
        fontFamily: '"DM Sans", sans-serif',
      },
    },
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <p className="font-medium">Secure Payment</p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm
          bookingId={bookingId}
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          amount={amount}
        />
      </Elements>
    </div>
  );
};

export default PaymentStripe;
