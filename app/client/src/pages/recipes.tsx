import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Recipes() {
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
          title="Recipe Management System"
          description="Manage your menu recipes, calculate costs, and optimize profitability"
          features={[
            "Recipe builder with ingredient tracking",
            "Automatic cost calculation",
            "Nutrition information management",
            "Recipe versioning and modifications",
            "Portion control and scaling",
            "Menu engineering recommendations",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="recipes-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Recipe Management</h1>
      </div>
      <div className="text-muted-foreground">
        <p>Recipe management features coming soon...</p>
      </div>
    </div>
  );
}
