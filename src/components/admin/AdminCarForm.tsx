import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Car } from "@/types";
import { createCar } from "@/api/cars";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  year: z.coerce
    .number()
    .min(1950, { message: "Year must be 1950 or later" })
    .max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
  location: z.string().min(1, { message: "Location is required" }),
  transmission: z.enum(["automatic", "manual"]),
  seats: z.coerce.number().min(1).max(10),
  fuel_type: z.enum(["petrol", "diesel", "electric", "hybrid"]),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  features: z.array(z.string()).optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }),
  additionalImageUrls: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminCarFormProps {
  onSuccess: () => void;
}

export const AdminCarForm = ({ onSuccess }: AdminCarFormProps) => {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      location: "",
      transmission: "automatic",
      seats: 5,
      fuel_type: "petrol",
      description: "",
      features: [],
      imageUrl: "",
      additionalImageUrls: "",
    },
  });

  const carMutation = useMutation({
    mutationFn: createCar,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Car created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create car. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    const title = `${data.brand} ${data.model} ${data.year}`;

    // Process additional image URLs
    const additionalImages = data.additionalImageUrls
      ? data.additionalImageUrls
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url && url.startsWith("http"))
      : [];

    const allImages = [data.imageUrl, ...additionalImages];

    const carData: Omit<Car, "id"> = {
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: data.price,
      location: data.location,
      seats: data.seats,
      transmission: data.transmission,
      fuel_type: data.fuel_type,
      description: data.description,
      features: data.features || [],
      title: title,
      image: data.imageUrl,
      images: allImages,
      review_count: 0,
      available_from: new Date(),
      available_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    carMutation.mutate(carData);
  };

  const carFeatures = [
    { id: "bluetooth", label: "Bluetooth" },
    { id: "air_conditioning", label: "Air Conditioning" },
    { id: "navigation", label: "Navigation System" },
    { id: "child_seat", label: "Child Seat" },
    { id: "music", label: "Music Player" },
    { id: "seat_heating", label: "Seat Heating" },
    { id: "safety", label: "Safety Systems" },
    { id: "parking_sensors", label: "Parking Sensors" },
    { id: "camera", label: "Backup Camera" },
    { id: "cruise_control", label: "Cruise Control" },
  ];

  return (
    <Card className="w-full border-yellow-300/20 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-xl text-yellow-300">Add New Car</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Price (ETB)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                        <SelectItem value="Bahir Dar">Bahir Dar</SelectItem>
                        <SelectItem value="Hawassa">Hawassa</SelectItem>
                        <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                        <SelectItem value="Gondar">Gondar</SelectItem>
                        <SelectItem value="Mekelle">Mekelle</SelectItem>
                        <SelectItem value="Adama">Adama</SelectItem>
                        <SelectItem value="Jimma">Jimma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seats</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of seats" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the car's features, condition, and any other details renters should know."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the car to help renters
                    make a decision.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Features</FormLabel>
                    <FormDescription>
                      Select the features available in this car
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {carFeatures.map((feature) => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([
                                        ...currentValues,
                                        feature.id,
                                      ]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter(
                                          (value) => value !== feature.id
                                        )
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {feature.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/car-image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of the main car image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalImageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Image URLs</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="https://example.com/car-image1.jpg&#10;https://example.com/car-image2.jpg&#10;https://example.com/car-image3.jpg"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter one image URL per line
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="bg-yellow-300 text-black hover:bg-yellow-400 w-full"
              disabled={carMutation.isPending}
            >
              {carMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Car"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdminCarForm;
