import { useTier } from "@/contexts/tier-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TierToggle() {
  const { tier, setTier, isPro } = useTier();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isPro ? "default" : "outline"}
          size="sm"
          className="gap-2"
          data-testid="button-tier-toggle"
        >
          <Crown className="h-4 w-4" />
          {isPro ? "Pro" : "Free"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Account Tier</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTier("free")}
          data-testid="option-tier-free"
        >
          <div className="flex items-center justify-between w-full">
            <span>Free Tier</span>
            {!isPro && <Badge variant="outline">Current</Badge>}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTier("pro")}
          data-testid="option-tier-pro"
        >
          <div className="flex items-center justify-between w-full">
            <span>Pro Tier</span>
            {isPro && <Badge>Current</Badge>}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Toggle for demo purposes
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
