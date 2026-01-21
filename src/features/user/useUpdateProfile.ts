import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/api/user";
import { useToast } from "@/hooks/use-toast";

export default function useUpdateProfile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, profile }: { userId: string; profile: any }) =>
      updateUserProfile(userId, profile),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });
}
