import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useErrorHandler } from "./useErrorHandler";

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  }),
}));

describe("useErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle API errors with custom message", () => {
    const { result } = renderHook(() => useErrorHandler());

    const error = new Error("Network error");
    const options = {
      fallbackMessage: "Something went wrong",
      showToast: true,
    };

    expect(() => {
      result.current.handleApiError(error, options);
    }).not.toThrow();
  });

  it("should handle validation errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    const validationError = new Error("Validation failed");

    expect(() => {
      result.current.handleValidationError(validationError);
    }).not.toThrow();
  });

  it("should handle network errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    const networkError = new Error("Network error");

    expect(() => {
      result.current.handleNetworkError(networkError);
    }).not.toThrow();
  });
});
