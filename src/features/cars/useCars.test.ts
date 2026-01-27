
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/test/utils';
import useCars, { fetchCars, fetchCarById } from './useCars';
import { mockCars } from '@/test/mocks/mockData';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { NotFoundError } from '@/utils/errors';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
}));

// Mock the error handler
vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: vi.fn().mockReturnValue({
    handleApiError: vi.fn()
  })
}));

import { supabase } from '@/integrations/supabase/client';

describe('useCars Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCars function', () => {
    it('should return cars when supabase query is successful', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: mockCars,
          error: null
        })
      } as any);

      const result = await fetchCars();
      
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          brand: expect.any(String),
          model: expect.any(String)
        })
      ]));
    });

    it('should handle empty results', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: [],
          error: null
        })
      } as any);

      const result = await fetchCars();
      
      expect(result).toEqual([]);
    });

    it('should throw error when supabase query fails', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'Database error' }
        })
      } as any);

      await expect(fetchCars()).rejects.toThrow();
    });
  });

  describe('fetchCarById function', () => {
    it('should return a car when found', async () => {
      const mockCar = mockCars[0];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCar,
              error: null
            })
          })
        })
      } as any);

      const result = await fetchCarById(mockCar.id);
      
      expect(result).toEqual(expect.objectContaining({
        id: mockCar.id,
        brand: mockCar.brand,
        model: mockCar.model
      }));
    });

    it('should throw NotFoundError when car is not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' }
            })
          })
        })
      } as any);

      await expect(fetchCarById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('useCars hook', () => {
    it('should return cars data when successful', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: mockCars,
          error: null
        })
      } as any);

      const { result } = renderHook(() => useCars());
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          brand: expect.any(String)
        })
      ]));
    });

    it('should handle errors with handleApiError', async () => {
      const handleApiError = vi.fn();
      vi.mocked(useErrorHandler).mockReturnValue({ handleApiError });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: null,
          error: new Error('Test error')
        })
      } as any);

      const { result } = renderHook(() => useCars());
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});
