
import { Car, User, Booking } from '@/types';

// Modify mock cars to match the Car interface
export const mockCars: Car[] = [
  {
    id: '1',
    title: 'BMW X5 2023',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    price: 150, // Changed from price_per_day to price to match Car interface
    location: 'New York',
    transmission: 'automatic',
    seats: 5,
    description: 'Luxury SUV with premium features',
    features: ['GPS', 'Bluetooth', 'Leather Seats', 'Sunroof'],
    image: '/cars/bmw-x5.jpg', // Changed from image_url to image
    images: ['/cars/bmw-x5.jpg', '/cars/bmw-x5-interior.jpg'],
    fuelType: 'petrol', // Using fuelType instead of fuel_type
    fuel_type: 'petrol', // Keep this for compatibility
    availableFrom: '2024-05-01',
    availableTo: '2024-12-31',
    rating: 4.8,
    reviewCount: 24
  },
  {
    id: '2',
    title: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 120,
    location: 'San Francisco',
    transmission: 'automatic',
    seats: 5,
    description: 'Electric sedan with cutting-edge technology',
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Supercharging'],
    image: '/cars/tesla-model3.jpg',
    images: ['/cars/tesla-model3.jpg', '/cars/tesla-model3-interior.jpg'],
    fuelType: 'electric',
    fuel_type: 'electric',
    availableFrom: '2024-05-15',
    availableTo: '2024-11-30',
    rating: 4.9,
    reviewCount: 37
  }
];

export const mockUserProfile: User = {
  id: 'user-123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://example.com/avatar.jpg'
};

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    user_id: 'user-123',
    car_id: '1',
    start_date: '2024-07-10',
    end_date: '2024-07-15',
    status: 'confirmed',
    total_price: 750,
    created_at: '2024-06-01T10:00:00Z',
    car: mockCars[0]
  }
];
