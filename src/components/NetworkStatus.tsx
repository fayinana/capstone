import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const offlineToastId = useRef<string | number | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      // Dismiss the offline toast if it's still showing
      if (offlineToastId.current) {
        toast.dismiss(offlineToastId.current);
        offlineToastId.current = null;
      }

      toast.success("You're back online", {
        description: "Your connection has been restored",
        icon: <Wifi className="h-4 w-4" />,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);

      // Show offline toast and store its ID for later dismissal
      offlineToastId.current = toast.error("You're offline", {
        description: "Check your connection and try again",
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // If the user starts offline, trigger the toast immediately
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null;
};

export default NetworkStatus;
