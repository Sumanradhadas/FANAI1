import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import type { Celebrity } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch trending celebrities
  const { data: celebrities = [], isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Search Section */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Create AI Photos with Celebrities
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Search for Your
            <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Favorite Celebrity
            </span>
          </h1>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search for a celebrity..."
                  className="h-14 pl-12 pr-4 text-base w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-home"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8"
                data-testid="button-search-home"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Trending Celebrities */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Trending Celebrities</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="aspect-[3/4] animate-pulse bg-muted" />
              ))}
            </div>
          ) : celebrities.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No celebrities available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {celebrities.slice(0, 8).map((celeb) => (
                <Card
                  key={celeb.id}
                  className="group aspect-[3/4] overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setLocation(`/celebrity/${celeb.slug}`)}
                  data-testid={`card-celebrity-${celeb.slug}`}
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
        </div>
      </section>
    </div>
  );
}
