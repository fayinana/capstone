import { ReactNode, createContext, useContext, useState } from "react";
import { toast as sonnerToast } from "sonner";

type ToastActionElement = React.ReactElement;

export type ToastProps = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

const defaultDuration = 5000;

type ToasterToast = ToastProps & {
  id: string;
  createdAt: number;
};

type ToastContextType = {
  toasts: ToasterToast[];
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
    duration = defaultDuration,
    action,
  }: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      title,
      description,
      variant,
      duration,
      action,
      createdAt: Date.now(),
    };

    setToasts((currentToasts) => [...currentToasts, newToast]);

    const options: Record<string, any> = {
      duration,
      id,
      style: {
        backgroundColor: "rgba(24, 24, 27, 0.9)", // Zinc-900 with opacity
        color: "white",
        backdropFilter: "blur(8px)",
        border:
          variant === "destructive"
            ? "1px solid #ef4444" // Red-500
            : variant === "success"
              ? "1px solid #22c55e" // Green-500
              : "1px solid rgba(234, 179, 8, 0.2)", // Yellow-300/20
        borderLeft:
          variant === "destructive"
            ? "4px solid #ef4444" // Red-500
            : variant === "success"
              ? "4px solid #22c55e" // Green-500
              : "4px solid #eab308", // Yellow-500
      },
    };

    if (action) {
      options.action = {
        label: typeof action === "string" ? action : "Action",
        onClick: () => {},
      };
    }

    switch (variant) {
      case "destructive":
        sonnerToast.error(title, {
          description,
          ...options,
        });
        break;
      case "success":
        sonnerToast.success(title, {
          description,
          ...options,
        });
        break;
      default:
        sonnerToast(title, {
          description,
          ...options,
        });
    }

    // Remove the toast after it expires
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id),
      );
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default useToast;
