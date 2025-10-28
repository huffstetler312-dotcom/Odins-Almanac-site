import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Mail } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  title: string;
  description: string;
  features: string[];
}

export function UpgradePrompt({ title, description, features }: UpgradePromptProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Crown className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">{title}</CardTitle>
            <CardDescription className="text-lg">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Pro Features Include:</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => setLocation("/subscribe")}
              data-testid="button-upgrade-to-pro"
            >
              <Crown className="h-5 w-5" />
              Upgrade to Pro
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2"
              onClick={() => setLocation("/contact")}
              data-testid="button-contact-sales"
            >
              <Mail className="h-5 w-5" />
              Contact for Demo
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              $199/month • Save thousands in waste & theft
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
