
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile } from './useUserProfile';
import * as userApi from '@/api/user';

// Mock the API
vi.mock('@/api/user');
const mockGetUserProfile = vi.mocked(userApi.getUserProfile);

describe('useUserProfile', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch user profile successfully', async () => {
    const mockProfile = {
      id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockGetUserProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProfile);
    expect(mockGetUserProfile).toHaveBeenCalled();
  });

  it('should handle fetch failure', async () => {
    mockGetUserProfile.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Fetch failed'));
  });
});
