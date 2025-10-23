import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Home, Loader2, AlertCircle, Sparkles } from "lucide-react";
import type { Generation, Celebrity, Template } from "@shared/schema";

export default function ResultPage() {
  const [, params] = useRoute("/result/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;

  const { data: generation, isLoading, refetch } = useQuery<Generation>({
    queryKey: ["/api/generations", id],
    enabled: !!id,
    refetchInterval: (data) => {
      // Poll every 3 seconds while generation is pending or processing
      return data?.status === 'pending' || data?.status === 'processing' ? 3000 : false;
    },
  });

  const { data: celebrity } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", generation?.celebrityId],
    enabled: !!generation?.celebrityId,
  });

  const { data: template } = useQuery<Template>({
    queryKey: ["/api/templates", generation?.templateId],
    enabled: !!generation?.templateId,
  });

  useEffect(() => {
    if (generation?.status === 'pending' || generation?.status === 'processing') {
      refetch();
    }
  }, [generation?.status, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-12 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Generation not found</h2>
          <p className="text-muted-foreground mb-6">
            This generation doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-home">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // Processing state
  if (generation.status === 'pending' || generation.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-12 text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Creating Your AI Photo</h2>
          <p className="text-muted-foreground mb-4">
            {generation.status === 'pending' 
              ? "Your generation is queued and will start shortly..."
              : "Our AI is generating your photo with " + (celebrity?.name || "the celebrity") + "..."
            }
          </p>
          <div className="flex items-center justify-center gap-1 mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-muted-foreground">This usually takes 30-60 seconds</p>
        </Card>
      </div>
    );
  }

  // Failed state
  if (generation.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-12 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Generation Failed</h2>
          <p className="text-muted-foreground mb-4">
            {generation.errorMessage || "An error occurred while generating your photo."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setLocation("/dashboard")} data-testid="button-dashboard">
              View History
            </Button>
            <Button onClick={() => setLocation("/")} data-testid="button-try-again">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Generation Complete!
          </div>
          <h1 className="text-4xl font-bold mb-2">Your AI Photo is Ready</h1>
          {celebrity && template && (
            <p className="text-muted-foreground">
              {template.name} with {celebrity.name}
            </p>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="relative bg-muted">
            {generation.generatedImageUrl ? (
              <img
                src={generation.generatedImageUrl}
                alt="Generated AI photo"
                className="w-full h-auto max-h-[600px] object-contain mx-auto"
                data-testid="img-result"
              />
            ) : (
              <div className="aspect-square max-w-2xl mx-auto flex items-center justify-center">
                <p className="text-muted-foreground">Image not available</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-card">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  if (generation.generatedImageUrl) {
                    const link = document.createElement('a');
                    link.href = generation.generatedImageUrl;
                    link.download = `fanai-${celebrity?.slug || 'photo'}-${Date.now()}.png`;
                    link.click();
                  }
                }}
                data-testid="button-download"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Photo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation(`/celebrity/${celebrity?.slug || ''}`)}
                data-testid="button-generate-another"
              >
                Generate Another
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-view-history"
              >
                View History
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
