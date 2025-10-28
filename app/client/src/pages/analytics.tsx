import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Analytics() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/pricing");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (user.tier !== "pro") {
    return (
      <div className="p-6">
        <UpgradePrompt
          title="Advanced Analytics Dashboard"
          description="Get deep insights into your restaurant's performance with AI-powered analytics"
          features={[
            "Real-time performance metrics and KPIs",
            "Predictive sales forecasting",
            "Custom report builder",
            "Trend analysis and pattern recognition",
            "Profit margin optimization insights",
            "Comparative analysis across time periods",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="analytics-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </div>
      <div className="text-muted-foreground">
        <p>Analytics features coming soon...</p>
      </div>
    </div>
  );
}
