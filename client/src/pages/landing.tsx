import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Upload, Wand2, Download, Shield, Zap, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Celebrity } from "@shared/schema";
import { AdminLoginModal } from "@/components/admin-login-modal";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: celebrities = [] } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const filteredCelebrities = searchQuery.trim()
    ? celebrities.filter(celeb =>
        celeb.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (celeb: Celebrity) => {
    setSearchQuery(celeb.name);
    setShowSuggestions(false);
    setLocation(`/celebrity/${celeb.slug}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-6 py-24 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Powered by Advanced AI Technology
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Create Realistic AI Photos
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              With Your Favorite Celebrities
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate stunning, lifelike images with celebrities for festivals, campaigns, and special occasions.
            Professional quality in seconds.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative" ref={suggestionsRef}>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search for a celebrity... (e.g., Virat Kohli, Modi)"
                    className="h-14 pl-12 pr-4 text-base w-full"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    data-testid="input-search-hero"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8"
                  data-testid="button-search-hero"
                >
                  Search
                </Button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredCelebrities.length > 0 && (
                <Card className="absolute top-full mt-2 w-full z-20 shadow-lg">
                  {filteredCelebrities.map((celeb) => (
                    <div
                      key={celeb.id}
                      className="px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                      onClick={() => handleSuggestionClick(celeb)}
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{celeb.name}</p>
                        {celeb.category && (
                          <p className="text-sm text-muted-foreground">{celeb.category}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button size="lg" variant="outline" asChild data-testid="button-login-hero">
              <a href="/api/login">Get Started Free</a>
            </Button>
            <Button size="lg" variant="ghost" asChild data-testid="link-plans">
              <a href="#plans">View Plans</a>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 md:py-24 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Create your AI-generated photo in 4 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Search, title: "Search Celebrity", desc: "Find your favorite celebrity from our collection" },
              { icon: Wand2, title: "Choose Template", desc: "Select from festival, birthday, or campaign themes" },
              { icon: Upload, title: "Upload Photo", desc: "Upload a clear photo of yourself" },
              { icon: Download, title: "Get Result", desc: "Download your AI-generated realistic photo" },
            ].map((step, i) => (
              <Card key={i} className="p-6 text-center space-y-4 hover-elevate">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose FanAI?</h2>
            <p className="text-lg text-muted-foreground">Professional-grade AI technology at your fingertips</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Generate realistic photos in seconds with our optimized AI" },
              { icon: Shield, title: "Secure & Private", desc: "Your photos are processed securely and never shared" },
              { icon: Users, title: "Campaign Support", desc: "Special features for politicians and influencers" },
            ].map((feature, i) => (
              <Card key={i} className="p-8 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="px-6 py-16 md:py-24 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Basic", price: "₹5", credits: "1", popular: false },
              { name: "Silver", price: "₹50", credits: "25", popular: false },
              { name: "Gold", price: "₹100", credits: "100", popular: true },
              { name: "Diamond", price: "₹500", credits: "Unlimited", popular: false },
            ].map((plan) => (
              <Card 
                key={plan.name} 
                className={`p-6 space-y-6 relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.credits} generation{plan.credits !== '1' ? 's' : ''}</p>
                </div>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  <a href="/api/login">Get Started</a>
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="text-xl font-semibold mb-2">Campaign Plan</h3>
              <p className="text-3xl font-bold mb-2">₹10,000</p>
              <p className="text-sm text-muted-foreground mb-4">Unlimited generations + custom campaign link</p>
              <Button asChild data-testid="button-plan-campaign">
                <a href="/api/login">Contact Us</a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">FanAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create realistic AI photos with your favorite celebrities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#plans" className="hover:text-foreground">Pricing</a></li>
                <li><a href="/api/login" className="hover:text-foreground">Get Started</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/terms" className="hover:text-foreground" data-testid="link-terms">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-foreground" data-testid="link-privacy">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@fanai.in" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 FanAI. All rights reserved. Powered by advanced AI technology.</p>
            <AdminLoginModal />
          </div>
        </div>
      </footer>
    </div>
  );
}
