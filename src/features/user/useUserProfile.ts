import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "@/api/user";
import { useToast } from "@/hooks/use-toast";

export default function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId, // Prevent fetching if userId is null
  });
}
