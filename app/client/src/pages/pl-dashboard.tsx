import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Download, Calculator, BarChart3, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { exportPLToExcel } from "@/lib/pl-export";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentDate = new Date();
const currentMonth = MONTHS[currentDate.getMonth()];
const currentYear = currentDate.getFullYear();

export default function PLDashboard() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Targets state
  const [targetRevenue, setTargetRevenue] = useState<number>(0);
  const [targetFoodCostPct, setTargetFoodCostPct] = useState<number>(30);
  const [targetLaborCostPct, setTargetLaborCostPct] = useState<number>(25);
  const [targetOverheadPct, setTargetOverheadPct] = useState<number>(20);
  const [targetProfitMarginPct, setTargetProfitMarginPct] = useState<number>(25);

  // Actuals state
  const [actualRevenue, setActualRevenue] = useState<number>(0);
  const [actualFoodCost, setActualFoodCost] = useState<number>(0);
  const [actualLaborCost, setActualLaborCost] = useState<number>(0);
  const [actualOverhead, setActualOverhead] = useState<number>(0);

  const [calculations, setCalculations] = useState<any>(null);

  // Fetch existing P&L for selected period
  const { data: existingPL } = useQuery({
    queryKey: ['/api/pl/period', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/pl/period/${selectedMonth}/${selectedYear}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Fetch historical data
  const { data: history = [] } = useQuery<any[]>({
    queryKey: ['/api/pl/history', 12],
    queryFn: async () => {
      const res = await fetch('/api/pl/history/12');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Load existing data when period changes
  useEffect(() => {
    if (existingPL) {
      setTargetRevenue(Number(existingPL.targetRevenue) || 0);
      setTargetFoodCostPct(Number(existingPL.targetFoodCostPct) || 30);
      setTargetLaborCostPct(Number(existingPL.targetLaborCostPct) || 25);
      setTargetOverheadPct(Number(existingPL.targetOverheadPct) || 20);
      setTargetProfitMarginPct(Number(existingPL.targetProfitMarginPct) || 25);
      setActualRevenue(Number(existingPL.actualRevenue) || 0);
      setActualFoodCost(Number(existingPL.actualFoodCost) || 0);
      setActualLaborCost(Number(existingPL.actualLaborCost) || 0);
      setActualOverhead(Number(existingPL.actualOverhead) || 0);
    }
  }, [existingPL]);

  const calculatePL = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/pl/calculate', {
        method: 'POST',
        body: JSON.stringify({
          targets: {
            targetRevenue,
            targetFoodCostPct,
            targetLaborCostPct,
            targetOverheadPct,
            targetProfitMarginPct,
          },
          actuals: {
            actualRevenue,
            actualFoodCost,
            actualLaborCost,
            actualOverhead,
          },
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCalculations(data);
      toast({ title: "Calculations Complete", description: "P&L metrics calculated successfully" });
    },
  });

  const savePL = useMutation({
    mutationFn: async () => {
      if (existingPL) {
        const res = await apiRequest(`/api/pl/${existingPL.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            targetRevenue: String(targetRevenue),
            targetFoodCostPct: String(targetFoodCostPct),
            targetLaborCostPct: String(targetLaborCostPct),
            targetOverheadPct: String(targetOverheadPct),
            targetProfitMarginPct: String(targetProfitMarginPct),
            actualRevenue: String(actualRevenue),
            actualFoodCost: String(actualFoodCost),
            actualLaborCost: String(actualLaborCost),
            actualOverhead: String(actualOverhead),
          }),
        });
        return res.json();
      } else {
        const res = await apiRequest('/api/pl', {
          method: 'POST',
          body: JSON.stringify({
            month: selectedMonth,
            year: selectedYear,
            targetRevenue: String(targetRevenue),
            targetFoodCostPct: String(targetFoodCostPct),
            targetLaborCostPct: String(targetLaborCostPct),
            targetOverheadPct: String(targetOverheadPct),
            targetProfitMarginPct: String(targetProfitMarginPct),
            actualRevenue: String(actualRevenue),
            actualFoodCost: String(actualFoodCost),
            actualLaborCost: String(actualLaborCost),
            actualOverhead: String(actualOverhead),
          }),
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pl/period', selectedMonth, selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['/api/pl/history', 12] });
      toast({ title: "P&L Saved", description: "Your P&L data has been saved successfully" });
    },
  });

  const handleExport = () => {
    if (!calculations) {
      toast({ title: "Calculate First", description: "Please calculate P&L before exporting", variant: "destructive" });
      return;
    }

    const plData = {
      month: selectedMonth,
      year: selectedYear,
      targets: {
        targetRevenue,
        targetFoodCostPct,
        targetLaborCostPct,
        targetOverheadPct,
        targetProfitMarginPct,
      },
      actuals: {
        actualRevenue,
        actualFoodCost,
        actualLaborCost,
        actualOverhead,
      },
    };

    const historicalData = history.map((h: any) => ({
      month: h.month,
      year: h.year,
      targets: {
        targetRevenue: Number(h.targetRevenue),
        targetFoodCostPct: Number(h.targetFoodCostPct),
        targetLaborCostPct: Number(h.targetLaborCostPct),
        targetOverheadPct: Number(h.targetOverheadPct),
        targetProfitMarginPct: Number(h.targetProfitMarginPct),
      },
      actuals: {
        actualRevenue: Number(h.actualRevenue),
        actualFoodCost: Number(h.actualFoodCost),
        actualLaborCost: Number(h.actualLaborCost),
        actualOverhead: Number(h.actualOverhead),
      },
    }));

    exportPLToExcel(plData, calculations, historicalData, 'Your Restaurant');
    toast({ title: "Export Complete", description: "Professional P&L spreadsheet downloaded" });
  };

  const getVarianceColor = (variance: number, isRevenue: boolean = false) => {
    if (isRevenue) {
      return variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    return variance <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getVarianceIcon = (variance: number, isRevenue: boolean = false) => {
    if (isRevenue) {
      return variance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    }
    return variance <= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Viking Consultant Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="heading-pl-dashboard">
              Profit & Loss Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Powered by Viking Consulting Group - Professional Financial Analysis
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={!calculations}
            variant="default"
            data-testid="button-export-pl"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Professional Spreadsheet
          </Button>
        </div>

        {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="heading-period-selector">Select Period</CardTitle>
            <CardDescription>Choose the month and year for P&L analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month} data-testid={`option-month-${month}`}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={String(year)} data-testid={`option-year-${year}`}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="inputs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inputs" data-testid="tab-inputs">
              <Calculator className="h-4 w-4 mr-2" />
              Input Data
            </TabsTrigger>
            <TabsTrigger value="analysis" data-testid="tab-analysis">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              Historical Trends
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="inputs" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Targets */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary" data-testid="heading-targets">
                    Targets
                  </CardTitle>
                  <CardDescription>Set your monthly targets and percentages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Target Revenue ($)</Label>
                    <Input
                      type="number"
                      value={targetRevenue || ''}
                      onChange={(e) => setTargetRevenue(Number(e.target.value))}
                      placeholder="50000"
                      data-testid="input-target-revenue"
                    />
                  </div>
                  <div>
                    <Label>Food Cost Target (%)</Label>
                    <Input
                      type="number"
                      value={targetFoodCostPct || ''}
                      onChange={(e) => setTargetFoodCostPct(Number(e.target.value))}
                      placeholder="30"
                      data-testid="input-target-food-pct"
                    />
                  </div>
                  <div>
                    <Label>Labor Cost Target (%)</Label>
                    <Input
                      type="number"
                      value={targetLaborCostPct || ''}
                      onChange={(e) => setTargetLaborCostPct(Number(e.target.value))}
                      placeholder="25"
                      data-testid="input-target-labor-pct"
                    />
                  </div>
                  <div>
                    <Label>Overhead Target (%)</Label>
                    <Input
                      type="number"
                      value={targetOverheadPct || ''}
                      onChange={(e) => setTargetOverheadPct(Number(e.target.value))}
                      placeholder="20"
                      data-testid="input-target-overhead-pct"
                    />
                  </div>
                  <div>
                    <Label>Profit Margin Target (%)</Label>
                    <Input
                      type="number"
                      value={targetProfitMarginPct || ''}
                      onChange={(e) => setTargetProfitMarginPct(Number(e.target.value))}
                      placeholder="25"
                      data-testid="input-target-profit-pct"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actuals */}
              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-400" data-testid="heading-actuals">
                    Actuals
                  </CardTitle>
                  <CardDescription>Enter your actual monthly figures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Actual Revenue ($)</Label>
                    <Input
                      type="number"
                      value={actualRevenue || ''}
                      onChange={(e) => setActualRevenue(Number(e.target.value))}
                      placeholder="48500"
                      data-testid="input-actual-revenue"
                    />
                  </div>
                  <div>
                    <Label>Actual Food Cost ($)</Label>
                    <Input
                      type="number"
                      value={actualFoodCost || ''}
                      onChange={(e) => setActualFoodCost(Number(e.target.value))}
                      placeholder="15000"
                      data-testid="input-actual-food-cost"
                    />
                  </div>
                  <div>
                    <Label>Actual Labor Cost ($)</Label>
                    <Input
                      type="number"
                      value={actualLaborCost || ''}
                      onChange={(e) => setActualLaborCost(Number(e.target.value))}
                      placeholder="12000"
                      data-testid="input-actual-labor-cost"
                    />
                  </div>
                  <div>
                    <Label>Actual Overhead ($)</Label>
                    <Input
                      type="number"
                      value={actualOverhead || ''}
                      onChange={(e) => setActualOverhead(Number(e.target.value))}
                      placeholder="10000"
                      data-testid="input-actual-overhead"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => calculatePL.mutate()}
                disabled={calculatePL.isPending}
                data-testid="button-calculate"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {calculatePL.isPending ? "Calculating..." : "Calculate P&L"}
              </Button>
              <Button
                onClick={() => savePL.mutate()}
                disabled={savePL.isPending || !calculations}
                variant="secondary"
                data-testid="button-save"
              >
                {savePL.isPending ? "Saving..." : "Save P&L"}
              </Button>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4" data-testid="content-analysis">
            {calculations ? (
              <>
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-net-profit">
                        ${calculations.actualProfit.toFixed(2)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm mt-1 ${getVarianceColor(calculations.varianceProfit, true)}`}>
                        {getVarianceIcon(calculations.varianceProfit, true)}
                        ${Math.abs(calculations.varianceProfit).toFixed(2)} vs target
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-profit-margin">
                        {calculations.actualProfitMargin.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Target: {targetProfitMarginPct}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Food Cost %</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-food-cost-pct">
                        {calculations.actualFoodCostPct.toFixed(1)}%
                      </div>
                      <Progress 
                        value={(calculations.actualFoodCostPct / targetFoodCostPct) * 100} 
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Labor Cost %</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-labor-cost-pct">
                        {calculations.actualLaborCostPct.toFixed(1)}%
                      </div>
                      <Progress 
                        value={(calculations.actualLaborCostPct / targetLaborCostPct) * 100}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Variance Details */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="heading-variance">Variance Analysis</CardTitle>
                    <CardDescription>Detailed breakdown of target vs actual performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span className="font-medium">Food Cost Variance</span>
                        <span className={`flex items-center gap-1 font-bold ${getVarianceColor(calculations.varianceFoodCost)}`}>
                          {getVarianceIcon(calculations.varianceFoodCost)}
                          ${Math.abs(calculations.varianceFoodCost).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span className="font-medium">Labor Cost Variance</span>
                        <span className={`flex items-center gap-1 font-bold ${getVarianceColor(calculations.varianceLaborCost)}`}>
                          {getVarianceIcon(calculations.varianceLaborCost)}
                          ${Math.abs(calculations.varianceLaborCost).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span className="font-medium">Overhead Variance</span>
                        <span className={`flex items-center gap-1 font-bold ${getVarianceColor(calculations.varianceOverhead)}`}>
                          {getVarianceIcon(calculations.varianceOverhead)}
                          ${Math.abs(calculations.varianceOverhead).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No Analysis Available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please enter your data and calculate P&L first
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4" data-testid="content-trends">
            <Card>
              <CardHeader>
                <CardTitle data-testid="heading-historical">Historical Performance</CardTitle>
                <CardDescription>Last 12 months P&L trends</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((h: any, index: number) => {
                      const profit = Number(h.actualRevenue) - Number(h.actualFoodCost) - Number(h.actualLaborCost) - Number(h.actualOverhead);
                      const profitMargin = h.actualRevenue > 0 ? (profit / Number(h.actualRevenue)) * 100 : 0;
                      
                      return (
                        <div key={h.id || index} className="flex items-center justify-between p-3 bg-muted rounded-md" data-testid={`row-history-${index}`}>
                          <div className="flex-1">
                            <p className="font-medium">{h.month} {h.year}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: ${Number(h.actualRevenue).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${profit.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{profitMargin.toFixed(1)}% margin</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No historical data available. Start entering P&L data to see trends.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
