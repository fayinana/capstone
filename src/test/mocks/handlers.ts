
import { http, HttpResponse } from 'msw';
import { mockCars } from './mockData';
import { mockUserProfile } from './mockData';

// Define handlers for MSW to intercept and mock API calls
export const handlers = [
  // Auth handlers
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'authenticated',
      },
    });
  }),
  
  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({ message: 'Success' });
  }),
  
  // Cars handlers
  http.get('*/rest/v1/cars', () => {
    return HttpResponse.json(mockCars);
  }),
  
  http.get('*/rest/v1/cars/*', ({ params }) => {
    const car = mockCars.find(car => car.id === params.id);
    if (!car) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(car);
  }),
  
  // User profile handlers
  http.get('*/rest/v1/profiles/*', () => {
    return HttpResponse.json(mockUserProfile);
  }),
];
