import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ChefHat, Target, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";
import { getARCCColors, getIconColorClasses, getStatusBadgeClasses, getSeverityDescription, type ColorSeverity } from "@/lib/arcc-colors";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Badge variant="outline">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted rounded w-20"></div>
                </CardTitle>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="outline">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-inventory-value" className={`${getARCCColors(metrics.colorIndicators.inventoryHealth).background} ${getARCCColors(metrics.colorIndicators.inventoryHealth).border}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.inventoryHealth)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalInventoryValue.toLocaleString()}</div>
            <p className={`text-xs ${getARCCColors(metrics.colorIndicators.inventoryHealth).text}`}>
              {getSeverityDescription(metrics.colorIndicators.inventoryHealth, 'inventory')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-low-stock" className={`${getARCCColors(metrics.colorIndicators.inventoryHealth).background} ${getARCCColors(metrics.colorIndicators.inventoryHealth).border}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            {metrics.lowStockItems > 0 ? (
              <AlertTriangle className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.inventoryHealth)}`} />
            ) : (
              <CheckCircle className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.inventoryHealth)}`} />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getARCCColors(metrics.colorIndicators.inventoryHealth).text}`}>{metrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.lowStockItems > 0 ? 'Items need restocking' : 'All items well-stocked'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-recipes">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRecipes}</div>
            <p className="text-xs text-muted-foreground">Ready to prepare</p>
          </CardContent>
        </Card>

        <Card data-testid="card-targets-on-track" className={`${getARCCColors(metrics.colorIndicators.operationalEfficiency).background} ${getARCCColors(metrics.colorIndicators.operationalEfficiency).border}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Targets On Track</CardTitle>
            <Target className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.operationalEfficiency)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getARCCColors(metrics.colorIndicators.operationalEfficiency).text}`}>{metrics.targetsOnTrack}</div>
            <p className={`text-xs ${getARCCColors(metrics.colorIndicators.operationalEfficiency).text}`}>
              {getSeverityDescription(metrics.colorIndicators.operationalEfficiency, 'efficiency')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-daily-sales" className={`${getARCCColors(metrics.colorIndicators.salesTrend).background} ${getARCCColors(metrics.colorIndicators.salesTrend).border}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
            <div className="flex items-center gap-1">
              {metrics.colorIndicators.salesTrend === 'excellent' || metrics.colorIndicators.salesTrend === 'good' ? (
                <ArrowUp className={`h-3 w-3 ${getIconColorClasses(metrics.colorIndicators.salesTrend)}`} />
              ) : (
                <ArrowDown className={`h-3 w-3 ${getIconColorClasses(metrics.colorIndicators.salesTrend)}`} />
              )}
              <DollarSign className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.salesTrend)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.dailySales.toLocaleString()}</div>
            <p className={`text-xs ${getARCCColors(metrics.colorIndicators.salesTrend).text}`}>
              {getSeverityDescription(metrics.colorIndicators.salesTrend, 'sales')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-food-cost" className={`${getARCCColors(metrics.colorIndicators.costControl).background} ${getARCCColors(metrics.colorIndicators.costControl).border}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Cost %</CardTitle>
            <TrendingUp className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.costControl)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getARCCColors(metrics.colorIndicators.costControl).text}`}>{metrics.foodCostPercentage}%</div>
            <p className={`text-xs ${getARCCColors(metrics.colorIndicators.costControl).text}`}>
              {getSeverityDescription(metrics.colorIndicators.costControl, 'cost')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-labor-hours">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.laborHours}</div>
            <p className="text-xs text-muted-foreground">Hours today</p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-variance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Variance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgVariance}%</div>
            <p className="text-xs text-muted-foreground">From targets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button 
              variant="ghost" 
              className="justify-start gap-2 h-auto p-2"
              onClick={() => window.location.href = '/inventory-entry'}
              data-testid="button-inventory"
            >
              <Package className={`h-4 w-4 ${getIconColorClasses(metrics.colorIndicators.inventoryHealth)}`} />
              <span className="text-sm">Inventory Entry</span>
              {metrics.lowStockItems > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {metrics.lowStockItems} low
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start gap-2 h-auto p-2"
              onClick={() => window.location.href = '/recipes'}
              data-testid="button-recipes"
            >
              <ChefHat className="h-4 w-4" />
              <span className="text-sm">Recipe Costing</span>
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start gap-2 h-auto p-2"
              onClick={() => window.location.href = '/targets'}
              data-testid="button-targets"
            >
              <Target className="h-4 w-4" />
              <span className="text-sm">Par Levels</span>
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-alerts">
          <CardHeader>
            <CardTitle>Smart Alerts</CardTitle>
            <CardDescription>ARCC-powered insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.colorIndicators.inventoryHealth === 'critical' && (
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${getIconColorClasses('critical')}`} />
                <span className={`text-sm ${getARCCColors('critical').text}`}>
                  Critical inventory levels detected
                </span>
              </div>
            )}
            {metrics.colorIndicators.salesTrend === 'critical' && (
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${getIconColorClasses('critical')}`} />
                <span className={`text-sm ${getARCCColors('critical').text}`}>
                  Sales performance needs attention
                </span>
              </div>
            )}
            {metrics.colorIndicators.costControl === 'critical' && (
              <div className="flex items-center gap-2">
                <DollarSign className={`h-4 w-4 ${getIconColorClasses('critical')}`} />
                <span className={`text-sm ${getARCCColors('critical').text}`}>
                  Food costs exceed safe margins
                </span>
              </div>
            )}
            {[
              metrics.colorIndicators.inventoryHealth,
              metrics.colorIndicators.salesTrend,
              metrics.colorIndicators.costControl,
              metrics.colorIndicators.operationalEfficiency
            ].every(indicator => indicator === 'excellent' || indicator === 'good') && (
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${getIconColorClasses('excellent')}`} />
                <span className={`text-sm ${getARCCColors('excellent').text}`}>
                  All systems performing optimally
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-performance">
          <CardHeader>
            <CardTitle>ARCC Performance</CardTitle>
            <CardDescription>Intelligent color-coded insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Inventory Health</span>
              <Badge className={getStatusBadgeClasses(metrics.colorIndicators.inventoryHealth)}>
                {metrics.colorIndicators.inventoryHealth}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sales Trend</span>
              <Badge className={getStatusBadgeClasses(metrics.colorIndicators.salesTrend)}>
                {metrics.colorIndicators.salesTrend}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cost Control</span>
              <Badge className={getStatusBadgeClasses(metrics.colorIndicators.costControl)}>
                {metrics.colorIndicators.costControl}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Efficiency</span>
              <Badge className={getStatusBadgeClasses(metrics.colorIndicators.operationalEfficiency)}>
                {metrics.colorIndicators.operationalEfficiency}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}