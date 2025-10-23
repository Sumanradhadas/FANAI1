// Firebase Authentication Hook
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useFirebaseAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Send Firebase UID to backend to create session
        try {
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            }),
          });
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        } catch (error) {
          console.error('Error syncing user session:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await firebaseSignOut(auth);
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
    firebaseUser,
    loading,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
  };
}
