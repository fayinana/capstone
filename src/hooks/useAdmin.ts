import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

const checkIsAdmin = async (userId: string | undefined) => {
  if (!userId) return false;

  try {
    // Use maybeSingle instead of single to avoid errors when no results are found
    const { data, error } = await supabase.rpc("is_admin", { user_id: userId });

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    // Ensure we're returning a boolean value
    return !!data;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const useAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkIsAdmin(user?.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce unnecessary checks
  });

  return { isAdmin, isLoading };
};

export default useAdmin;
