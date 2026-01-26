export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  location: string;
  transmission: "automatic" | "manual";
  seats: number;
  description: string;
  features: string[];
  image: string;
  images: string[];
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid";
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid";
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  availableFrom?: Date | string;
  availableTo?: Date | string;
  available_from?: string | Date; // Added database field
  available_to?: string | Date; // Added database field
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status?: "pending" | "paid" | "failed";
  total_price: number;
  created_at: string;
  updated_at?: string;
  car?: Car;
  user?: User;
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}
