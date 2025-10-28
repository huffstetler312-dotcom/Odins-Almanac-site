import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, Save, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { exportComprehensiveRestaurantPL } from "@/lib/comprehensive-pl-export";

interface PLFormData {
  month: string;
  year: number;
  restaurantName: string;
  
  // Revenue - Actual
  actualFoodSales: string;
  actualBeverageSales: string;
  actualOtherRevenue: string;
  
  // Revenue - Budget
  budgetFoodSales: string;
  budgetBeverageSales: string;
  budgetOtherRevenue: string;
  
  // COGS - Actual
  actualFoodCost: string;
  actualBeverageCost: string;
  
  // COGS - Budget %
  budgetFoodCostPct: string;
  budgetBeverageCostPct: string;
  
  // Labor - Actual
  actualKitchenLabor: string;
  actualFohLabor: string;
  actualManagementLabor: string;
  actualPayrollTaxes: string;
  
  // Labor - Budget %
  budgetLaborCostPct: string;
  budgetPayrollTaxesPct: string;
  
  // Operating Expenses - Actual
  actualRent: string;
  actualUtilities: string;
  actualMarketing: string;
  actualRepairsMaintenance: string;
  actualSupplies: string;
  actualInsurance: string;
  actualCreditCardFees: string;
  actualOtherExpenses: string;
  
  // Operating Expenses - Budget
  budgetRent: string;
  budgetUtilities: string;
  budgetMarketing: string;
  budgetRepairsMaintenance: string;
  budgetSupplies: string;
  budgetInsurance: string;
  budgetCreditCardFees: string;
  budgetOtherExpenses: string;
  
  // Targets
  targetFoodCostPct: string;
  targetBeverageCostPct: string;
  targetLaborCostPct: string;
  targetPrimeCostPct: string;
  targetNetProfitPct: string;
}

