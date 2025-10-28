import { Check, X, Zap, TrendingUp, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const features = {
    free: [
      "Real-time Dashboard",
      "Professional P&L Export (Excel)",
      "Par Level Management",
      "POS Integration Setup Guide",
      "Basic Analytics",
      "Single Location",
    ],
    pro: [
      "Advanced Inventory Management",
      "AI-Powered Truck Ordering",
      "Predictive Analytics & Forecasting",
      "Variance Analysis & Loss Prevention",
      "Recipe Cost Management",
      "Target & Goal Tracking",
      "Multi-Location Support",
      "Priority Support",
      "API Access",
    ],
  };

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

  const handleGetStarted = (selectedTier: "free" | "pro") => {
    if (selectedTier === "pro") {
      if (isAuthenticated) {
        setLocation("/subscribe");
      } else {
        window.location.href = "/api/login";
      }
    } else {
      if (!isAuthenticated) {
        window.location.href = "/api/login";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge className="mb-2" data-testid="badge-pricing-header">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Odin's Eye Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            All-seeing AI intelligence for your restaurant. Start free, upgrade when ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="relative" data-testid="card-pricing-free">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                className="w-full"
                variant={user?.tier === "free" ? "secondary" : "outline"}
                onClick={() => handleGetStarted("free")}
                data-testid="button-get-started-free"
              >
                {user?.tier === "free" ? "Current Plan" : "Get Started Free"}
              </Button>
              <div className="space-y-3">
                <p className="font-semibold text-sm">Features included:</p>
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-primary shadow-lg" data-testid="card-pricing-pro">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For serious restaurant operators</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save thousands in waste and theft
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant={user?.tier === "pro" ? "secondary" : "default"}
                  onClick={() => handleGetStarted("pro")}
                  data-testid="button-get-started-pro"
                >
                  {user?.tier === "pro" ? "Current Plan" : "Upgrade to Pro"}
                </Button>
                {user?.tier === "pro" && user?.stripeCustomerId && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => manageBillingMutation.mutate()}
                    disabled={manageBillingMutation.isPending}
                    data-testid="button-manage-billing-pricing"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-sm">Pro features include:</p>
                {features.pro.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
          <Card className="text-center" data-testid="card-value-roi">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Proven ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customers save an average of <span className="font-bold text-foreground">$3,200/month</span> in reduced waste and theft
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="card-value-ai">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Patent-pending algorithms predict demand, prevent waste, and detect theft automatically
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="card-value-support">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Enterprise Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bank-level security, 99.9% uptime, and dedicated support for your restaurant operations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8 mt-16">
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Can I switch between plans?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade to Pro anytime. Your data stays with you, and you'll immediately unlock all Pro features.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, ACH transfers, and can provide invoicing for annual contracts.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Is there a free trial for Pro?</h3>
              <p className="text-muted-foreground">
                Yes! Start with our Free plan to test the platform, then we offer a 14-day free trial when you upgrade to Pro.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Do you offer enterprise pricing?</h3>
              <p className="text-muted-foreground">
                Absolutely. For multi-location restaurants (5+ locations) or custom integrations, contact us for volume pricing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-lg p-8 md:p-12 text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold">Ready to reduce waste and increase profits?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of restaurants using AI to optimize inventory, prevent loss, and boost their bottom line.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted("free")}
              data-testid="button-cta-start-free"
            >
              Start Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleGetStarted("pro")}
              data-testid="button-cta-upgrade-pro"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
