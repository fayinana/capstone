import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AppError, ErrorCategory, handleError } from "@/utils/errors";

export function useErrorHandler() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApiError = (
    error: unknown,
    options?: {
      fallbackMessage?: string;
      redirectTo?: string;
      showToast?: boolean;
      logError?: boolean;
    },
  ): AppError => {
    const {
      fallbackMessage = "An unexpected error occurred",
      redirectTo,
      showToast = true,
      logError = true,
    } = options || {};

    // Transform and categorize the error
    const appError = handleError(error);

    // Log error if needed
    if (logError) {
      console.error("API Error:", appError);
    }

    // Show toast if needed
    if (showToast) {
      const toastMessage = appError.getUserFriendlyMessage() || fallbackMessage;

      toast({
        title: appError.name,
        description: toastMessage,
        variant: "destructive",
      });
    }

    // Handle special error cases
    if (appError.category === ErrorCategory.Authentication) {
      // For auth errors, redirect to login
      navigate("/auth/login");
      return appError;
    }

    if (appError.category === ErrorCategory.NotFound) {
      // For not found errors, redirect to not found page
      navigate("/not-found");
      return appError;
    }

    // If a redirect is specified, go there
    if (redirectTo) {
      navigate(redirectTo);
    }

    return appError;
  };

  return { handleApiError };
}
