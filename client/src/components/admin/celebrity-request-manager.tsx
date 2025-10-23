import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2, Loader2, UserPlus } from "lucide-react";
import type { CelebrityRequest } from "@shared/schema";

export function CelebrityRequestManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<CelebrityRequest | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch all celebrity requests
  const { data: allRequests = [], isLoading } = useQuery<CelebrityRequest[]>({
    queryKey: ["/api/admin/celebrity-requests"],
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, slug, notes }: { id: string; slug: string; notes?: string }) => {
      const response = await fetch(`/api/admin/celebrity-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, adminNotes: notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve request');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "Celebrity has been added to the database.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/celebrity-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setSlug("");
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/admin/celebrity-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject request');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The celebrity request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/celebrity-requests"] });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/celebrity-requests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Deleted",
        description: "The celebrity request has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/celebrity-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (request: CelebrityRequest) => {
    setSelectedRequest(request);
    // Generate slug suggestion from name
    const suggestedSlug = request.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(suggestedSlug);
    setApproveDialogOpen(true);
  };

  const handleReject = (request: CelebrityRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteMutation.mutate(id);
    }
  };

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const approvedRequests = allRequests.filter(r => r.status === 'approved');
  const rejectedRequests = allRequests.filter(r => r.status === 'rejected');

  const RequestCard = ({ request }: { request: CelebrityRequest }) => (
    <Card key={request.id} className="p-6">
      <div className="flex gap-4">
        {request.imageUrl && (
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={request.imageUrl}
              alt={request.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-semibold text-lg">{request.name}</h3>
              {request.category && (
                <Badge variant="secondary" className="mt-1">
                  {request.category}
                </Badge>
              )}
            </div>
            <Badge
              variant={
                request.status === 'approved' ? 'default' :
                request.status === 'rejected' ? 'destructive' : 
                'secondary'
              }
            >
              {request.status}
            </Badge>
          </div>
          
          {request.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {request.description}
            </p>
          )}

          {request.adminNotes && (
            <div className="mb-3 p-2 bg-muted rounded text-sm">
              <strong>Admin Notes:</strong> {request.adminNotes}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mb-3">
            Submitted: {new Date(request.createdAt!).toLocaleDateString()}
          </p>

          {request.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(request)}
                disabled={approveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(request)}
                disabled={rejectMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(request.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}

          {request.status !== 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(request.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Celebrity Requests</h2>
          <p className="text-muted-foreground">Review and approve user-submitted celebrities</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserPlus className="h-4 w-4" />
          <span>{pendingRequests.length} pending</span>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending requests</p>
            </Card>
          ) : (
            pendingRequests.map(request => <RequestCard key={request.id} request={request} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No approved requests</p>
            </Card>
          ) : (
            approvedRequests.map(request => <RequestCard key={request.id} request={request} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No rejected requests</p>
            </Card>
          ) : (
            rejectedRequests.map(request => <RequestCard key={request.id} request={request} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Celebrity Request</DialogTitle>
            <DialogDescription>
              Add "{selectedRequest?.name}" to the celebrity database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Celebrity Slug (URL-friendly) *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., virat-kohli"
              />
              <p className="text-xs text-muted-foreground">
                This will be used in URLs like /celebrity/{slug}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Any notes for this approval"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setSlug("");
                setAdminNotes("");
              }}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest && slug) {
                  approveMutation.mutate({
                    id: selectedRequest.id,
                    slug,
                    notes: adminNotes,
                  });
                }
              }}
              disabled={approveMutation.isPending || !slug}
            >
              {approveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Approve & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Celebrity Request</DialogTitle>
            <DialogDescription>
              Reject "{selectedRequest?.name}" request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Reason for Rejection (Optional)</Label>
              <Textarea
                id="reject-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Explain why this request is being rejected"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setAdminNotes("");
              }}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  rejectMutation.mutate({
                    id: selectedRequest.id,
                    notes: adminNotes,
                  });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
