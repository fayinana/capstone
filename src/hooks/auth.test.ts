import { describe, it, expect, vi } from "vitest";
import * as authModule from "./auth";
import useAuth from "@/features/auth/useAuth";

// Mock the useAuth hook from features
vi.mock("@/features/auth/useAuth");

describe("Auth Hook Re-export", () => {
  it("should re-export useAuth from features/auth", () => {
    // Verify that the re-export is the same as the original
    expect(authModule.useAuth).toBe(useAuth);
  });

  it("should maintain the same interface as the original useAuth", () => {
    const mockAuth = {
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      user: { id: "123", email: "test@example.com" },
      session: { expires_at: 12345 },
      loading: false,
    };

    vi.mocked(useAuth).mockReturnValue(mockAuth as any);

    // When we import useAuth from hooks/auth
    const importedAuth = authModule.useAuth();

    // It should have the same interface
    expect(importedAuth).toEqual(mockAuth);
    expect(importedAuth.signIn).toBeDefined();
    expect(importedAuth.signOut).toBeDefined();
    expect(importedAuth.signUp).toBeDefined();
  });
});
