import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Loader2, Gift } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Template, InsertTemplate } from "@shared/schema";

export function TemplateManager() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/admin/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTemplate) => {
      return await apiRequest("POST", "/api/admin/templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({ title: "Template created successfully" });
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create template", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTemplate> }) => {
      return await apiRequest("PATCH", `/api/admin/templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({ title: "Template updated successfully" });
      setShowDialog(false);
      setEditingTemplate(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update template", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/templates/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({ title: "Template deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete template", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tagsStr = formData.get("tags") as string;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : undefined;

    const data: InsertTemplate = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-'),
      prompt: formData.get("prompt") as string,
      description: formData.get("description") as string || undefined,
      category: formData.get("category") as string || undefined,
      previewUrl: formData.get("previewUrl") as string || undefined,
      tags,
      isFree: formData.get("isFree") === "on",
      isActive: true,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Template Management</h2>
        <Button onClick={() => { setEditingTemplate(null); setShowDialog(true); }} data-testid="button-add-template">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No templates yet. Add your first one!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.isFree && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <Gift className="h-3 w-3 mr-1" />
                        Free
                      </Badge>
                    )}
                  </div>
                  {template.category && (
                    <Badge variant="outline" className="mt-1">
                      {template.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditingTemplate(template); setShowDialog(true); }}
                    data-testid={`button-edit-${template.slug}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete ${template.name}?`)) {
                        deleteMutation.mutate(template.id);
                      }
                    }}
                    data-testid={`button-delete-${template.slug}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{template.prompt}</p>
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit' : 'Add'} Template</DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update' : 'Create a new'} AI generation template
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingTemplate?.name}
                placeholder="Birthday Celebration"
                required
                data-testid="input-template-name"
              />
            </div>

            <div>
              <Label htmlFor="prompt">AI Generation Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                defaultValue={editingTemplate?.prompt}
                placeholder="User standing beside {{celeb_name}} cutting cake with smiles."
                rows={4}
                required
                data-testid="input-template-prompt"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {"{{"} celeb_name {"}"} as placeholder for celebrity name
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingTemplate?.description || undefined}
                placeholder="Perfect for birthday celebrations"
                data-testid="input-template-description"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingTemplate?.category || undefined}
                  placeholder="birthday, festival, campaign"
                  data-testid="input-template-category"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingTemplate?.tags?.join(', ')}
                  placeholder="birthday, celebration, cake"
                  data-testid="input-template-tags"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="previewUrl">Preview Image URL (optional)</Label>
              <Input
                id="previewUrl"
                name="previewUrl"
                type="url"
                defaultValue={editingTemplate?.previewUrl || undefined}
                placeholder="https://raw.githubusercontent.com/..."
                data-testid="input-template-preview"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isFree" 
                name="isFree" 
                defaultChecked={editingTemplate?.isFree || false}
                data-testid="checkbox-template-free"
              />
              <Label htmlFor="isFree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Free Template (No credits required for campaigns)
              </Label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-template">
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  editingTemplate ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
