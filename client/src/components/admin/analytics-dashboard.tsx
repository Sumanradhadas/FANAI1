import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, Sparkles, TrendingUp, Activity } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalGenerations: number;
  totalCelebrities: number;
  totalCampaigns: number;
  recentGenerations: number;
}

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Generations",
      value: analytics?.totalGenerations || 0,
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Celebrities",
      value: analytics?.totalCelebrities || 0,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Campaigns",
      value: analytics?.totalCampaigns || 0,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Overview</h2>
        <p className="text-muted-foreground">Platform usage and performance metrics</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>Recent generations: {analytics?.recentGenerations || 0} (last 24 hours)</p>
        </div>
      </Card>
    </div>
  );
}
