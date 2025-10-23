import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Search from "@/pages/search";
import CelebrityPage from "@/pages/celebrity";
import GeneratePage from "@/pages/generate";
import ResultPage from "@/pages/result";
import Dashboard from "@/pages/dashboard";
import AdminPanel from "@/pages/admin";
import CampaignPage from "@/pages/campaign";
import AuthPage from "@/pages/auth";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/search" component={Search} />
        <Route path="/celebrity/:slug" component={CelebrityPage} />
        <Route path="/campaign/:slug" component={CampaignPage} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/celebrity/:slug" component={CelebrityPage} />
      <Route path="/campaign/:slug" component={CampaignPage} />
      <Route path="/generate/:celebritySlug/:templateSlug" component={GeneratePage} />
      <Route path="/result/:id" component={ResultPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="fanai-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
