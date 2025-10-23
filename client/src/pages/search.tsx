import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import type { Celebrity } from "@shared/schema";
import { CelebrityRequestDialog } from "@/components/celebrity-request-dialog";

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const { data: results = [], isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities/search", initialQuery],
    enabled: !!initialQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-12 max-w-2xl mx-auto">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search for a celebrity..."
                className="h-14 pl-12 pr-4 text-base w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-page"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8"
              data-testid="button-search-page"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Results */}
        {initialQuery && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Search results for "{initialQuery}"
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="aspect-[3/4] animate-pulse bg-muted" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching for a different celebrity name
                </p>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Can't find the celebrity you're looking for?
                  </p>
                  <Button
                    onClick={() => setRequestDialogOpen(true)}
                    variant="outline"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Request Celebrity
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((celeb) => (
                  <Card
                    key={celeb.id}
                    className="group aspect-[3/4] overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                    onClick={() => setLocation(`/celebrity/${celeb.slug}`)}
                    data-testid={`card-result-${celeb.slug}`}
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
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
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
        )}
      </div>

      <CelebrityRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
      />
    </div>
  );
}
