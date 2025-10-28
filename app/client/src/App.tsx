import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import InventoryEntry from "@/pages/inventory-entry";
import ParLevels from "@/pages/par-levels";
import PosIntegrations from "@/pages/pos-integrations";
import Recipes from "@/pages/recipes";
import Targets from "@/pages/targets";
import Analytics from "@/pages/analytics";
import Variance from "@/pages/variance";
import Algorithms from "@/pages/algorithms";
import PLDashboard from "@/pages/pl-dashboard";
import ComprehensivePL from "@/pages/comprehensive-pl";
import POSSetupGuide from "@/pages/pos-setup-guide";
import TruckOrdering from "@/pages/truck-ordering";
import Pricing from "@/pages/pricing";
import Landing from "@/pages/landing";
import Contact from "@/pages/contact";
import Subscribe from "@/pages/subscribe";
import StatusPage from "@/pages/status";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show landing page at root for unauthenticated users
  // All other routes are accessible, but each page handles its own auth/tier logic
  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Landing} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/inventory-entry" component={InventoryEntry} />
      <Route path="/par-levels" component={ParLevels} />
      <Route path="/pos-integrations" component={PosIntegrations} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/targets" component={Targets} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/variance" component={Variance} />
      <Route path="/algorithms" component={Algorithms} />
      <Route path="/pl-dashboard" component={PLDashboard} />
      <Route path="/comprehensive-pl" component={ComprehensivePL} />
      <Route path="/pos-setup-guide" component={POSSetupGuide} />
      <Route path="/truck-ordering" component={TruckOrdering} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/landing" component={Landing} />
      <Route path="/contact" component={Contact} />
      <Route path="/status" component={StatusPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppHeader() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const manageBillingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-portal-session");
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    },
  });

  return (
    <header className="flex items-center justify-between p-2 border-b bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <h1 className="font-semibold text-lg text-foreground">Odin's Eye</h1>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
            <UserIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {user.tier === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
        )}
        {isAuthenticated && user?.tier === 'pro' && user?.stripeCustomerId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => manageBillingMutation.mutate()}
            disabled={manageBillingMutation.isPending}
            data-testid="button-manage-billing"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Manage Billing</span>
          </Button>
        )}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="restaurant-theme">
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
