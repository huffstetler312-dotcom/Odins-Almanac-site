import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Plug, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Settings, 
  Activity,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PosIntegration, SalesEvent } from "@shared/schema";

export default function PosIntegrations() {
  const { toast } = useToast();
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  // Fetch POS integrations
  const { data: integrations = [], isLoading: loadingIntegrations } = useQuery<PosIntegration[]>({
    queryKey: ['/api/pos-integrations'],
  });

  // Fetch recent sales events
  const { data: salesEvents = [], isLoading: loadingSales } = useQuery<SalesEvent[]>({
    queryKey: ['/api/sales-events'],
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await apiRequest('POST', `/api/pos-integrations/${integrationId}/test`);
      return response.json();
    },
    onSuccess: (data, integrationId) => {
      toast({
        title: "Test Successful",
        description: data.message,
      });
      // Refresh sales events to show new test data
      queryClient.invalidateQueries({ queryKey: ['/api/sales-events'] });
      setTestingIntegration(null);
    },
    onError: (error, integrationId) => {
      console.error('Test integration error:', error);
      toast({
        title: "Test Failed",
        description: `Failed to test integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setTestingIntegration(null);
    },
  });

  // Update integration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/pos-integrations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos-integrations'] });
      toast({
        title: "Status Updated",
        description: "POS integration status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleTestIntegration = (integrationId: string) => {
    setTestingIntegration(integrationId);
    testIntegrationMutation.mutate(integrationId);
  };

  const handleToggleStatus = (integration: PosIntegration) => {
    const newStatus = integration.status === 'active' ? 'inactive' : 'active';
    updateStatusMutation.mutate({ id: integration.id, status: newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'square':
        return '□'; // Square symbol
      case 'toast':
        return '🍞'; // Toast icon  
      case 'clover':
        return '🍀'; // Clover icon
      default:
        return <Plug className="h-4 w-4" />;
    }
  };

  const calculateSalesTotal = () => {
    return salesEvents.reduce((total, event) => total + parseFloat(event.grossAmount), 0);
  };

  const getRecentSalesCount = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return salesEvents.filter(event => new Date(event.timestamp) > oneDayAgo).length;
  };

  return (
    <div className="space-y-6 p-6" data-testid="pos-integrations-page">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Plug className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">POS Integrations</h1>
            <p className="text-sm text-muted-foreground">Connect with Square, Toast, Clover, and other POS systems</p>
          </div>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              of {integrations.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRecentSalesCount()}</div>
            <p className="text-xs text-muted-foreground">
              transactions processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateSalesTotal().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              gross revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* POS Integrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Available Integrations
          </CardTitle>
          <CardDescription>
            Configure and manage your POS system connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingIntegrations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading integrations...</div>
            </div>
          ) : integrations.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No POS integrations configured. Contact support to set up your first integration.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover-elevate" data-testid={`integration-${integration.provider}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getProviderIcon(integration.provider)}</div>
                        <div>
                          <h3 className="font-medium text-foreground capitalize">
                            {(integration.metadata as any)?.name || `${integration.provider} Integration`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(integration.metadata as any)?.description || `Connect with ${integration.provider} POS system`}
                          </p>
                          {integration.lastSync && (
                            <p className="text-xs text-muted-foreground">
                              Last sync: {new Date(integration.lastSync).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(integration.status)}
                          <Badge variant={getStatusBadgeVariant(integration.status)} className="capitalize">
                            {integration.status}
                          </Badge>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid={`button-test-${integration.provider}`}>
                              <Play className="h-3 w-3 mr-1" />
                              Test
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Test {integration.provider} Integration</DialogTitle>
                              <DialogDescription>
                                This will simulate a webhook from {integration.provider} to test the integration and create sample sales data.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                onClick={() => handleTestIntegration(integration.id)}
                                disabled={testingIntegration === integration.id}
                                data-testid={`button-confirm-test-${integration.provider}`}
                              >
                                {testingIntegration === integration.id ? (
                                  "Testing..."
                                ) : (
                                  "Run Test"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant={integration.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(integration)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {integration.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sales Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Recent Sales Events
          </CardTitle>
          <CardDescription>
            Real-time sales data from connected POS systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSales ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading sales events...</div>
            </div>
          ) : salesEvents.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No sales events found. Test an integration above to generate sample data.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {salesEvents.slice(0, 10).map((event) => (
                  <Card key={event.id} className="hover-elevate" data-testid={`sales-event-${event.source}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {event.source.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {((event.items as any[]) || []).slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground"> x{item.quantity}</span>
                                <span className="text-muted-foreground"> - ${item.totalPrice}</span>
                              </div>
                            ))}
                            {((event.items as any[]) || []).length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{((event.items as any[]) || []).length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            ${parseFloat(event.grossAmount).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Net: ${parseFloat(event.netAmount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}