import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, TrendingUp, Shield, Zap, BarChart, Package, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    // Use SPA navigation to pricing/auth flow
    setLocation("/pricing");
  };

  const handleUpgradeToPro = () => {
    setLocation("/pricing");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Odin's Eye Sees All, Prevents All
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered restaurant intelligence that predicts demand, prevents waste, and catches theft before it hurts your bottom line.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                data-testid="button-hero-get-started"
              >
                Start Free Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleUpgradeToPro}
                data-testid="button-hero-view-pricing"
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Your Restaurant is Bleeding Money
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Most restaurants lose 4-10% of revenue to preventable issues
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card data-testid="card-problem-waste">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle>Food Waste</CardTitle>
                  <CardDescription>4-10% of food cost</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Over-ordering, spoilage, and poor rotation cost the average restaurant $3,000-$8,000 per month
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-problem-theft">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle>Inventory Shrinkage</CardTitle>
                  <CardDescription>2-5% of inventory value</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Employee theft, vendor fraud, and tracking errors silently drain profits every single day
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-problem-efficiency">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle>Manual Processes</CardTitle>
                  <CardDescription>10-20 hours per week</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Spreadsheets, manual counts, and guesswork waste valuable management time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              AI-Powered Solution That Pays for Itself
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Patent-pending technology that saves restaurants an average of $3,200/month
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card data-testid="card-solution-predict">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Predict Demand with 95% Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Our AI analyzes your sales history, weather patterns, and local events to predict exactly what you'll need.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Automatic truck order generation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Smart par level optimization</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Reduce waste by 40-60%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-solution-detect">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Catch Theft Before It Hurts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Real-time variance analysis detects suspicious patterns and alerts you to potential theft or fraud.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Automated variance tracking</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>ML-powered theft detection</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Reduce shrinkage by 50-70%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-solution-integrate">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Works With Your POS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Seamless integration with Square, Toast, Clover, and Lightspeed. No manual data entry required.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>One-click POS sync</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Real-time sales tracking</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Setup in under 10 minutes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-solution-insights">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Professional P&L Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Export investor-ready P&L statements with budget comparisons, YoY analysis, and industry benchmarks.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Multi-period comparisons</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Live Excel formulas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Industry benchmarking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Trusted by Restaurant Operators
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card data-testid="card-testimonial-1">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    "Cut our food waste by 45% in the first two months. The AI predictions are scary accurate."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">MR</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Mike Rodriguez</p>
                      <p className="text-xs text-muted-foreground">Owner, Taco Express</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-testimonial-2">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    "Caught a vendor overcharging us by $1,200/month. The system paid for itself immediately."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">SC</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">GM, Harvest Bistro</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-testimonial-3">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    "Saves me 15 hours a week on inventory and ordering. I can finally focus on my customers."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">JP</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">James Park</p>
                      <p className="text-xs text-muted-foreground">Chef/Owner, Seoul Kitchen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-primary/5 rounded-lg p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Start Saving Money Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of restaurants using AI to cut waste, prevent theft, and boost profits. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                data-testid="button-cta-get-started"
              >
                Start Free Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleUpgradeToPro}
                data-testid="button-cta-view-pricing"
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free forever plan • Upgrade anytime • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
