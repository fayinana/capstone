import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const ContactPage = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Message Sent",
      description: "Thank you for your message. We'll get back to you shortly.",
      variant: "success",
    });
    form.reset();
  }

  return (
    <>
      <Helmet
        title="Contact Us | Teguaze "
        description="Get in touch with Teguaze  for car rental inquiries, support and feedback."
        keywords="contact, car rental, customer service, support, feedback"
      />
      <Header />
      <main>
        {/* Hero Banner */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
          <img
            src="/car-rental.webp"
            alt="Customer support"
            className="w-full h-[60vh] object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-barlow font-bold text-white mb-4">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                We're here to help with your car rental needs
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-barlow font-bold mb-8">
                Get In Touch
              </h2>
              <p className="text-lg mb-8">
                Have questions about our services, need support with a
                reservation, or want to provide feedback? We're here to help!
                Choose the most convenient way to reach us.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-300/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Our Location</h3>
                    <p>Megenagna, Yeka Sub City</p>
                    <p>Addis Ababa, Ethiopia</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-300/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Phone</h3>
                    <p>Customer Service: +251 11 123 4567</p>
                    <p>Support Line: +251 91 234 5678</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-300/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Email</h3>
                    <p>General Inquiries: info@teguaze.com</p>
                    <p>Support: support@teguaze.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-300/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Hours</h3>
                    <p>Monday - Friday: 9am - 6pm</p>
                    <p>Saturday: 9am - 1pm</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
              {/* Map Placeholder */}
              <div className="mt-10 h-64 rounded-lg overflow-hidden bg-zinc-800 border border-yellow-300/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.1870615125323!2d38.7881836748676!3d9.030137689059835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8571122c3ef7%3A0x5e259ed70e31e3f2!2sMegenagna%2C%20Addis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1716924710000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-zinc-900 p-8 rounded-lg border border-yellow-300/10">
              <h2 className="text-3xl font-barlow font-bold mb-6">
                Send a Message
              </h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Booking Inquiry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide details about your inquiry..."
                            className="min-h-[150px]"
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
                  >
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-barlow font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: "How do I make a reservation?",
                  answer:
                    "You can make a reservation through our website, mobile app, or by calling our customer service. Select your pickup and drop-off locations, dates, and preferred vehicle to get started.",
                },
                {
                  question: "What documents do I need to rent a car?",
                  answer:
                    "You'll need a valid driver's license, a credit card in your name, and proof of insurance. International renters may need additional documentation.",
                },
                {
                  question: "Can I modify or cancel my reservation?",
                  answer:
                    "Yes, you can modify or cancel your reservation through your account on our website or by contacting customer service. Please note that cancellation fees may apply depending on how close to the pickup time you cancel.",
                },
                {
                  question: "Is there a security deposit required?",
                  answer:
                    "Yes, we require a security deposit which is refundable upon return of the vehicle in its original condition. The amount varies depending on the vehicle class.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white/5 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ContactPage;
