import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Sparkles, CreditCard, Eye } from "lucide-react";
import type { Generation, User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const { data: generations = [], isLoading: loadingHistory } = useQuery<Generation[]>({
    queryKey: ["/api/generations"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
                <p className="text-2xl font-bold">{user?.credits || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Generations</p>
                <p className="text-2xl font-bold">{generations.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{user?.plan || 'Free'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Generation History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Generation History</h2>
            <Button onClick={() => setLocation("/")} data-testid="button-create-new">
              <Sparkles className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>

          {loadingHistory ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="aspect-video animate-pulse bg-muted" />
              ))}
            </div>
          ) : generations.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating AI photos with your favorite celebrities!
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-get-started">
                Get Started
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <Card
                  key={gen.id}
                  className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setLocation(`/result/${gen.id}`)}
                  data-testid={`card-generation-${gen.id}`}
                >
                  <div className="relative aspect-video bg-muted">
                    {gen.generatedImageUrl ? (
                      <img
                        src={gen.generatedImageUrl}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        gen.status === 'completed' ? 'default' :
                        gen.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {gen.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(gen.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
