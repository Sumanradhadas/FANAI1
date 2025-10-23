import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Celebrity, InsertCelebrity } from "@shared/schema";

export function CelebrityManager() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCeleb, setEditingCeleb] = useState<Celebrity | null>(null);

  const { data: celebrities = [], isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/admin/celebrities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCelebrity) => {
      return await apiRequest("POST", "/api/admin/celebrities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/celebrities"] });
      toast({ title: "Celebrity created successfully" });
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create celebrity", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCelebrity> }) => {
      return await apiRequest("PATCH", `/api/admin/celebrities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/celebrities"] });
      toast({ title: "Celebrity updated successfully" });
      setShowDialog(false);
      setEditingCeleb(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update celebrity", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/celebrities/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/celebrities"] });
      toast({ title: "Celebrity deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete celebrity", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InsertCelebrity = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get("description") as string || undefined,
      imageUrl: formData.get("imageUrl") as string || undefined,
      category: formData.get("category") as string || undefined,
      isActive: true,
    };

    if (editingCeleb) {
      updateMutation.mutate({ id: editingCeleb.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Celebrity Management</h2>
        <Button onClick={() => { setEditingCeleb(null); setShowDialog(true); }} data-testid="button-add-celebrity">
          <Plus className="h-4 w-4 mr-2" />
          Add Celebrity
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : celebrities.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No celebrities yet. Add your first one!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {celebrities.map((celeb) => (
            <Card key={celeb.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold">{celeb.name}</h3>
                  {celeb.category && (
                    <Badge variant="outline" className="mt-1">
                      {celeb.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditingCeleb(celeb); setShowDialog(true); }}
                    data-testid={`button-edit-${celeb.slug}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete ${celeb.name}?`)) {
                        deleteMutation.mutate(celeb.id);
                      }
                    }}
                    data-testid={`button-delete-${celeb.slug}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {celeb.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{celeb.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCeleb ? 'Edit' : 'Add'} Celebrity</DialogTitle>
            <DialogDescription>
              {editingCeleb ? 'Update' : 'Create a new'} celebrity profile
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingCeleb?.name}
                required
                data-testid="input-celeb-name"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={editingCeleb?.category || undefined}>
                <SelectTrigger data-testid="select-celeb-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actor">Actor</SelectItem>
                  <SelectItem value="politician">Politician</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="musician">Musician</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (GitHub)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={editingCeleb?.imageUrl || undefined}
                placeholder="https://raw.githubusercontent.com/..."
                data-testid="input-celeb-image"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingCeleb?.description || undefined}
                rows={3}
                data-testid="input-celeb-description"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-celebrity">
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  editingCeleb ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
