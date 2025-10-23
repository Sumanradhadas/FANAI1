import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload as UploadIcon, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Celebrity, Template } from "@shared/schema";

export default function GeneratePage() {
  const [, params] = useRoute("/generate/:celebritySlug/:templateSlug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showGuide, setShowGuide] = useState(false);

  const { data: celebrity } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", params?.celebritySlug],
    enabled: !!params?.celebritySlug,
  });

  const { data: template } = useQuery<Template>({
    queryKey: ["/api/templates", params?.templateSlug],
    enabled: !!params?.templateSlug,
  });

  const generateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest<{ generationId: string }>("POST", "/api/generate", formData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      toast({
        title: "Generation started!",
        description: "Your AI photo is being created. This may take a minute.",
      });
      setLocation(`/result/${data.generationId}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !celebrity || !template) return;

    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("celebrityId", celebrity.id);
    formData.append("templateId", template.id);

    generateMutation.mutate(formData);
  };

  if (!celebrity || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/celebrity/${celebrity.slug}`)}
          className="mb-6"
          data-testid="button-back-celeb"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {celebrity.name}
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Upload Your Photo</h1>
          <p className="text-muted-foreground">
            Creating: {template.name} with {celebrity.name}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Card */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="photo">Your Photo</Label>
                <div className="mt-2">
                  {previewUrl ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                        data-testid="button-remove-photo"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="photo"
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover-elevate active-elevate-2"
                    >
                      <UploadIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <span className="text-sm font-medium">Click to upload</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        data-testid="input-photo"
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowGuide(true)}
                data-testid="button-show-guide"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Photo Upload Guidelines
              </Button>

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || generateMutation.isPending}
                data-testid="button-generate"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate AI Photo"
                )}
              </Button>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Template Details</h3>
              <p className="text-sm text-muted-foreground">{template.description || template.prompt}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">What happens next?</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-primary font-medium">1</span>
                  </div>
                  <span>Upload a clear, well-lit photo of yourself</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-primary font-medium">2</span>
                  </div>
                  <span>Our AI will generate a realistic photo with {celebrity.name}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-primary font-medium">3</span>
                  </div>
                  <span>Download and share your AI-generated photo</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Guide Dialog */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo Upload Guidelines</DialogTitle>
            <DialogDescription>
              Follow these tips for the best AI generation results
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">Good Examples</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Clear, well-lit photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Single person, facing camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Full face visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>High resolution images</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold">Avoid</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>✗</span>
                  <span>Blurry or dark photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✗</span>
                  <span>Multiple people in frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✗</span>
                  <span>Face covered or partially visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✗</span>
                  <span>Low quality or pixelated images</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
