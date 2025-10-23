import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

export function AdminLoginModal() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setOpen(false);
      navigate('/admin');
    },
    onError: (err: any) => {
      setError(err.message || 'Invalid credentials');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ userId, password });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
          <DialogDescription>
            Enter your admin credentials to access the admin panel
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-userId">User ID</Label>
            <Input
              id="admin-userId"
              type="text"
              placeholder="Admin user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
