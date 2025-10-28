import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, AlertTriangle, BarChart3, Package, Sparkles, Download } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Algorithms() {
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
  });

  const pioePredict = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/pioe/predict-demand/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecastHours: 24 }),
      });
      if (!res.ok) throw new Error("Failed to predict demand");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "PIOE Analysis Complete", description: "Demand forecast generated successfully" });
    },
  });

  const pioeOptimize = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/pioe/optimize-par/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to optimize par");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Par Level Optimized", description: "Optimal par level calculated successfully" });
    },
  });

  const iwppsPredict = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/iwpps/predict-waste/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecastHours: 72 }),
      });
      if (!res.ok) throw new Error("Failed to predict waste");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Waste Prediction Complete", description: "Waste forecast generated successfully" });
    },
  });

  const { data: supplierPerformance = [] } = useQuery<any[]>({
    queryKey: ["/api/iwpps/supplier-performance"],
  });

  const ivalpsAnalyze = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/ivalps/analyze-variance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error("Failed to analyze variance");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Variance Analysis Complete", description: "Inventory variance analyzed successfully" });
    },
  });

  const ivalpsReport = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ivalps/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Variance Report Generated", description: "Full variance report created successfully" });
    },
  });

  const handleExport = () => {
    window.open("/api/ivalps/export-spreadsheet", "_blank");
    toast({ title: "Export Started", description: "Downloading variance spreadsheet" });
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="heading-algorithms">
            Patentable Algorithm Suite
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="text-description">
            Advanced predictive inventory optimization, waste prevention, and variance analysis systems
          </p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle data-testid="heading-select-item">Select Inventory Item</CardTitle>
            </div>
            <CardDescription data-testid="text-select-description">
              Choose an item to analyze with our patentable algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger data-testid="select-item">
                <SelectValue placeholder="Select an inventory item..." />
              </SelectTrigger>
              <SelectContent>
                {items.map((item: any) => (
                  <SelectItem key={item.id} value={item.id} data-testid={`option-item-${item.id}`}>
                    {item.name} ({item.category}) - Current: {item.currentStock} {item.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="mt-3 p-3 bg-muted rounded-md" data-testid="card-selected-item-info">
                <p className="text-sm font-medium" data-testid="text-selected-item-name">
                  {selectedItem.name}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-selected-item-details">
                  Category: {selectedItem.category} | Stock: {selectedItem.currentStock} {selectedItem.unit} | 
                  Min: {selectedItem.minimumStock} | Cost: ${selectedItem.costPerUnit}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="pioe" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pioe" data-testid="tab-pioe">
              <Brain className="h-4 w-4 mr-2" />
              PIOE
            </TabsTrigger>
            <TabsTrigger value="iwpps" data-testid="tab-iwpps">
              <AlertTriangle className="h-4 w-4 mr-2" />
              IWPPS
            </TabsTrigger>
            <TabsTrigger value="ivalps" data-testid="tab-ivalps">
              <BarChart3 className="h-4 w-4 mr-2" />
              IVALPS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pioe" className="space-y-4" data-testid="content-pioe">
            <Card>
              <CardHeader>
                <CardTitle data-testid="heading-pioe-title">Predictive Inventory Optimization Engine (PIOE)</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2" data-testid="badge-pioe-patent">PATENT PENDING</Badge>
                  <p className="mt-2" data-testid="text-pioe-description">
                    AI-powered demand forecasting and intelligent par level optimization
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button
                    data-testid="button-pioe-predict"
                    onClick={() => selectedItemId && pioePredict.mutate(selectedItemId)}
                    disabled={!selectedItemId || pioePredict.isPending}
                    className="w-full sm:w-auto"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {pioePredict.isPending ? "Analyzing..." : "Run PIOE Analysis"}
                  </Button>
                </div>

                {pioePredict.data && (
                  <div className="grid gap-4 md:grid-cols-2" data-testid="results-pioe">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-demand-forecast">24-Hour Demand Forecast</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold" data-testid="text-demand-value">
                          {(pioePredict.data as any).demandForecast?.toFixed(1)} units
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid="text-confidence">
                          Confidence: {((pioePredict.data as any).confidenceLevel * 100)?.toFixed(0)}%
                        </p>
                        {(pioePredict.data as any).rationale && (
                          <div className="mt-3 space-y-1" data-testid="card-rationale">
                            <p className="text-xs"><strong>Weather Impact:</strong> {((pioePredict.data as any).rationale.weatherImpact * 100)?.toFixed(0)}%</p>
                            <p className="text-xs"><strong>Event Impact:</strong> {((pioePredict.data as any).rationale.eventImpact * 100)?.toFixed(0)}%</p>
                            <p className="text-xs"><strong>Seasonal Trend:</strong> {((pioePredict.data as any).rationale.seasonalTrend * 100)?.toFixed(0)}%</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-par-level">Recommended Par Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold" data-testid="text-par-value">
                          {(pioePredict.data as any).recommendedParLevel?.toFixed(0)} units
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid="text-stockout-risk">
                          Stockout Risk: {((pioePredict.data as any).stockoutRisk * 100)?.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid="text-waste-reduction">
                          Expected Waste Reduction: {(pioePredict.data as any).expectedWasteReduction?.toFixed(1)} units
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 md:col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-cost-optimization">Cost Optimization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400" data-testid="text-cost-savings">
                          ${(pioePredict.data as any).costOptimization?.toFixed(2)} estimated savings
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iwpps" className="space-y-4" data-testid="content-iwpps">
            <Card>
              <CardHeader>
                <CardTitle data-testid="heading-iwpps-title">Intelligent Waste Prediction & Prevention System (IWPPS)</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2" data-testid="badge-iwpps-patent">PATENT PENDING</Badge>
                  <p className="mt-2" data-testid="text-iwpps-description">
                    Predictive waste analytics and supplier quality correlation
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button
                    data-testid="button-iwpps-predict"
                    onClick={() => selectedItemId && iwppsPredict.mutate(selectedItemId)}
                    disabled={!selectedItemId || iwppsPredict.isPending}
                    className="w-full sm:w-auto"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {iwppsPredict.isPending ? "Analyzing..." : "Predict Waste"}
                  </Button>
                </div>

                {iwppsPredict.data && (
                  <div className="grid gap-4 md:grid-cols-2" data-testid="results-iwpps">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-waste-prediction">72-Hour Waste Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-waste-amount">
                          {(iwppsPredict.data as any).predictedWasteAmount?.toFixed(1)} units
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid="text-cost-impact">
                          Cost Impact: ${(iwppsPredict.data as any).costImpact?.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid="text-waste-date">
                          Expected by: {new Date((iwppsPredict.data as any).predictedWasteDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-prevention-strategies">Prevention Strategies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1" data-testid="list-strategies">
                          {(iwppsPredict.data as any).preventionStrategies?.slice(0, 3).map((strategy: string, index: number) => (
                            <li key={index} className="text-xs" data-testid={`item-strategy-${index}`}>
                              • {strategy}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {supplierPerformance.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base" data-testid="heading-supplier-performance">Supplier Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2" data-testid="list-suppliers">
                        {supplierPerformance.slice(0, 3).map((supplier: any, index: number) => (
                          <div key={supplier.supplierId} className="p-2 bg-muted rounded" data-testid={`card-supplier-${index}`}>
                            <p className="text-sm font-medium" data-testid={`text-supplier-name-${index}`}>{supplier.supplierName}</p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-supplier-score-${index}`}>
                              Overall Score: {supplier.overallScore?.toFixed(0)}/100 | Quality: {supplier.qualityScore}/100
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ivalps" className="space-y-4" data-testid="content-ivalps">
            <Card>
              <CardHeader>
                <CardTitle data-testid="heading-ivalps-title">Inventory Variance Analysis & Loss Prevention System (IVALPS)</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2" data-testid="badge-ivalps-patent">PATENT PENDING</Badge>
                  <p className="mt-2" data-testid="text-ivalps-description">
                    Real-time variance detection and theft pattern recognition
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    data-testid="button-ivalps-analyze"
                    onClick={() => selectedItemId && ivalpsAnalyze.mutate(selectedItemId)}
                    disabled={!selectedItemId || ivalpsAnalyze.isPending}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {ivalpsAnalyze.isPending ? "Analyzing..." : "Analyze Item Variance"}
                  </Button>
                  <Button
                    data-testid="button-ivalps-report"
                    onClick={() => ivalpsReport.mutate()}
                    disabled={ivalpsReport.isPending}
                    variant="secondary"
                  >
                    {ivalpsReport.isPending ? "Generating..." : "Generate Full Report"}
                  </Button>
                  <Button
                    data-testid="button-ivalps-export"
                    onClick={handleExport}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {ivalpsAnalyze.data && (
                  <div className="grid gap-4 md:grid-cols-2" data-testid="results-ivalps-item">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-variance-metrics">Variance Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold" data-testid="text-variance-percent">
                          {(ivalpsAnalyze.data as any).quantityVariancePercent?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid="text-variance-type">
                          Type: {(ivalpsAnalyze.data as any).varianceType}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid="text-severity">
                          Severity: {(ivalpsAnalyze.data as any).severityLevel}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm" data-testid="heading-loss-detection">Loss Detection Scores</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <p className="text-xs" data-testid="text-theft-probability">
                          <strong>Theft Probability:</strong> {((ivalpsAnalyze.data as any).theftProbability * 100)?.toFixed(0)}%
                        </p>
                        <p className="text-xs" data-testid="text-portion-control">
                          <strong>Portion Control Score:</strong> {((ivalpsAnalyze.data as any).portionControlScore * 100)?.toFixed(0)}%
                        </p>
                        <p className="text-xs" data-testid="text-spoilage-score">
                          <strong>Spoilage Score:</strong> {((ivalpsAnalyze.data as any).spoilageScore * 100)?.toFixed(0)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {ivalpsReport.data && (
                  <Card data-testid="results-ivalps-report">
                    <CardHeader>
                      <CardTitle className="text-base" data-testid="heading-report-summary">Variance Report Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground" data-testid="label-items-analyzed">Items Analyzed</p>
                          <p className="text-2xl font-bold" data-testid="text-items-analyzed">
                            {(ivalpsReport.data as any).totalItems}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground" data-testid="label-items-variance">Items with Variance</p>
                          <p className="text-2xl font-bold" data-testid="text-items-variance">
                            {(ivalpsReport.data as any).itemsWithVariance}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground" data-testid="label-total-variance">Total Value Variance</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-total-variance">
                            ${(ivalpsReport.data as any).totalValueVariance?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
