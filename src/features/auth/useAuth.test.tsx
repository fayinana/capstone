
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@/test/utils';
import useAuth from './useAuth';
import { AuthError, User, Session } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

// Import after mocking
import { supabase } from '@/integrations/supabase/client';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock successful auth session with complete User and Session types
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { 
        session: { 
          user: {
            id: 'test-id',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2024-01-01T00:00:00.000Z',
            role: 'authenticated',
            updated_at: '2024-01-01T00:00:00.000Z'
          } as User,
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          expires_at: 1234567890
        } as Session
      }, 
      error: null 
    });
  });

  it('should sign in user successfully', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { 
        user: {
          id: 'test-id',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z',
          role: 'authenticated',
          updated_at: '2024-01-01T00:00:00.000Z'
        } as User,
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {} as User,
          expires_at: 1234567890
        } as Session
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign in errors', async () => {
    // Create a valid AuthError instance by mocking its structure
    const error = {
      name: 'AuthError',
      message: 'Invalid login credentials',
      status: 400,
      code: 'invalid_credentials'
    };
    
    // Cast as any to bypass TypeScript's type checking for the test
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: error as unknown as AuthError,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('wrong@example.com', 'wrongpassword');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });
  });

  it('should sign out successfully', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
