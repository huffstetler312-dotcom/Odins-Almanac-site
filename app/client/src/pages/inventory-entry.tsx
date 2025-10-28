import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, 
  Plus, 
  Save, 
  CheckCircle, 
  X, 
  ArrowLeft, 
  Calculator,
  AlertCircle,
  MapPin,
  Clock,
  Smartphone,
  PenTool,
} from "lucide-react";
import type { 
  InventoryItem, 
  CountSession, 
  CountLine, 
  InsertCountSession, 
  InsertCountLine 
} from "@shared/schema";
import { getARCCColors, getIconColorClasses } from "@/lib/arcc-colors";

interface CountLineWithItem extends CountLine {
  inventoryItem: InventoryItem;
}

export default function InventoryEntry() {
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<CountSession | null>(null);
  const [currentArea, setCurrentArea] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [countedQuantity, setCountedQuantity] = useState<string>("");
  const [countNotes, setCountNotes] = useState<string>("");

  // Queries
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    enabled: !!activeSession,
  });

  const { data: countLines = [], isLoading: countLinesLoading } = useQuery<CountLine[]>({
    queryKey: ['/api/count-sessions', activeSession?.id, 'lines'],
    enabled: !!activeSession?.id,
  });

  // Get inventory items with count status
  const inventoryWithStatus = inventory.map((item) => {
    const hasCount = countLines.some((line) => line.inventoryItemId === item.id);
    return { ...item, hasCounted: hasCount };
  });

  const uncountedItems = inventoryWithStatus.filter((item) => !item.hasCounted);
  const countedItems = inventoryWithStatus.filter((item) => item.hasCounted);

  // Mutations
  const startSessionMutation = useMutation<CountSession, Error, InsertCountSession>({
    mutationFn: async (data: InsertCountSession) => {
      const response = await apiRequest('POST', '/api/count-sessions', data);
      return response.json();
    },
    onSuccess: (session: CountSession) => {
      setActiveSession(session);
      queryClient.invalidateQueries({ queryKey: ['/api/count-sessions'] });
      toast({
        title: "Count Session Started",
        description: `Started counting in ${session.area || 'All Areas'}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start count session",
        variant: "destructive",
      });
    },
  });

  const addCountLineMutation = useMutation<CountLine, Error, InsertCountLine>({
    mutationFn: async (data: InsertCountLine) => {
      const response = await apiRequest('POST', '/api/count-lines', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/count-sessions', activeSession?.id, 'lines'] });
      setSelectedItemId("");
      setCountedQuantity("");
      setCountNotes("");
      toast({
        title: "Count Added",
        description: "Item count recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record count",
        variant: "destructive",
      });
    },
  });

  const closeSessionMutation = useMutation<CountSession, Error, string>({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('PATCH', `/api/count-sessions/${sessionId}/close`);
      return response.json();
    },
    onSuccess: () => {
      setActiveSession(null);
      setCurrentArea("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/count-sessions'] });
      toast({
        title: "Session Closed",
        description: "Count session closed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to close session",
        variant: "destructive",
      });
    },
  });

  const applySessionMutation = useMutation<{ updated: number; errors: string[] }, Error, string>({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/count-sessions/${sessionId}/apply`);
      return response.json();
    },
    onSuccess: (result: { updated: number; errors: string[] }) => {
      setActiveSession(null);
      setCurrentArea("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      toast({
        title: "Inventory Updated",
        description: `${result.updated} items updated successfully`,
      });
      
      if (result.errors.length > 0) {
        toast({
          title: "Some Errors Occurred",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply count session",
        variant: "destructive",
      });
    },
  });

  const handleStartSession = () => {
    startSessionMutation.mutate({
      area: currentArea && currentArea !== "all" ? currentArea : null,
      notes: notes || null,
      userId: null, // TODO: Add user authentication
      status: "active",
    });
  };

  const handleAddCount = () => {
    if (!activeSession || !selectedItemId || !countedQuantity) {
      toast({
        title: "Missing Information",
        description: "Please select an item and enter quantity",
        variant: "destructive",
      });
      return;
    }

    const selectedItem = inventory.find((item: InventoryItem) => item.id === selectedItemId);
    if (!selectedItem) return;

    addCountLineMutation.mutate({
      sessionId: activeSession.id,
      inventoryItemId: selectedItemId,
      countedQuantity,
      unit: selectedItem.unit,
      notes: countNotes || null,
    });
  };

  const getCountProgress = () => {
    if (!inventory.length) return 0;
    return Math.round((countedItems.length / inventory.length) * 100);
  };

  // No active session - show start screen
  if (!activeSession) {
    return (
      <div className="container max-w-lg mx-auto py-6 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Inventory Entry</h1>
          </div>
          <p className="text-muted-foreground">Start a new count session to update inventory levels</p>
        </div>

        <Card data-testid="card-start-session">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              <CardTitle>Start Count Session</CardTitle>
            </div>
            <CardDescription>
              Choose an area to count and begin tracking inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area">Count Area (Optional)</Label>
              <Select value={currentArea} onValueChange={setCurrentArea} data-testid="select-area">
                <SelectTrigger>
                  <SelectValue placeholder="Select area or count all" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="freezer">Freezer</SelectItem>
                  <SelectItem value="pantry">Pantry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this count session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="textarea-notes"
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Count sessions track your inventory counting progress and can be applied to update stock levels.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleStartSession}
              disabled={startSessionMutation.isPending}
              className="w-full"
              data-testid="button-start-session"
            >
              {startSessionMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-pulse" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Start Count Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active session - show counting interface
  return (
    <div className="container max-w-lg mx-auto py-6 px-4 space-y-6">
      {/* Session Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setActiveSession(null)}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Session
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Active Session
          </Badge>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">
                  {activeSession.area || "All Areas"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(activeSession.startedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getCountProgress()}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCountProgress()}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {countedItems.length} of {inventory.length} items counted
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Count Form */}
      <Card data-testid="card-add-count">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Add Count
          </CardTitle>
          <CardDescription>Select an item and enter the counted quantity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Inventory Item</Label>
            <Select 
              value={selectedItemId} 
              onValueChange={setSelectedItemId}
              data-testid="select-item"
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose item to count" />
              </SelectTrigger>
              <SelectContent>
                {uncountedItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{item.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {item.unit}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Counted Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={countedQuantity}
                onChange={(e) => setCountedQuantity(e.target.value)}
                data-testid="input-quantity"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <div className="h-9 px-3 py-2 border border-input bg-background rounded-md flex items-center text-sm text-muted-foreground">
                {selectedItemId ? inventory.find((item) => item.id === selectedItemId)?.unit : "-"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count-notes">Notes (Optional)</Label>
            <Input
              id="count-notes"
              placeholder="Any notes about this count..."
              value={countNotes}
              onChange={(e) => setCountNotes(e.target.value)}
              data-testid="input-count-notes"
            />
          </div>

          <Button
            onClick={handleAddCount}
            disabled={!selectedItemId || !countedQuantity || addCountLineMutation.isPending}
            className="w-full"
            data-testid="button-add-count"
          >
            {addCountLineMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-pulse" />
                Recording...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Record Count
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Counted Items */}
      {countedItems.length > 0 && (
        <Card data-testid="card-counted-items">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Counted Items ({countedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {countedItems.map((item) => {
                const countLine = countLines.find((line) => line.inventoryItemId === item.id);
                return (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {countLine?.notes && (
                        <p className="text-xs text-muted-foreground">{countLine.notes}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {countLine?.countedQuantity} {item.unit}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Actions */}
      <div className="space-y-3">
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => closeSessionMutation.mutate(activeSession.id)}
            disabled={closeSessionMutation.isPending}
            data-testid="button-close-session"
          >
            <X className="mr-2 h-4 w-4" />
            Close Session
          </Button>
          <Button
            onClick={() => applySessionMutation.mutate(activeSession.id)}
            disabled={countedItems.length === 0 || applySessionMutation.isPending}
            data-testid="button-apply-session"
          >
            {applySessionMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-pulse" />
                Applying...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Apply Counts
              </>
            )}
          </Button>
        </div>
        
        {countedItems.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Applying counts will permanently update inventory levels. This cannot be undone.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}