import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Variance() {
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
          title="Variance Analysis & Loss Prevention"
          description="Detect inventory discrepancies, prevent theft, and reduce shrinkage"
          features={[
            "Real-time variance detection",
            "AI-powered loss pattern recognition",
            "Automated theft alerts",
            "Detailed audit trails",
            "Supplier quality correlation",
            "Comprehensive reporting and insights",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="variance-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Variance Analysis</h1>
      </div>
      <div className="text-muted-foreground">
        <p>Variance analysis features coming soon...</p>
      </div>
    </div>
  );
}
