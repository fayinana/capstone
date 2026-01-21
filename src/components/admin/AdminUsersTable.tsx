import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MoreHorizontal,
  BadgeCheck,
  BadgeX,
  UserCog,
  Trash2,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  created_at: string;
  isAdmin: boolean;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

const AdminUsersTable = () => {
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // First, get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, avatar_url, created_at, phone_number"
        );

      if (profilesError) throw profilesError;

      // Then, get all users with admin status
      const { data: adminData, error: adminError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (adminError) throw adminError;

      // Create a map of admin users
      const adminUsers = new Map();
      adminData.forEach((admin) => {
        if (admin.role === "admin") {
          adminUsers.set(admin.user_id, true);
        }
      });

      // Combine profile data with admin status
      const usersWithAdminStatus = profilesData.map((profile) => {
        return {
          id: profile.id,
          email: `user_${profile.id.substring(0, 6)}@example.com`, // We don't have direct access to email
          created_at: profile.created_at,
          isAdmin: adminUsers.has(profile.id),
          profile: {
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            avatar_url: profile.avatar_url || "",
            phone_number: profile.phone_number || "",
          },
        };
      });

      return usersWithAdminStatus;
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({
      userId,
      isAdmin,
    }: {
      userId: string;
      isAdmin: boolean;
    }) => {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
        return { userId, isNowAdmin: false };
      } else {
        // Add admin role
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "admin",
        });

        if (error) throw error;
        return { userId, isNowAdmin: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: data.isNowAdmin
          ? "Admin Rights Granted"
          : "Admin Rights Removed",
        description: data.isNowAdmin
          ? "User is now an administrator"
          : "User is no longer an administrator",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed",
        description: error.message || "Failed to update user privileges",
        variant: "destructive",
      });
    },
  });

  const handleToggleAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin: isCurrentlyAdmin });
  };

  // In a real app, this would need to be handled carefully
  // This is just for demonstration
  const handleDeleteUser = async (userId: string) => {
    try {
      toast({
        title: "User Deletion",
        description: "This would delete the user in a production environment",
        variant: "default",
      });

      setUserToDelete(null);
      // No actual deletion for demo
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-300/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow>
                <TableHead className="font-semibold text-white">User</TableHead>
                <TableHead className="font-semibold text-white">
                  Contact
                </TableHead>
                <TableHead className="font-semibold text-white">
                  Joined
                </TableHead>
                <TableHead className="font-semibold text-white">Role</TableHead>
                <TableHead className="font-semibold text-white text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((item) => (
                <TableRow key={item} className="border-t border-yellow-300/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-300/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow>
              <TableHead className="font-semibold text-white">User</TableHead>
              <TableHead className="font-semibold text-white">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-white">Joined</TableHead>
              <TableHead className="font-semibold text-white">Role</TableHead>
              <TableHead className="font-semibold text-white text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-t border-yellow-300/10"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile?.avatar_url} />
                        <AvatarFallback className="bg-yellow-300/20 text-yellow-300">
                          {user.profile?.first_name
                            ? user.profile.first_name[0] +
                              (user.profile.last_name
                                ? user.profile.last_name[0]
                                : "")
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.profile?.first_name && user.profile?.last_name
                            ? `${user.profile.first_name} ${user.profile.last_name}`
                            : "Anonymous User"}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {user.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{user.email}</p>
                      {user.profile?.phone_number && (
                        <p className="text-sm text-zinc-500">
                          {user.profile.phone_number}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                        user.isAdmin
                          ? "bg-yellow-300/10 text-yellow-300 border border-yellow-300/30"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "User"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-zinc-900 border-yellow-300/20"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleAdmin(user.id, user.isAdmin)
                          }
                        >
                          {user.isAdmin ? (
                            <>
                              <BadgeX className="mr-2 h-4 w-4" />
                              <span>Remove Admin</span>
                            </>
                          ) : (
                            <>
                              <BadgeCheck className="mr-2 h-4 w-4" />
                              <span>Make Admin</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(user.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete User</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-zinc-500"
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <User className="h-12 w-12 text-zinc-500 mb-2" />
                    <p>No users found</p>
                    <p className="text-sm text-zinc-600 mt-1">
                      Create users to manage them here
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-yellow-300/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersTable;
