import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.log("Firebase signout error (might be admin):", error);
      }
      
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutateAsync,
  };
}
