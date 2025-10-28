// P&L Calculator - Core Business Logic from Mobile App
// Extracted from comprehensive-pl.tsx and pl-dashboard.tsx

class PLCalculator {
    constructor() {
        this.MONTHS = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }

    // Calculate comprehensive P&L based on mobile app logic
    calculateComprehensivePL(data) {
        const results = {
            period: {
                month: data.month,
                year: data.year,
                restaurantName: data.restaurantName || "Restaurant"
            },
            revenue: {},
            costs: {},
            margins: {},
            analysis: {}
        };

        // Revenue Calculations
        results.revenue.actualTotal = this.parseNumber(data.actualFoodSales) + 
                                     this.parseNumber(data.actualBeverageSales) + 
                                     this.parseNumber(data.actualOtherRevenue);

        results.revenue.budgetTotal = this.parseNumber(data.budgetFoodSales) + 
                                     this.parseNumber(data.budgetBeverageSales) + 
                                     this.parseNumber(data.budgetOtherRevenue);

        results.revenue.variance = results.revenue.actualTotal - results.revenue.budgetTotal;
        results.revenue.variancePct = results.revenue.budgetTotal > 0 ? 
            (results.revenue.variance / results.revenue.budgetTotal) * 100 : 0;

        // COGS Calculations
        const actualFoodCost = this.parseNumber(data.actualFoodCost);
        const actualBeverageCost = this.parseNumber(data.actualBeverageCost);
        results.costs.actualCOGS = actualFoodCost + actualBeverageCost;

        const budgetFoodCost = (this.parseNumber(data.actualFoodSales) * this.parseNumber(data.budgetFoodCostPct)) / 100;
        const budgetBeverageCost = (this.parseNumber(data.actualBeverageSales) * this.parseNumber(data.budgetBeverageCostPct)) / 100;
        results.costs.budgetCOGS = budgetFoodCost + budgetBeverageCost;

        results.costs.cogsVariance = results.costs.actualCOGS - results.costs.budgetCOGS;
        results.costs.actualCOGSPct = results.revenue.actualTotal > 0 ? 
            (results.costs.actualCOGS / results.revenue.actualTotal) * 100 : 0;

        // Labor Calculations
        const actualKitchenLabor = this.parseNumber(data.actualKitchenLabor);
        const actualFohLabor = this.parseNumber(data.actualFohLabor);
        const actualManagementLabor = this.parseNumber(data.actualManagementLabor);
        const actualPayrollTaxes = this.parseNumber(data.actualPayrollTaxes);
        
        results.costs.actualLabor = actualKitchenLabor + actualFohLabor + actualManagementLabor + actualPayrollTaxes;
        
        const budgetLabor = (results.revenue.actualTotal * this.parseNumber(data.budgetLaborCostPct)) / 100;
        results.costs.budgetLabor = budgetLabor;
        results.costs.laborVariance = results.costs.actualLabor - results.costs.budgetLabor;
        results.costs.actualLaborPct = results.revenue.actualTotal > 0 ? 
            (results.costs.actualLabor / results.revenue.actualTotal) * 100 : 0;

        // Prime Cost (COGS + Labor)
        results.costs.actualPrimeCost = results.costs.actualCOGS + results.costs.actualLabor;
        results.costs.budgetPrimeCost = results.costs.budgetCOGS + results.costs.budgetLabor;
        results.costs.primeCostVariance = results.costs.actualPrimeCost - results.costs.budgetPrimeCost;
        results.costs.actualPrimeCostPct = results.revenue.actualTotal > 0 ? 
            (results.costs.actualPrimeCost / results.revenue.actualTotal) * 100 : 0;

        // Operating Expenses
        const actualOpEx = this.parseNumber(data.actualRent) +
                          this.parseNumber(data.actualUtilities) +
                          this.parseNumber(data.actualMarketing) +
                          this.parseNumber(data.actualRepairsMaintenance) +
                          this.parseNumber(data.actualSupplies) +
                          this.parseNumber(data.actualInsurance) +
                          this.parseNumber(data.actualCreditCardFees) +
                          this.parseNumber(data.actualOtherExpenses);

        const budgetOpEx = this.parseNumber(data.budgetRent) +
                          this.parseNumber(data.budgetUtilities) +
                          this.parseNumber(data.budgetMarketing) +
                          this.parseNumber(data.budgetRepairsMaintenance) +
                          this.parseNumber(data.budgetSupplies) +
                          this.parseNumber(data.budgetInsurance) +
                          this.parseNumber(data.budgetCreditCardFees) +
                          this.parseNumber(data.budgetOtherExpenses);

        results.costs.actualOpEx = actualOpEx;
        results.costs.budgetOpEx = budgetOpEx;
        results.costs.opExVariance = actualOpEx - budgetOpEx;
        results.costs.actualOpExPct = results.revenue.actualTotal > 0 ? 
            (actualOpEx / results.revenue.actualTotal) * 100 : 0;

        // Net Profit Calculations
        results.margins.actualNetProfit = results.revenue.actualTotal - results.costs.actualPrimeCost - actualOpEx;
        results.margins.budgetNetProfit = results.revenue.budgetTotal - results.costs.budgetPrimeCost - budgetOpEx;
        results.margins.netProfitVariance = results.margins.actualNetProfit - results.margins.budgetNetProfit;
        results.margins.actualNetProfitPct = results.revenue.actualTotal > 0 ? 
            (results.margins.actualNetProfit / results.revenue.actualTotal) * 100 : 0;

        // Performance Analysis
        results.analysis = this.generatePerformanceAnalysis(results, data);

        return results;
    }

