import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface CelebrityRequestForm {
  name: string;
  description: string;
  category: string;
  image: FileList;
}

interface CelebrityRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CelebrityRequestDialog({ open, onOpenChange }: CelebrityRequestDialogProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<CelebrityRequestForm>();

  const createRequestMutation = useMutation({
    mutationFn: async (data: CelebrityRequestForm) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('image', data.image[0]);

      const response = await fetch('/api/celebrity-requests', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request submitted!",
        description: "Your celebrity request has been submitted for admin review. We'll notify you once it's approved.",
      });
      reset();
      setImagePreview(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CelebrityRequestForm) => {
    createRequestMutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request a Celebrity</DialogTitle>
          <DialogDescription>
            Can't find the celebrity you're looking for? Submit a request and our admin will review it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Celebrity Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Virat Kohli"
              {...register('name', { required: 'Celebrity name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actor">Actor</SelectItem>
                <SelectItem value="politician">Politician</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="singer">Singer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register('category', { required: 'Category is required' })}
            />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional information about this celebrity"
              {...register('description')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Celebrity Image *</Label>
            <div className="flex flex-col gap-2">
              {imagePreview ? (
                <div className="relative aspect-square w-32 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-32 rounded-lg border-2 border-dashed flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                {...register('image', { required: 'Celebrity image is required' })}
                onChange={handleImageChange}
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                JPG or PNG, max 10MB
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRequestMutation.isPending}>
              {createRequestMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
