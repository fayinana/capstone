
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateProfile } from './useUpdateProfile';
import * as userApi from '@/api/user';

// Mock the API
vi.mock('@/api/user');
const mockUpdateProfile = vi.mocked(userApi.updateProfile);

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  }),
}));

describe('useUpdateProfile', () => {
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

  it('should update profile successfully', async () => {
    const mockProfileData = {
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
      avatar_url: null,
      id: 'test-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUpdateProfile.mockResolvedValue(mockProfileData);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
    });
  });

  it('should handle update failure', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Update failed'));
  });
});
