import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CelebrityManager } from "@/components/admin/celebrity-manager";
import { CelebrityRequestManager } from "@/components/admin/celebrity-request-manager";
import { TemplateManager } from "@/components/admin/template-manager";
import { CampaignManager } from "@/components/admin/campaign-manager";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { Users, Wand2, Megaphone, BarChart3, UserPlus } from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  if (isLoading || user?.role !== 'admin') {
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
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage celebrities, templates, and campaigns</p>
        </div>

        <Tabs defaultValue="celebrities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="celebrities" data-testid="tab-celebrities">
              <Users className="h-4 w-4 mr-2" />
              Celebrities
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Wand2 className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">
              <Megaphone className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="celebrities">
            <CelebrityManager />
          </TabsContent>

          <TabsContent value="requests">
            <CelebrityRequestManager />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
