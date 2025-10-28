import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Download, RefreshCw, AlertTriangle, DollarSign, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/upgrade-prompt";

interface OrderItem {
  itemId: string;
  itemName: string;
  category: string;
  currentStock: number;
  parLevel: number;
  recommendedParLevel: number;
  orderQuantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  supplierId: string;
  supplierName: string;
  predictedDemand: number;
  stockoutRisk: number;
  expectedDelivery: string;
}

interface TruckOrder {
  orderDate: string;
  items: OrderItem[];
  totalCost: number;
  totalItems: number;
  supplierBreakdown: Array<{
    supplierId: string;
    totalCost: number;
    itemCount: number;
  }>;
}

export default function TruckOrdering() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [generatedOrder, setGeneratedOrder] = useState<TruckOrder | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/pricing");
    }
  }, [user, isLoading, setLocation]);

  const generateOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/pioe/generate-truck-order");
      return response as unknown as TruckOrder;
    },
    onSuccess: (data) => {
      setGeneratedOrder(data);
      toast({
        title: "Order Generated",
        description: `Successfully generated order with ${data.totalItems} items totaling $${data.totalCost.toFixed(2)}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate order",
        variant: "destructive",
      });
    },
  });

  const getRiskBadge = (risk: number) => {
    if (risk >= 0.7) return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />High Risk</Badge>;
    if (risk >= 0.4) return <Badge className="bg-orange-500 hover:bg-orange-600 gap-1"><AlertTriangle className="h-3 w-3" />Medium</Badge>;
    return <Badge variant="outline">Low Risk</Badge>;
  };

  const groupedBySupplier = generatedOrder?.items.reduce((acc, item) => {
    const supplier = item.supplierName;
    if (!acc[supplier]) {
      acc[supplier] = [];
    }
    acc[supplier].push(item);
    return acc;
  }, {} as Record<string, OrderItem[]>) || {};

  const exportToCSV = () => {
    if (!generatedOrder) return;

    const headers = ["Item Name", "Category", "Current Stock", "Par Level", "Order Qty", "Unit", "Cost/Unit", "Total Cost", "Supplier", "Stockout Risk", "Expected Delivery"];
    const rows = generatedOrder.items.map(item => [
      item.itemName,
      item.category,
      item.currentStock,
      item.parLevel,
      item.orderQuantity,
      item.unit,
      `$${item.costPerUnit.toFixed(2)}`,
      `$${item.totalCost.toFixed(2)}`,
      item.supplierName,
      `${(item.stockoutRisk * 100).toFixed(0)}%`,
      new Date(item.expectedDelivery).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truck-order-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Order Exported",
      description: "Order has been exported to CSV file",
    });
  };

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
          title="AI-Powered Truck Ordering"
          description="Automate your ordering process with AI predictions based on par levels and demand forecasting"
          features={[
            "Automatic order quantity calculation",
            "Grouped orders by supplier",
            "Stockout risk assessment and prioritization",
            "CSV export for easy ordering",
            "Real-time delivery date estimation",
            "Cost optimization and budget tracking",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Truck Order Generator</h1>
          <p className="text-muted-foreground">
            AI-powered ordering based on par levels and predicted demand
          </p>
        </div>
        <div className="flex gap-2">
          {generatedOrder && (
            <Button
              variant="outline"
              onClick={exportToCSV}
              data-testid="button-export-order"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          <Button
            onClick={() => generateOrderMutation.mutate()}
            disabled={generateOrderMutation.isPending}
            data-testid="button-generate-order"
          >
            {generateOrderMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 mr-2" />
            )}
            {generatedOrder ? "Regenerate Order" : "Generate Order"}
          </Button>
        </div>
      </div>

      {!generatedOrder && !generateOrderMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>No Order Generated</CardTitle>
            <CardDescription>
              Click "Generate Order" to create a truck order based on current inventory levels and predicted demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-20 w-20 text-muted-foreground mb-4" />
              <p className="text-muted-foreground max-w-md">
                Our AI will analyze your inventory, par levels, and sales patterns to generate an optimized order that minimizes waste and prevents stockouts.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {generateOrderMutation.isPending && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing Inventory...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Calculating optimal order quantities based on AI predictions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedOrder && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-items">{generatedOrder.totalItems}</div>
                <p className="text-xs text-muted-foreground">Items to order</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-cost">${generatedOrder.totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Order total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-suppliers">{generatedOrder.supplierBreakdown.length}</div>
                <p className="text-xs text-muted-foreground">Unique suppliers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="text-high-risk">
                  {generatedOrder.items.filter(item => item.stockoutRisk >= 0.7).length}
                </div>
                <p className="text-xs text-muted-foreground">Stockout risk</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="tabs-order-view">
              <TabsTrigger value="all" data-testid="tab-all-items">All Items</TabsTrigger>
              <TabsTrigger value="by-supplier" data-testid="tab-by-supplier">By Supplier</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    All items sorted by stockout risk (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Par</TableHead>
                        <TableHead className="text-right">Order Qty</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Supplier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedOrder.items.map((item) => (
                        <TableRow key={item.itemId} data-testid={`row-order-item-${item.itemId}`}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.currentStock} {item.unit}</TableCell>
                          <TableCell className="text-right">{item.parLevel} {item.unit}</TableCell>
                          <TableCell className="text-right font-semibold">{item.orderQuantity} {item.unit}</TableCell>
                          <TableCell className="text-right">${item.totalCost.toFixed(2)}</TableCell>
                          <TableCell>{getRiskBadge(item.stockoutRisk)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.supplierName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="by-supplier" className="mt-6 space-y-6">
              {Object.entries(groupedBySupplier).map(([supplier, items]) => {
                const supplierTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
                return (
                  <Card key={supplier}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{supplier}</CardTitle>
                          <CardDescription>
                            {items.length} items • Total: ${supplierTotal.toFixed(2)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Order Qty</TableHead>
                            <TableHead className="text-right">Cost/Unit</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Risk</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.itemId}>
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell className="text-right">{item.orderQuantity} {item.unit}</TableCell>
                              <TableCell className="text-right">${item.costPerUnit.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-semibold">${item.totalCost.toFixed(2)}</TableCell>
                              <TableCell>{getRiskBadge(item.stockoutRisk)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
