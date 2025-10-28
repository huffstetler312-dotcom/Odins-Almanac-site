import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Inventory() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect unauthenticated users to pricing/login flow
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/pricing");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (user.tier !== "pro") {
    return (
      <div className="p-6">
        <UpgradePrompt
          title="Advanced Inventory Management"
          description="Unlock powerful inventory tracking, automated alerts, and detailed analytics"
          features={[
            "Real-time inventory tracking across all locations",
            "Automated low stock alerts and notifications",
            "Advanced reporting and analytics",
            "Batch operations and bulk updates",
            "Integration with POS systems",
            "Historical inventory trends and insights",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="inventory-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
      </div>
      <div className="text-muted-foreground">
        <p>Inventory management features coming soon...</p>
      </div>
    </div>
  );
}
