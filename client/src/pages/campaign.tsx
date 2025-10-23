import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Loader2 } from "lucide-react";
import type { Campaign, Celebrity } from "@shared/schema";

export default function CampaignPage() {
  const [, params] = useRoute("/campaign/:slug");
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const { data: celebrities = [], isLoading: celebsLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  if (campaignLoading || celebsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-muted-foreground mb-6">This campaign link is invalid or has been removed.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Campaign Hero */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Megaphone className="h-4 w-4" />
            Campaign
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {campaign.name}
          </h1>

          {campaign.candidateName && (
            <p className="text-xl md:text-2xl text-muted-foreground">
              Supporting {campaign.candidateName}
            </p>
          )}

          {campaign.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {campaign.description}
            </p>
          )}

          {campaign.isActive && (
            <Badge variant="default" className="text-base px-4 py-2">
              Active Campaign
            </Badge>
          )}
        </div>
      </section>

      {/* Celebrities Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Create Your AI Photo</h2>
          </div>

          <p className="text-muted-foreground mb-8">
            Choose a celebrity to create your campaign photo with:
          </p>

          {celebrities.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No celebrities available yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {celebrities.slice(0, 8).map((celeb) => (
                <Card
                  key={celeb.id}
                  className="group aspect-[3/4] overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setLocation(`/celebrity/${celeb.slug}?campaign=${campaign.slug}`)}
                >
                  <div className="relative w-full h-full">
                    {celeb.imageUrl ? (
                      <img
                        src={celeb.imageUrl}
                        alt={celeb.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/50">
                          {celeb.name[0]}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-lg">{celeb.name}</h3>
                      {celeb.category && (
                        <Badge variant="secondary" className="mt-1">
                          {celeb.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Campaign Stats */}
          <Card className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Campaign Generations</p>
              <p className="text-4xl font-bold text-primary">{campaign.totalGenerations}</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
