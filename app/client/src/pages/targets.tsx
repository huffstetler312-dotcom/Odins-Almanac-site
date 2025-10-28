import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Targets() {
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
          title="Target & Goal Management"
          description="Set operational goals, track performance, and drive improvement"
          features={[
            "Custom target setting for all metrics",
            "Progress tracking and visualization",
            "Automated performance alerts",
            "Team goal sharing and collaboration",
            "Historical target achievement analysis",
            "Benchmarking against industry standards",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="targets-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Target Management</h1>
      </div>
      <div className="text-muted-foreground">
        <p>Target management features coming soon...</p>
      </div>
    </div>
  );
}