export default function ComprehensivePL() {
  const { toast } = useToast();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<PLFormData>({
    month: currentMonth,
    year: currentYear,
    restaurantName: "My Restaurant",
    
    actualFoodSales: "0",
    actualBeverageSales: "0",
    actualOtherRevenue: "0",
    
    budgetFoodSales: "0",
    budgetBeverageSales: "0",
    budgetOtherRevenue: "0",
    
    actualFoodCost: "0",
    actualBeverageCost: "0",
    
    budgetFoodCostPct: "30",
    budgetBeverageCostPct: "22",
    
    actualKitchenLabor: "0",
    actualFohLabor: "0",
    actualManagementLabor: "0",
    actualPayrollTaxes: "0",
    
    budgetLaborCostPct: "28",
    budgetPayrollTaxesPct: "7",
    
    actualRent: "0",
    actualUtilities: "0",
    actualMarketing: "0",
    actualRepairsMaintenance: "0",
    actualSupplies: "0",
    actualInsurance: "0",
    actualCreditCardFees: "0",
    actualOtherExpenses: "0",
    
    budgetRent: "0",
    budgetUtilities: "0",
    budgetMarketing: "0",
    budgetRepairsMaintenance: "0",
    budgetSupplies: "0",
    budgetInsurance: "0",
    budgetCreditCardFees: "0",
    budgetOtherExpenses: "0",
    
    targetFoodCostPct: "30",
    targetBeverageCostPct: "22",
    targetLaborCostPct: "30",
    targetPrimeCostPct: "60",
    targetNetProfitPct: "10",
  });

  const handleChange = (field: keyof PLFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        month: formData.month,
        year: formData.year,
        restaurantName: formData.restaurantName,
        
        actualFoodSales: String(parseFloat(formData.actualFoodSales) || 0),
        actualBeverageSales: String(parseFloat(formData.actualBeverageSales) || 0),
        actualOtherRevenue: String(parseFloat(formData.actualOtherRevenue) || 0),
        
        budgetFoodSales: String(parseFloat(formData.budgetFoodSales) || 0),
        budgetBeverageSales: String(parseFloat(formData.budgetBeverageSales) || 0),
        budgetOtherRevenue: String(parseFloat(formData.budgetOtherRevenue) || 0),
        
        actualFoodCost: String(parseFloat(formData.actualFoodCost) || 0),
        actualBeverageCost: String(parseFloat(formData.actualBeverageCost) || 0),
        
        budgetFoodCostPct: String(parseFloat(formData.budgetFoodCostPct) || 30),
        budgetBeverageCostPct: String(parseFloat(formData.budgetBeverageCostPct) || 22),
        
        actualKitchenLabor: String(parseFloat(formData.actualKitchenLabor) || 0),
        actualFohLabor: String(parseFloat(formData.actualFohLabor) || 0),
        actualManagementLabor: String(parseFloat(formData.actualManagementLabor) || 0),
        actualPayrollTaxes: String(parseFloat(formData.actualPayrollTaxes) || 0),
        
        budgetLaborCostPct: String(parseFloat(formData.budgetLaborCostPct) || 28),
        budgetPayrollTaxesPct: String(parseFloat(formData.budgetPayrollTaxesPct) || 7),
        
        actualRent: String(parseFloat(formData.actualRent) || 0),
        actualUtilities: String(parseFloat(formData.actualUtilities) || 0),
        actualMarketing: String(parseFloat(formData.actualMarketing) || 0),
        actualRepairsMaintenance: String(parseFloat(formData.actualRepairsMaintenance) || 0),
        actualSupplies: String(parseFloat(formData.actualSupplies) || 0),
        actualInsurance: String(parseFloat(formData.actualInsurance) || 0),
        actualCreditCardFees: String(parseFloat(formData.actualCreditCardFees) || 0),
        actualOtherExpenses: String(parseFloat(formData.actualOtherExpenses) || 0),
        
        budgetRent: String(parseFloat(formData.budgetRent) || 0),
        budgetUtilities: String(parseFloat(formData.budgetUtilities) || 0),
        budgetMarketing: String(parseFloat(formData.budgetMarketing) || 0),
        budgetRepairsMaintenance: String(parseFloat(formData.budgetRepairsMaintenance) || 0),
        budgetSupplies: String(parseFloat(formData.budgetSupplies) || 0),
        budgetInsurance: String(parseFloat(formData.budgetInsurance) || 0),
        budgetCreditCardFees: String(parseFloat(formData.budgetCreditCardFees) || 0),
        budgetOtherExpenses: String(parseFloat(formData.budgetOtherExpenses) || 0),
        
        targetFoodCostPct: String(parseFloat(formData.targetFoodCostPct) || 30),
        targetBeverageCostPct: String(parseFloat(formData.targetBeverageCostPct) || 22),
        targetLaborCostPct: String(parseFloat(formData.targetLaborCostPct) || 30),
        targetPrimeCostPct: String(parseFloat(formData.targetPrimeCostPct) || 60),
        targetNetProfitPct: String(parseFloat(formData.targetNetProfitPct) || 10),
      };
      
      return await apiRequest("POST", "/api/pl", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pl"] });
      toast({
        title: "Success",
        description: "P&L data saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save P&L data",
        variant: "destructive",
      });
    },
  });

  const handleExport = async () => {
    try {
      // Fetch comprehensive data
      const response = await fetch(`/api/pl/comprehensive/${formData.month}/${formData.year}`);
      const data = await response.json();
      
      if (!data.current) {
        toast({
          title: "No Data",
          description: "Please save your P&L data before exporting",
          variant: "destructive",
        });
        return;
      }
      
      // Convert data to export format
      const currentData = {
        ...data.current,
        actualFoodSales: parseFloat(data.current.actualFoodSales) || 0,
        actualBeverageSales: parseFloat(data.current.actualBeverageSales) || 0,
        actualOtherRevenue: parseFloat(data.current.actualOtherRevenue) || 0,
        budgetFoodSales: parseFloat(data.current.budgetFoodSales) || 0,
        budgetBeverageSales: parseFloat(data.current.budgetBeverageSales) || 0,
        budgetOtherRevenue: parseFloat(data.current.budgetOtherRevenue) || 0,
        actualFoodCost: parseFloat(data.current.actualFoodCost) || 0,
        actualBeverageCost: parseFloat(data.current.actualBeverageCost) || 0,
        budgetFoodCostPct: parseFloat(data.current.budgetFoodCostPct) || 30,
        budgetBeverageCostPct: parseFloat(data.current.budgetBeverageCostPct) || 22,
        actualKitchenLabor: parseFloat(data.current.actualKitchenLabor) || 0,
        actualFohLabor: parseFloat(data.current.actualFohLabor) || 0,
        actualManagementLabor: parseFloat(data.current.actualManagementLabor) || 0,
        actualPayrollTaxes: parseFloat(data.current.actualPayrollTaxes) || 0,
        budgetLaborCostPct: parseFloat(data.current.budgetLaborCostPct) || 28,
        budgetPayrollTaxesPct: parseFloat(data.current.budgetPayrollTaxesPct) || 7,
        actualRent: parseFloat(data.current.actualRent) || 0,
        actualUtilities: parseFloat(data.current.actualUtilities) || 0,
        actualMarketing: parseFloat(data.current.actualMarketing) || 0,
        actualRepairsMaintenance: parseFloat(data.current.actualRepairsMaintenance) || 0,
        actualSupplies: parseFloat(data.current.actualSupplies) || 0,
        actualInsurance: parseFloat(data.current.actualInsurance) || 0,
        actualCreditCardFees: parseFloat(data.current.actualCreditCardFees) || 0,
        actualOtherExpenses: parseFloat(data.current.actualOtherExpenses) || 0,
        budgetRent: parseFloat(data.current.budgetRent) || 0,
        budgetUtilities: parseFloat(data.current.budgetUtilities) || 0,
        budgetMarketing: parseFloat(data.current.budgetMarketing) || 0,
        budgetRepairsMaintenance: parseFloat(data.current.budgetRepairsMaintenance) || 0,
        budgetSupplies: parseFloat(data.current.budgetSupplies) || 0,
        budgetInsurance: parseFloat(data.current.budgetInsurance) || 0,
        budgetCreditCardFees: parseFloat(data.current.budgetCreditCardFees) || 0,
        budgetOtherExpenses: parseFloat(data.current.budgetOtherExpenses) || 0,
        targetFoodCostPct: parseFloat(data.current.targetFoodCostPct) || 30,
        targetBeverageCostPct: parseFloat(data.current.targetBeverageCostPct) || 22,
        targetLaborCostPct: parseFloat(data.current.targetLaborCostPct) || 30,
        targetPrimeCostPct: parseFloat(data.current.targetPrimeCostPct) || 60,
        targetNetProfitPct: parseFloat(data.current.targetNetProfitPct) || 10,
      };
      
      const lastYearData = data.lastYear ? {
        ...data.lastYear,
        // Convert all fields to numbers
        actualFoodSales: parseFloat(data.lastYear.actualFoodSales) || 0,
        actualBeverageSales: parseFloat(data.lastYear.actualBeverageSales) || 0,
        actualOtherRevenue: parseFloat(data.lastYear.actualOtherRevenue) || 0,
        actualFoodCost: parseFloat(data.lastYear.actualFoodCost) || 0,
        actualBeverageCost: parseFloat(data.lastYear.actualBeverageCost) || 0,
        actualKitchenLabor: parseFloat(data.lastYear.actualKitchenLabor) || 0,
        actualFohLabor: parseFloat(data.lastYear.actualFohLabor) || 0,
        actualManagementLabor: parseFloat(data.lastYear.actualManagementLabor) || 0,
        actualPayrollTaxes: parseFloat(data.lastYear.actualPayrollTaxes) || 0,
        actualRent: parseFloat(data.lastYear.actualRent) || 0,
        actualUtilities: parseFloat(data.lastYear.actualUtilities) || 0,
        actualMarketing: parseFloat(data.lastYear.actualMarketing) || 0,
        actualRepairsMaintenance: parseFloat(data.lastYear.actualRepairsMaintenance) || 0,
        actualSupplies: parseFloat(data.lastYear.actualSupplies) || 0,
        actualInsurance: parseFloat(data.lastYear.actualInsurance) || 0,
        actualCreditCardFees: parseFloat(data.lastYear.actualCreditCardFees) || 0,
        actualOtherExpenses: parseFloat(data.lastYear.actualOtherExpenses) || 0,
      } : undefined;
      
      const ytdData = data.ytd ? data.ytd.map((period: any) => ({
        ...period,
        actualFoodSales: parseFloat(period.actualFoodSales) || 0,
        actualBeverageSales: parseFloat(period.actualBeverageSales) || 0,
        actualOtherRevenue: parseFloat(period.actualOtherRevenue) || 0,
        actualFoodCost: parseFloat(period.actualFoodCost) || 0,
        actualBeverageCost: parseFloat(period.actualBeverageCost) || 0,
        actualKitchenLabor: parseFloat(period.actualKitchenLabor) || 0,
        actualFohLabor: parseFloat(period.actualFohLabor) || 0,
        actualManagementLabor: parseFloat(period.actualManagementLabor) || 0,
        actualPayrollTaxes: parseFloat(period.actualPayrollTaxes) || 0,
      })) : undefined;
      
      exportComprehensiveRestaurantPL(currentData, lastYearData, ytdData);
      
      toast({
        title: "Export Complete",
        description: `Comprehensive P&L exported for ${formData.month} ${formData.year}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export P&L spreadsheet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive Restaurant P&L</h1>
          <p className="text-muted-foreground">Professional P&L tool with Budget vs Actual, Last Year, and YTD comparisons</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save-pl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save P&L
          </Button>
          <Button
            onClick={handleExport}
            variant="default"
            data-testid="button-export-comprehensive-pl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label>Restaurant Name</Label>
            <Input
              value={formData.restaurantName}
              onChange={(e) => handleChange("restaurantName", e.target.value)}
              data-testid="input-restaurant-name"
            />
          </div>
          <div>
            <Label>Month</Label>
            <Input
              value={formData.month}
              onChange={(e) => handleChange("month", e.target.value)}
              data-testid="input-month"
            />
          </div>
          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange("year", e.target.value)}
              data-testid="input-year"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
          <TabsTrigger value="cogs" data-testid="tab-cogs">COGS</TabsTrigger>
          <TabsTrigger value="labor" data-testid="tab-labor">Labor</TabsTrigger>
          <TabsTrigger value="opex" data-testid="tab-opex">Operating Expenses</TabsTrigger>
          <TabsTrigger value="targets" data-testid="tab-targets">Industry Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue - Actual vs Budget</CardTitle>
              <CardDescription>Enter your actual and budgeted revenue by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Food Sales ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualFoodSales}
                    onChange={(e) => handleChange("actualFoodSales", e.target.value)}
                    data-testid="input-actual-food-sales"
                  />
                </div>
                <div>
                  <Label>Budget Food Sales ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetFoodSales}
                    onChange={(e) => handleChange("budgetFoodSales", e.target.value)}
                    data-testid="input-budget-food-sales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Beverage Sales ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualBeverageSales}
                    onChange={(e) => handleChange("actualBeverageSales", e.target.value)}
                    data-testid="input-actual-beverage-sales"
                  />
                </div>
                <div>
                  <Label>Budget Beverage Sales ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetBeverageSales}
                    onChange={(e) => handleChange("budgetBeverageSales", e.target.value)}
                    data-testid="input-budget-beverage-sales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Other Revenue ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualOtherRevenue}
                    onChange={(e) => handleChange("actualOtherRevenue", e.target.value)}
                    data-testid="input-actual-other-revenue"
                  />
                </div>
                <div>
                  <Label>Budget Other Revenue ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetOtherRevenue}
                    onChange={(e) => handleChange("budgetOtherRevenue", e.target.value)}
                    data-testid="input-budget-other-revenue"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cogs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost of Goods Sold</CardTitle>
              <CardDescription>Enter actual costs and budget percentages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Food Cost ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualFoodCost}
                    onChange={(e) => handleChange("actualFoodCost", e.target.value)}
                    data-testid="input-actual-food-cost"
                  />
                </div>
                <div>
                  <Label>Budget Food Cost (%)</Label>
                  <Input
                    type="number"
                    value={formData.budgetFoodCostPct}
                    onChange={(e) => handleChange("budgetFoodCostPct", e.target.value)}
                    data-testid="input-budget-food-cost-pct"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Beverage Cost ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualBeverageCost}
                    onChange={(e) => handleChange("actualBeverageCost", e.target.value)}
                    data-testid="input-actual-beverage-cost"
                  />
                </div>
                <div>
                  <Label>Budget Beverage Cost (%)</Label>
                  <Input
                    type="number"
                    value={formData.budgetBeverageCostPct}
                    onChange={(e) => handleChange("budgetBeverageCostPct", e.target.value)}
                    data-testid="input-budget-beverage-cost-pct"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Labor Costs</CardTitle>
              <CardDescription>Enter actual labor costs and budget percentages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Kitchen Labor ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualKitchenLabor}
                    onChange={(e) => handleChange("actualKitchenLabor", e.target.value)}
                    data-testid="input-actual-kitchen-labor"
                  />
                </div>
                <div>
                  <Label>Budget Labor Cost (% of Sales)</Label>
                  <Input
                    type="number"
                    value={formData.budgetLaborCostPct}
                    onChange={(e) => handleChange("budgetLaborCostPct", e.target.value)}
                    data-testid="input-budget-labor-cost-pct"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Front of House Labor ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualFohLabor}
                    onChange={(e) => handleChange("actualFohLabor", e.target.value)}
                    data-testid="input-actual-foh-labor"
                  />
                </div>
                <div>
                  <Label>Actual Management Labor ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualManagementLabor}
                    onChange={(e) => handleChange("actualManagementLabor", e.target.value)}
                    data-testid="input-actual-management-labor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Payroll Taxes ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualPayrollTaxes}
                    onChange={(e) => handleChange("actualPayrollTaxes", e.target.value)}
                    data-testid="input-actual-payroll-taxes"
                  />
                </div>
                <div>
                  <Label>Budget Payroll Taxes (% of Sales)</Label>
                  <Input
                    type="number"
                    value={formData.budgetPayrollTaxesPct}
                    onChange={(e) => handleChange("budgetPayrollTaxesPct", e.target.value)}
                    data-testid="input-budget-payroll-taxes-pct"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operating Expenses</CardTitle>
              <CardDescription>Enter actual and budgeted operating expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Rent ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualRent}
                    onChange={(e) => handleChange("actualRent", e.target.value)}
                    data-testid="input-actual-rent"
                  />
                </div>
                <div>
                  <Label>Budget Rent ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetRent}
                    onChange={(e) => handleChange("budgetRent", e.target.value)}
                    data-testid="input-budget-rent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Utilities ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualUtilities}
                    onChange={(e) => handleChange("actualUtilities", e.target.value)}
                    data-testid="input-actual-utilities"
                  />
                </div>
                <div>
                  <Label>Budget Utilities ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetUtilities}
                    onChange={(e) => handleChange("budgetUtilities", e.target.value)}
                    data-testid="input-budget-utilities"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Marketing ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualMarketing}
                    onChange={(e) => handleChange("actualMarketing", e.target.value)}
                    data-testid="input-actual-marketing"
                  />
                </div>
                <div>
                  <Label>Budget Marketing ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetMarketing}
                    onChange={(e) => handleChange("budgetMarketing", e.target.value)}
                    data-testid="input-budget-marketing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Repairs & Maintenance ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualRepairsMaintenance}
                    onChange={(e) => handleChange("actualRepairsMaintenance", e.target.value)}
                    data-testid="input-actual-repairs-maintenance"
                  />
                </div>
                <div>
                  <Label>Budget Repairs & Maintenance ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetRepairsMaintenance}
                    onChange={(e) => handleChange("budgetRepairsMaintenance", e.target.value)}
                    data-testid="input-budget-repairs-maintenance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Supplies ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualSupplies}
                    onChange={(e) => handleChange("actualSupplies", e.target.value)}
                    data-testid="input-actual-supplies"
                  />
                </div>
                <div>
                  <Label>Budget Supplies ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetSupplies}
                    onChange={(e) => handleChange("budgetSupplies", e.target.value)}
                    data-testid="input-budget-supplies"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Insurance ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualInsurance}
                    onChange={(e) => handleChange("actualInsurance", e.target.value)}
                    data-testid="input-actual-insurance"
                  />
                </div>
                <div>
                  <Label>Budget Insurance ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetInsurance}
                    onChange={(e) => handleChange("budgetInsurance", e.target.value)}
                    data-testid="input-budget-insurance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Credit Card Fees ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualCreditCardFees}
                    onChange={(e) => handleChange("actualCreditCardFees", e.target.value)}
                    data-testid="input-actual-credit-card-fees"
                  />
                </div>
                <div>
                  <Label>Budget Credit Card Fees ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetCreditCardFees}
                    onChange={(e) => handleChange("budgetCreditCardFees", e.target.value)}
                    data-testid="input-budget-credit-card-fees"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Other Expenses ($)</Label>
                  <Input
                    type="number"
                    value={formData.actualOtherExpenses}
                    onChange={(e) => handleChange("actualOtherExpenses", e.target.value)}
                    data-testid="input-actual-other-expenses"
                  />
                </div>
                <div>
                  <Label>Budget Other Expenses ($)</Label>
                  <Input
                    type="number"
                    value={formData.budgetOtherExpenses}
                    onChange={(e) => handleChange("budgetOtherExpenses", e.target.value)}
                    data-testid="input-budget-other-expenses"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Targets</CardTitle>
              <CardDescription>Set your target percentages (industry standards pre-filled)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Food Cost % (Industry: 28-35%)</Label>
                  <Input
                    type="number"
                    value={formData.targetFoodCostPct}
                    onChange={(e) => handleChange("targetFoodCostPct", e.target.value)}
                    data-testid="input-target-food-cost-pct"
                  />
                </div>
                <div>
                  <Label>Target Beverage Cost % (Industry: 18-24%)</Label>
                  <Input
                    type="number"
                    value={formData.targetBeverageCostPct}
                    onChange={(e) => handleChange("targetBeverageCostPct", e.target.value)}
                    data-testid="input-target-beverage-cost-pct"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Labor Cost % (Industry: 25-35%)</Label>
                  <Input
                    type="number"
                    value={formData.targetLaborCostPct}
                    onChange={(e) => handleChange("targetLaborCostPct", e.target.value)}
                    data-testid="input-target-labor-cost-pct"
                  />
                </div>
                <div>
                  <Label>Target Prime Cost % (Industry: 60-65%)</Label>
                  <Input
                    type="number"
                    value={formData.targetPrimeCostPct}
                    onChange={(e) => handleChange("targetPrimeCostPct", e.target.value)}
                    data-testid="input-target-prime-cost-pct"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Net Profit % (Industry: 3-10%)</Label>
                  <Input
                    type="number"
                    value={formData.targetNetProfitPct}
                    onChange={(e) => handleChange("targetNetProfitPct", e.target.value)}
                    data-testid="input-target-net-profit-pct"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
