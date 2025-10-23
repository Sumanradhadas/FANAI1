import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Celebrity, Template } from "@shared/schema";

export default function CelebrityPage() {
  const [, params] = useRoute("/celebrity/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug;

  const { data: celebrity, isLoading: loadingCeleb } = useQuery<Celebrity>({
    queryKey: ["/api/celebrities", slug],
    enabled: !!slug,
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  if (loadingCeleb) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="h-64 md:h-96 bg-muted animate-pulse rounded-lg mb-8" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Celebrity not found</h1>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-64 md:h-96 overflow-hidden">
        {celebrity.imageUrl ? (
          <>
            <img
              src={celebrity.imageUrl}
              alt={celebrity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
        )}
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-8 w-full">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-4 text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {celebrity.name}
            </h1>
            {celebrity.category && (
              <Badge variant="secondary" className="text-base">
                {celebrity.category}
              </Badge>
            )}
            {celebrity.description && (
              <p className="text-white/90 mt-4 max-w-2xl">{celebrity.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Choose a Template</h2>
          </div>

          {loadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No templates available yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setLocation(`/generate/${celebrity.slug}/${template.slug}`)}
                  data-testid={`card-template-${template.slug}`}
                >
                  <div className="relative aspect-video">
                    {template.previewUrl ? (
                      <img
                        src={template.previewUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-lg text-white">{template.name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {template.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
