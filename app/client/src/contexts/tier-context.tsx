import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserTier = "free" | "pro";

interface TierContextType {
  tier: UserTier;
  setTier: (tier: UserTier) => void;
  isPro: boolean;
  canAccess: (feature: string) => boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

// Features available by tier
const PRO_FEATURES = [
  "inventory",
  "analytics", 
  "variance",
  "recipes",
  "targets",
  "truck-ordering",
  "advanced-algorithms",
];

const FREE_FEATURES = [
  "dashboard",
  "inventory-entry",
  "par-levels",
  "pos-integrations",
  "pos-setup-guide",
  "algorithms",
  "pl-dashboard",
  "comprehensive-pl",
];

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<UserTier>(() => {
    // Load tier from localStorage or default to free
    const saved = localStorage.getItem("user-tier");
    return (saved === "pro" ? "pro" : "free") as UserTier;
  });

  const isPro = tier === "pro";

  const setTier = (newTier: UserTier) => {
    setTierState(newTier);
    localStorage.setItem("user-tier", newTier);
  };

  const canAccess = (feature: string): boolean => {
    if (tier === "pro") return true;
    return FREE_FEATURES.includes(feature);
  };

  return (
    <TierContext.Provider value={{ tier, setTier, isPro, canAccess }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error("useTier must be used within a TierProvider");
  }
  return context;
}

// Export features lists for reference
export { PRO_FEATURES, FREE_FEATURES };
