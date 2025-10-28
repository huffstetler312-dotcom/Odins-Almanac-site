import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type HealthStatus = {
  server: string;
  timestamp: string;
  stripe: boolean;
  auth: string;
  database: string;
};

export default function StatusPage() {
  const { data: health, isLoading, refetch } = useQuery<HealthStatus>({
    queryKey: ['/api/health'],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const getStatusIcon = (status: string | boolean) => {
    if (status === 'ok' || status === true) {
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    if (status === 'dns_failure') {
      return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    }
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  const getStatusText = (status: string | boolean) => {
    if (status === 'ok' || status === true) return 'Operational';
    if (status === 'dns_failure') return 'DNS Failure (Replit Infrastructure)';
    if (status === false) return 'Not Configured';
    return 'Error';
  };

  const allSystemsGo = health?.auth === 'ok' && health?.database === 'ok' && health?.stripe;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="text-muted-foreground">
          Real-time status of Odin's Eye infrastructure and services
        </p>
      </div>

      {allSystemsGo && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-800 dark:text-green-200">All Systems Operational</CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Payment processing and authentication are ready for customer demos
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {health?.auth === 'dns_failure' && (
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-amber-800 dark:text-amber-200">Temporary Auth Issues</CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Replit's authentication servers are experiencing DNS issues. This is a platform issue and typically resolves within hours.
              Check back soon - all other systems are ready.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Last checked: ${new Date(health?.timestamp || '').toLocaleString()}`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh-status"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="font-medium">Server</p>
              <p className="text-sm text-muted-foreground">Main application server</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health?.server || 'unknown')}
              <span className="text-sm font-medium">{getStatusText(health?.server || 'unknown')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">Replit Auth (OIDC)</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health?.auth || 'unknown')}
              <span className="text-sm font-medium">{getStatusText(health?.auth || 'unknown')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="font-medium">Database</p>
              <p className="text-sm text-muted-foreground">PostgreSQL storage</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health?.database || 'unknown')}
              <span className="text-sm font-medium">{getStatusText(health?.database || 'unknown')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="font-medium">Payment Processing</p>
              <p className="text-sm text-muted-foreground">Stripe integration</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health?.stripe ?? false)}
              <span className="text-sm font-medium">{getStatusText(health?.stripe ?? false)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Test</CardTitle>
          <CardDescription>
            Once all systems show "Operational", you can test the complete payment flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Try Demo" or visit /subscribe</li>
            <li>Login with Replit Auth</li>
            <li>Click "Upgrade to Pro"</li>
            <li>Complete payment with test card: 4242 4242 4242 4242</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