    // Simple P&L calculation for basic dashboard
    calculateSimplePL(data) {
        const revenue = this.parseNumber(data.actualRevenue);
        const foodCost = this.parseNumber(data.actualFoodCost);
        const laborCost = this.parseNumber(data.actualLaborCost);
        const overhead = this.parseNumber(data.actualOverhead);

        const totalCosts = foodCost + laborCost + overhead;
        const netProfit = revenue - totalCosts;
        const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        const foodCostPct = revenue > 0 ? (foodCost / revenue) * 100 : 0;
        const laborCostPct = revenue > 0 ? (laborCost / revenue) * 100 : 0;
        const overheadPct = revenue > 0 ? (overhead / revenue) * 100 : 0;

        // Target comparisons
        const targetRevenue = this.parseNumber(data.targetRevenue);
        const targetFoodCostPct = this.parseNumber(data.targetFoodCostPct);
        const targetLaborCostPct = this.parseNumber(data.targetLaborCostPct);
        const targetOverheadPct = this.parseNumber(data.targetOverheadPct);
        const targetProfitMarginPct = this.parseNumber(data.targetProfitMarginPct);

        return {
            revenue: {
                actual: revenue,
                target: targetRevenue,
                variance: revenue - targetRevenue,
                variancePct: targetRevenue > 0 ? ((revenue - targetRevenue) / targetRevenue) * 100 : 0
            },
            costs: {
                food: {
                    actual: foodCost,
                    actualPct: foodCostPct,
                    targetPct: targetFoodCostPct,
                    variance: foodCostPct - targetFoodCostPct
                },
                labor: {
                    actual: laborCost,
                    actualPct: laborCostPct,
                    targetPct: targetLaborCostPct,
                    variance: laborCostPct - targetLaborCostPct
                },
                overhead: {
                    actual: overhead,
                    actualPct: overheadPct,
                    targetPct: targetOverheadPct,
                    variance: overheadPct - targetOverheadPct
                },
                total: totalCosts
            },
            margins: {
                netProfit: netProfit,
                netMargin: netMargin,
                targetMargin: targetProfitMarginPct,
                marginVariance: netMargin - targetProfitMarginPct
            },
            performance: this.getPerformanceRating(netMargin, targetProfitMarginPct)
        };
    }

