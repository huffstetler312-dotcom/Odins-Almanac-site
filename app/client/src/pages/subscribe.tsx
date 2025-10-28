import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Shield } from "lucide-react";

export default function Subscribe() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/api/login';
    }
  }, [isAuthenticated, authLoading]);

  // Redirect to dashboard if already Pro
  useEffect(() => {
    if (user?.tier === 'pro') {
      window.location.href = '/';
    }
  }, [user]);

  if (authLoading || !isAuthenticated) {
    return <div className="p-6">Loading...</div>;
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/create-checkout-session");
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const proFeatures = [
    "🔮 Predictive Inventory Optimization (PIOE)",
    "🛡️ AI-Powered Waste Prevention (IWPPS)",
    "📊 Variance Analysis & Theft Detection (IVALPS)",
    "🚚 Smart Truck Ordering System",
    "💰 Comprehensive P&L Dashboard",
    "📈 Advanced Analytics & Forecasting",
    "🎯 Target & Goal Management",
    "👨‍🍳 Recipe Cost Optimization",
    "🏆 Priority Support & Training",
  ];

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Upgrade to Odin's Eye Pro</h1>
        <p className="text-xl text-muted-foreground">
          AI-powered restaurant intelligence that sees everything, prevents losses, maximizes profit
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>🔱 Pro Features</CardTitle>
            <CardDescription>6 Patentable AI Innovations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold">⚡ Proven ROI:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Customers save an average of <strong>$3,200/month</strong> in reduced waste, theft prevention, and optimized ordering.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Start Your Pro Subscription</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">$199</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure checkout powered by Stripe</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary" />
                <span>Cancel anytime, no questions asked</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary" />
                <span>Instant access to all Pro features</span>
              </div>
            </div>

            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full"
              size="lg"
              data-testid="button-checkout"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to secure checkout...
                </>
              ) : (
                'Subscribe to Pro - $199/month'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to automatic monthly billing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Questions? <a href="/contact" className="text-primary hover:underline">Contact our team</a>
        </p>
      </div>
    </div>
  );
}
