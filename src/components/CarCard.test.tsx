
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import CarCard from './CarCard';
import { mockCars } from '@/test/mocks/mockData';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('CarCard Component', () => {
  const car = mockCars[0];

  it('renders car information correctly', () => {
    render(<CarCard car={car} />);
    
    expect(screen.getByText(car.brand)).toBeInTheDocument();
    expect(screen.getByText(car.model)).toBeInTheDocument();
    expect(screen.getByText(`$${car.price}/day`)).toBeInTheDocument();
    expect(screen.getByText(car.fuelType)).toBeInTheDocument();
    expect(screen.getByText(car.transmission)).toBeInTheDocument();
    expect(screen.getByText(`${car.seats} seats`)).toBeInTheDocument();
  });

  it('displays the car image', () => {
    render(<CarCard car={car} />);
    const image = screen.getByAltText(`${car.brand} ${car.model}`);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining(car.image));
  });

  it('shows the car location', () => {
    render(<CarCard car={car} />);
    expect(screen.getByText(car.location)).toBeInTheDocument();
  });

  it('can render with different car data', () => {
    // Create a car with different availability
    const unavailableCar = { ...car, availableFrom: '2025-05-01' };
    render(<CarCard car={unavailableCar} />);
    expect(screen.getByText(unavailableCar.brand)).toBeInTheDocument();
  });
});
