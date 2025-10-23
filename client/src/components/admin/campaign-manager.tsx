import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Link as LinkIcon, Trash2, Loader2, Copy, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Campaign, InsertCampaign } from "@shared/schema";

export function CampaignManager() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCampaign) => {
      return await apiRequest("POST", "/api/admin/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign created successfully" });
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/campaigns/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete campaign", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InsertCampaign = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: formData.get("description") as string || undefined,
      candidateName: formData.get("candidateName") as string || undefined,
      celebrityId: undefined,
      userId: undefined,
      isActive: true,
    };

    createMutation.mutate(data);
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/campaign/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(slug);
    toast({ title: "Campaign link copied!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign Management</h2>
          <p className="text-sm text-muted-foreground">Create custom campaign links for politicians and influencers</p>
        </div>
        <Button onClick={() => setShowDialog(true)} data-testid="button-add-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No campaigns yet. Create your first one!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  {campaign.candidateName && (
                    <p className="text-sm text-muted-foreground">{campaign.candidateName}</p>
                  )}
                  <Badge variant={campaign.isActive ? "default" : "secondary"} className="mt-2">
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete ${campaign.name}?`)) {
                      deleteMutation.mutate(campaign.id);
                    }
                  }}
                  data-testid={`button-delete-campaign-${campaign.slug}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm font-mono">
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate flex-1">/campaign/{campaign.slug}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => copyLink(campaign.slug)}
                    data-testid={`button-copy-link-${campaign.slug}`}
                  >
                    {copiedId === campaign.slug ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Generations:</span>
                  <span className="font-semibold">{campaign.totalGenerations}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Generate a custom campaign link for politicians or influencers
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Modi 2024 Campaign"
                required
                data-testid="input-campaign-name"
              />
            </div>

            <div>
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                name="candidateName"
                placeholder="Narendra Modi"
                data-testid="input-campaign-candidate"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Campaign description..."
                data-testid="input-campaign-description"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-campaign">
                {createMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
