import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCar } from "@/api/cars";
import { Car } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

interface AdminEditCarFormProps {
  car: Car;
  onSuccess?: () => void;
}

export const AdminEditCarForm = ({ car, onSuccess }: AdminEditCarFormProps) => {
  const [formData, setFormData] = useState<Car>({ ...car });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [additionalImageUrl, setAdditionalImageUrl] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Car) => updateCar(car.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      if (onSuccess) onSuccess();

      toast({
        title: "Success",
        description: "Car updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update car. Please try again.",
        variant: "destructive",
      });
      console.error("Update car error:", error);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "seats" || name === "year"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addNewMainImage = () => {
    if (newImageUrl.trim() && newImageUrl.startsWith("http")) {
      setFormData((prev) => ({
        ...prev,
        image: newImageUrl,
        // Replace the first image in the images array with the new main image
        images: [newImageUrl, ...prev.images.slice(1)],
      }));
      setNewImageUrl("");
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const addAdditionalImage = () => {
    if (additionalImageUrl.trim() && additionalImageUrl.startsWith("http")) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, additionalImageUrl],
      }));
      setAdditionalImageUrl("");
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    if (
      featureInput.trim() &&
      !formData.features.includes(featureInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedData = { ...formData };

      // Update fuel_type from fuelType for consistency
      updatedData.fuel_type = updatedData.fuelType as
        | "petrol"
        | "diesel"
        | "electric"
        | "hybrid";

      // Set title based on brand and model
      updatedData.title = `${updatedData.brand} ${updatedData.model}`;

      // Update the car
      updateMutation.mutate(updatedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update car. Please try again.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="bg-zinc-800 border-yellow-300/20 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="bg-zinc-800 border-yellow-300/20 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              className="bg-zinc-800 border-yellow-300/20 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price per day ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              value={formData.price}
              onChange={handleChange}
              className="bg-zinc-800 border-yellow-300/20 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-zinc-800 border-yellow-300/20 text-white"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="transmission">Transmission</Label>
            <Select
              value={formData.transmission}
              onValueChange={(value) =>
                handleSelectChange(
                  "transmission",
                  value as "automatic" | "manual"
                )
              }
            >
              <SelectTrigger className="bg-zinc-800 border-yellow-300/20 text-white">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-yellow-300/20 text-white">
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Select
              value={formData.fuelType || formData.fuel_type}
              onValueChange={(value) => handleSelectChange("fuel_type", value)}
            >
              <SelectTrigger className="bg-zinc-800 border-yellow-300/20 text-white">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-yellow-300/20 text-white">
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="seats">Number of Seats</Label>
            <Input
              id="seats"
              name="seats"
              type="number"
              min={1}
              max={10}
              value={formData.seats}
              onChange={handleChange}
              className="bg-zinc-800 border-yellow-300/20 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="currentMainImage">Current Main Image</Label>
            <div className="mt-1 relative">
              <img
                src={formData.image}
                alt="Main car image"
                className="w-full h-32 object-cover rounded border border-yellow-300/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="newImageUrl">Change Main Image URL</Label>
        <div className="flex mt-1">
          <Input
            id="newImageUrl"
            type="text"
            placeholder="https://example.com/car-image.jpg"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="bg-zinc-800 border-yellow-300/20 text-white rounded-r-none"
          />
          <Button
            type="button"
            onClick={addNewMainImage}
            className="rounded-l-none bg-yellow-300 text-black hover:bg-yellow-400"
          >
            Update
          </Button>
        </div>
      </div>

      <div>
        <Label>Current Additional Images</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {formData.images.slice(1).map((image, index) => (
            <div key={`existing-${index}`} className="relative">
              <img
                src={image}
                alt={`Car view ${index + 2}`}
                className="w-full h-20 object-cover rounded border border-yellow-300/20"
              />
              <button
                type="button"
                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white"
                onClick={() => removeExistingImage(index + 1)}
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="additionalImageUrl">Add More Image URLs</Label>
        <div className="flex mt-1">
          <Input
            id="additionalImageUrl"
            type="text"
            placeholder="https://example.com/car-image.jpg"
            value={additionalImageUrl}
            onChange={(e) => setAdditionalImageUrl(e.target.value)}
            className="bg-zinc-800 border-yellow-300/20 text-white rounded-r-none"
          />
          <Button
            type="button"
            onClick={addAdditionalImage}
            className="rounded-l-none bg-yellow-300 text-black hover:bg-yellow-400"
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-zinc-800 border-yellow-300/20 text-white"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="features">Features</Label>
        <div className="flex mt-1">
          <Input
            id="featureInput"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            className="bg-zinc-800 border-yellow-300/20 text-white rounded-r-none"
            placeholder="Add a feature"
          />
          <Button
            type="button"
            onClick={addFeature}
            variant="secondary"
            className="rounded-l-none bg-yellow-300 text-black hover:bg-yellow-400"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {formData.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div
                key={`${feature}-${index}`}
                className="bg-zinc-800 px-3 py-1 rounded-full flex items-center text-sm"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  className="ml-2 text-red-400 hover:text-red-300"
                  onClick={() => removeFeature(index)}
                  title="Remove feature"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          className="bg-yellow-300 text-black hover:bg-yellow-400"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Car...
            </>
          ) : (
            "Update Car"
          )}
        </Button>
      </div>
    </form>
  );
};