    generatePerformanceAnalysis(results, targets) {
        const analysis = {
            alerts: [],
            recommendations: [],
            kpis: {},
            trends: {}
        };

        // Revenue Analysis
        if (results.revenue.variancePct < -5) {
            analysis.alerts.push({
                type: 'warning',
                category: 'Revenue',
                message: `Revenue is ${Math.abs(results.revenue.variancePct).toFixed(1)}% below budget`,
                impact: 'high'
            });
        }

        // COGS Analysis
        const targetFoodCostPct = this.parseNumber(targets.targetFoodCostPct);
        if (results.costs.actualCOGSPct > targetFoodCostPct + 2) {
            analysis.alerts.push({
                type: 'error',
                category: 'Food Cost',
                message: `Food cost is ${(results.costs.actualCOGSPct - targetFoodCostPct).toFixed(1)}% above target`,
                impact: 'high'
            });
            analysis.recommendations.push('Review portion control and supplier pricing');
        }

        // Labor Analysis  
        const targetLaborPct = this.parseNumber(targets.targetLaborCostPct);
        if (results.costs.actualLaborPct > targetLaborPct + 2) {
            analysis.alerts.push({
                type: 'warning',
                category: 'Labor',
                message: `Labor cost is ${(results.costs.actualLaborPct - targetLaborPct).toFixed(1)}% above target`,
                impact: 'medium'
            });
            analysis.recommendations.push('Optimize scheduling and review productivity metrics');
        }

        // Prime Cost Analysis
        const targetPrimeCostPct = this.parseNumber(targets.targetPrimeCostPct) || 60;
        if (results.costs.actualPrimeCostPct > targetPrimeCostPct) {
            analysis.alerts.push({
                type: 'error',
                category: 'Prime Cost',
                message: `Prime cost exceeds ${targetPrimeCostPct}% target at ${results.costs.actualPrimeCostPct.toFixed(1)}%`,
                impact: 'critical'
            });
        }

        // Net Profit Analysis
        const targetNetProfitPct = this.parseNumber(targets.targetNetProfitPct) || 10;
        if (results.margins.actualNetProfitPct < targetNetProfitPct - 2) {
            analysis.alerts.push({
                type: 'error',
                category: 'Profitability',
                message: `Net profit margin below target: ${results.margins.actualNetProfitPct.toFixed(1)}% vs ${targetNetProfitPct}%`,
                impact: 'critical'
            });
        }

        // Key Performance Indicators
        analysis.kpis = {
            revenuePerformance: this.getPerformanceRating(results.revenue.variancePct, 0),
            costControl: this.getPerformanceRating(targetFoodCostPct - results.costs.actualCOGSPct, 0),
            laborEfficiency: this.getPerformanceRating(targetLaborPct - results.costs.actualLaborPct, 0),
            profitability: this.getPerformanceRating(results.margins.actualNetProfitPct, targetNetProfitPct),
            overallHealth: this.calculateOverallHealth(results, targets)
        };

        return analysis;
    }

    getPerformanceRating(actual, target) {
        const variance = actual - target;
        if (variance >= 2) return { rating: 'excellent', color: '#22c55e', score: 95 };
        if (variance >= 0) return { rating: 'good', color: '#84cc16', score: 80 };
        if (variance >= -2) return { rating: 'fair', color: '#eab308', score: 65 };
        if (variance >= -5) return { rating: 'poor', color: '#f97316', score: 40 };
        return { rating: 'critical', color: '#ef4444', score: 20 };
    }

    calculateOverallHealth(results, targets) {
        let score = 100;
        
        // Revenue performance (25% weight)
        if (results.revenue.variancePct < -5) score -= 15;
        else if (results.revenue.variancePct < 0) score -= 5;
        
        // Cost control (35% weight)
        const targetFoodCostPct = this.parseNumber(targets.targetFoodCostPct);
        if (results.costs.actualCOGSPct > targetFoodCostPct + 3) score -= 20;
        else if (results.costs.actualCOGSPct > targetFoodCostPct) score -= 10;
        
        // Labor efficiency (25% weight)
        const targetLaborPct = this.parseNumber(targets.targetLaborCostPct);
        if (results.costs.actualLaborPct > targetLaborPct + 3) score -= 15;
        else if (results.costs.actualLaborPct > targetLaborPct) score -= 8;
        
        // Profitability (15% weight)
        const targetNetProfitPct = this.parseNumber(targets.targetNetProfitPct) || 10;
        if (results.margins.actualNetProfitPct < targetNetProfitPct - 3) score -= 15;
        else if (results.margins.actualNetProfitPct < targetNetProfitPct) score -= 8;
        
        const health = Math.max(0, score);
        let status = 'critical';
        let color = '#ef4444';
        
        if (health >= 90) { status = 'excellent'; color = '#22c55e'; }
        else if (health >= 75) { status = 'good'; color = '#84cc16'; }
        else if (health >= 60) { status = 'fair'; color = '#eab308'; }
        else if (health >= 40) { status = 'poor'; color = '#f97316'; }
        
        return { rating: status, color: color, score: health };
    }

    parseNumber(value) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatPercentage(value, decimals = 1) {
        return `${value.toFixed(decimals)}%`;
    }
}

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLCalculator;
}