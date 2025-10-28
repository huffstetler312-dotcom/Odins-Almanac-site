import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ComprehensivePLData {
  restaurantName: string;
  month: string;
  year: number;
  
  // Revenue - Actual
  actualFoodSales: number;
  actualBeverageSales: number;
  actualOtherRevenue: number;
  
  // Revenue - Budget
  budgetFoodSales: number;
  budgetBeverageSales: number;
  budgetOtherRevenue: number;
  
  // COGS - Actual
  actualFoodCost: number;
  actualBeverageCost: number;
  
  // COGS - Budget Percentages
  budgetFoodCostPct: number;
  budgetBeverageCostPct: number;
  
  // Labor - Actual
  actualKitchenLabor: number;
  actualFohLabor: number;
  actualManagementLabor: number;
  actualPayrollTaxes: number;
  
  // Labor - Budget Percentages
  budgetLaborCostPct: number;
  budgetPayrollTaxesPct: number;
  
  // Operating Expenses - Actual
  actualRent: number;
  actualUtilities: number;
  actualMarketing: number;
  actualRepairsMaintenance: number;
  actualSupplies: number;
  actualInsurance: number;
  actualCreditCardFees: number;
  actualOtherExpenses: number;
  
  // Operating Expenses - Budget
  budgetRent: number;
  budgetUtilities: number;
  budgetMarketing: number;
  budgetRepairsMaintenance: number;
  budgetSupplies: number;
  budgetInsurance: number;
  budgetCreditCardFees: number;
  budgetOtherExpenses: number;
  
  // Target Benchmarks
  targetFoodCostPct: number;
  targetBeverageCostPct: number;
  targetLaborCostPct: number;
  targetPrimeCostPct: number;
  targetNetProfitPct: number;
}

/**
 * Creates comprehensive restaurant P&L workbook with Budget vs Actual, Last Year, and YTD comparisons
 */
export function exportComprehensiveRestaurantPL(
  currentPeriod: ComprehensivePLData,
  lastYearPeriod?: ComprehensivePLData,
  ytdData?: ComprehensivePLData[]
) {
  const wb = XLSX.utils.book_new();
  
  // Create main P&L statement sheet
  const plSheet = createMainPLSheet(currentPeriod, lastYearPeriod);
  XLSX.utils.book_append_sheet(wb, plSheet, 'P&L Statement');
  
  // Create KPI dashboard
  const kpiSheet = createKPIDashboard(currentPeriod, lastYearPeriod);
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPI Dashboard');
  
  // Create variance analysis
  const varianceSheet = createVarianceAnalysis(currentPeriod);
  XLSX.utils.book_append_sheet(wb, varianceSheet, 'Variance Analysis');
  
  // Create YTD summary if data available
  if (ytdData && ytdData.length > 0) {
    const ytdSheet = createYTDSummary(ytdData);
    XLSX.utils.book_append_sheet(wb, ytdSheet, 'YTD Summary');
  }
  
  // Write file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  const fileName = `${currentPeriod.restaurantName.replace(/\s+/g, '_')}_PL_${currentPeriod.month}_${currentPeriod.year}.xlsx`;
  saveAs(blob, fileName);
}

/**
 * Main P&L Statement with Budget vs Actual vs Last Year comparisons
 */
function createMainPLSheet(current: ComprehensivePLData, lastYear?: ComprehensivePLData): XLSX.WorkSheet {
  const hasLastYear = !!lastYear;
  
  const data: any[][] = [
    // Header
    ['VIKING CONSULTING GROUP', '', '', '', '', '', '', ''],
    [`${current.restaurantName} - Profit & Loss Statement`, '', '', '', '', '', '', ''],
    [`Period: ${current.month} ${current.year}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // Column Headers
    ['Category', 'Actual', '% of Sales', 'Budget', 'Variance', 'Var %', 
     hasLastYear ? 'Last Year' : '', hasLastYear ? 'YoY Change' : ''],
    
    // REVENUE SECTION
    ['REVENUE', '', '', '', '', '', '', ''],
    ['Food Sales', current.actualFoodSales, 
      { f: 'B7/$B$16*100' }, 
      current.budgetFoodSales,
      { f: 'B7-D7' },
      { f: 'IF(D7=0,0,(E7/D7)*100)' },
      hasLastYear ? lastYear!.actualFoodSales : '',
      hasLastYear ? { f: 'B7-G7' } : ''
    ],
    ['Beverage Sales', current.actualBeverageSales,
      { f: 'B8/$B$16*100' },
      current.budgetBeverageSales,
      { f: 'B8-D8' },
      { f: 'IF(D8=0,0,(E8/D8)*100)' },
      hasLastYear ? lastYear!.actualBeverageSales : '',
      hasLastYear ? { f: 'B8-G8' } : ''
    ],
    ['Other Revenue', current.actualOtherRevenue,
      { f: 'B9/$B$16*100' },
      current.budgetOtherRevenue,
      { f: 'B9-D9' },
      { f: 'IF(D9=0,0,(E9/D9)*100)' },
      hasLastYear ? lastYear!.actualOtherRevenue : '',
      hasLastYear ? { f: 'B9-G9' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    
    // TOTAL REVENUE
    ['TOTAL SALES', 
      { f: 'SUM(B7:B9)' },
      '100.0%',
      { f: 'SUM(D7:D9)' },
      { f: 'B11-D11' },
      { f: 'IF(D11=0,0,(E11/D11)*100)' },
      hasLastYear ? { f: 'SUM(G7:G9)' } : '',
      hasLastYear ? { f: 'B11-G11' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    
    // COST OF GOODS SOLD
    ['COST OF GOODS SOLD', '', '', '', '', '', '', ''],
    ['Food Cost', current.actualFoodCost,
      { f: 'B14/$B$11*100' },
      { f: `D7*${current.budgetFoodCostPct}/100` },
      { f: 'B14-D14' },
      { f: 'IF(D14=0,0,(E14/D14)*100)' },
      hasLastYear ? lastYear!.actualFoodCost : '',
      hasLastYear ? { f: 'B14-G14' } : ''
    ],
    ['Beverage Cost', current.actualBeverageCost,
      { f: 'B15/$B$11*100' },
      { f: `D8*${current.budgetBeverageCostPct}/100` },
      { f: 'B15-D15' },
      { f: 'IF(D15=0,0,(E15/D15)*100)' },
      hasLastYear ? lastYear!.actualBeverageCost : '',
      hasLastYear ? { f: 'B15-G15' } : ''
    ],
    ['TOTAL COGS', 
      { f: 'B14+B15' },
      { f: 'B16/$B$11*100' },
      { f: 'D14+D15' },
      { f: 'B16-D16' },
      { f: 'IF(D16=0,0,(E16/D16)*100)' },
      hasLastYear ? { f: 'G14+G15' } : '',
      hasLastYear ? { f: 'B16-G16' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    ['GROSS PROFIT',
      { f: 'B11-B16' },
      { f: 'B18/$B$11*100' },
      { f: 'D11-D16' },
      { f: 'B18-D18' },
      { f: 'IF(D18=0,0,(E18/D18)*100)' },
      hasLastYear ? { f: 'G11-G16' } : '',
      hasLastYear ? { f: 'B18-G18' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    
    // LABOR COSTS
    ['LABOR COSTS', '', '', '', '', '', '', ''],
    ['Kitchen Labor', current.actualKitchenLabor,
      { f: 'B21/$B$11*100' },
      { f: `D11*${current.budgetLaborCostPct}/100*0.50` }, // 50% of total labor budget
      { f: 'B21-D21' },
      { f: 'IF(D21=0,0,(E21/D21)*100)' },
      hasLastYear ? lastYear!.actualKitchenLabor : '',
      hasLastYear ? { f: 'B21-G21' } : ''
    ],
    ['Front of House Labor', current.actualFohLabor,
      { f: 'B22/$B$11*100' },
      { f: `D11*${current.budgetLaborCostPct}/100*0.35` }, // 35% of total labor budget
      { f: 'B22-D22' },
      { f: 'IF(D22=0,0,(E22/D22)*100)' },
      hasLastYear ? lastYear!.actualFohLabor : '',
      hasLastYear ? { f: 'B22-G22' } : ''
    ],
    ['Management', current.actualManagementLabor,
      { f: 'B23/$B$11*100' },
      { f: `D11*${current.budgetLaborCostPct}/100*0.15` }, // 15% of total labor budget
      { f: 'B23-D23' },
      { f: 'IF(D23=0,0,(E23/D23)*100)' },
      hasLastYear ? lastYear!.actualManagementLabor : '',
      hasLastYear ? { f: 'B23-G23' } : ''
    ],
    ['Payroll Taxes & Benefits', current.actualPayrollTaxes,
      { f: 'B24/$B$11*100' },
      { f: `D11*${current.budgetPayrollTaxesPct}/100` },
      { f: 'B24-D24' },
      { f: 'IF(D24=0,0,(E24/D24)*100)' },
      hasLastYear ? lastYear!.actualPayrollTaxes : '',
      hasLastYear ? { f: 'B24-G24' } : ''
    ],
    ['TOTAL LABOR',
      { f: 'SUM(B21:B24)' },
      { f: 'B25/$B$11*100' },
      { f: 'SUM(D21:D24)' },
      { f: 'B25-D25' },
      { f: 'IF(D25=0,0,(E25/D25)*100)' },
      hasLastYear ? { f: 'SUM(G21:G24)' } : '',
      hasLastYear ? { f: 'B25-G25' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    
    // PRIME COST
    ['PRIME COST (COGS + Labor)',
      { f: 'B16+B25' },
      { f: 'B27/$B$11*100' },
      { f: 'D16+D25' },
      { f: 'B27-D27' },
      { f: 'IF(D27=0,0,(E27/D27)*100)' },
      hasLastYear ? { f: 'G16+G25' } : '',
      hasLastYear ? { f: 'B27-G27' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    
    // OPERATING EXPENSES
    ['OPERATING EXPENSES', '', '', '', '', '', '', ''],
    ['Rent/Occupancy', current.actualRent,
      { f: 'B30/$B$11*100' },
      current.budgetRent,
      { f: 'B30-D30' },
      { f: 'IF(D30=0,0,(E30/D30)*100)' },
      hasLastYear ? lastYear!.actualRent : '',
      hasLastYear ? { f: 'B30-G30' } : ''
    ],
    ['Utilities', current.actualUtilities,
      { f: 'B31/$B$11*100' },
      current.budgetUtilities,
      { f: 'B31-D31' },
      { f: 'IF(D31=0,0,(E31/D31)*100)' },
      hasLastYear ? lastYear!.actualUtilities : '',
      hasLastYear ? { f: 'B31-G31' } : ''
    ],
    ['Marketing & Advertising', current.actualMarketing,
      { f: 'B32/$B$11*100' },
      current.budgetMarketing,
      { f: 'B32-D32' },
      { f: 'IF(D32=0,0,(E32/D32)*100)' },
      hasLastYear ? lastYear!.actualMarketing : '',
      hasLastYear ? { f: 'B32-G32' } : ''
    ],
    ['Repairs & Maintenance', current.actualRepairsMaintenance,
      { f: 'B33/$B$11*100' },
      current.budgetRepairsMaintenance,
      { f: 'B33-D33' },
      { f: 'IF(D33=0,0,(E33/D33)*100)' },
      hasLastYear ? lastYear!.actualRepairsMaintenance : '',
      hasLastYear ? { f: 'B33-G33' } : ''
    ],
    ['Supplies & Smallwares', current.actualSupplies,
      { f: 'B34/$B$11*100' },
      current.budgetSupplies,
      { f: 'B34-D34' },
      { f: 'IF(D34=0,0,(E34/D34)*100)' },
      hasLastYear ? lastYear!.actualSupplies : '',
      hasLastYear ? { f: 'B34-G34' } : ''
    ],
    ['Insurance', current.actualInsurance,
      { f: 'B35/$B$11*100' },
      current.budgetInsurance,
      { f: 'B35-D35' },
      { f: 'IF(D35=0,0,(E35/D35)*100)' },
      hasLastYear ? lastYear!.actualInsurance : '',
      hasLastYear ? { f: 'B35-G35' } : ''
    ],
    ['Credit Card Fees', current.actualCreditCardFees,
      { f: 'B36/$B$11*100' },
      current.budgetCreditCardFees,
      { f: 'B36-D36' },
      { f: 'IF(D36=0,0,(E36/D36)*100)' },
      hasLastYear ? lastYear!.actualCreditCardFees : '',
      hasLastYear ? { f: 'B36-G36' } : ''
    ],
    ['Other Operating Expenses', current.actualOtherExpenses,
      { f: 'B37/$B$11*100' },
      current.budgetOtherExpenses,
      { f: 'B37-D37' },
      { f: 'IF(D37=0,0,(E37/D37)*100)' },
      hasLastYear ? lastYear!.actualOtherExpenses : '',
      hasLastYear ? { f: 'B37-G37' } : ''
    ],
    ['TOTAL OPERATING EXPENSES',
      { f: 'SUM(B30:B37)' },
      { f: 'B38/$B$11*100' },
      { f: 'SUM(D30:D37)' },
      { f: 'B38-D38' },
      { f: 'IF(D38=0,0,(E38/D38)*100)' },
      hasLastYear ? { f: 'SUM(G30:G37)' } : '',
      hasLastYear ? { f: 'B38-G38' } : ''
    ],
    ['', '', '', '', '', '', '', ''],
    
    // NET PROFIT
    ['NET PROFIT BEFORE TAX',
      { f: 'B18-B25-B38' },
      { f: 'B40/$B$11*100' },
      { f: 'D18-D25-D38' },
      { f: 'B40-D40' },
      { f: 'IF(D40=0,0,(E40/D40)*100)' },
      hasLastYear ? { f: 'G18-G25-G38' } : '',
      hasLastYear ? { f: 'B40-G40' } : ''
    ],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Column widths
  ws['!cols'] = [
    { wch: 30 },  // Category
    { wch: 15 },  // Actual
    { wch: 12 },  // % of Sales
    { wch: 15 },  // Budget
    { wch: 15 },  // Variance
    { wch: 10 },  // Var %
    { wch: 15 },  // Last Year
    { wch: 15 },  // YoY Change
  ];
  
  // Merge cells for headers
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },  // Company name
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },  // Restaurant name
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },  // Period
  ];
  
  return ws;
}

/**
 * KPI Dashboard with industry benchmarks
 */
function createKPIDashboard(current: ComprehensivePLData, lastYear?: ComprehensivePLData): XLSX.WorkSheet {
  const totalSales = current.actualFoodSales + current.actualBeverageSales + current.actualOtherRevenue;
  const totalCOGS = current.actualFoodCost + current.actualBeverageCost;
  const totalLabor = current.actualKitchenLabor + current.actualFohLabor + current.actualManagementLabor + current.actualPayrollTaxes;
  const primeCost = totalCOGS + totalLabor;
  
  const data: any[][] = [
    ['KEY PERFORMANCE INDICATORS', '', '', '', ''],
    [`${current.restaurantName} - ${current.month} ${current.year}`, '', '', '', ''],
    ['', '', '', '', ''],
    ['Metric', 'Actual %', 'Budget/Target %', 'Industry Benchmark', 'Status'],
    
    ['Food Cost %',
      { f: `IF($B$7=0,0,($B$8/$B$7)*100)` },
      current.targetFoodCostPct,
      '28-35%',
      { f: 'IF(B5<=C5,"✓ On Target","⚠ Over Target")' }
    ],
    
    ['Beverage Cost %',
      { f: `IF($B$7=0,0,($B$9/$B$7)*100)` },
      current.targetBeverageCostPct,
      '18-24%',
      { f: 'IF(B6<=C6,"✓ On Target","⚠ Over Target")' }
    ],
    
    ['Total COGS %',
      { f: `IF($B$7=0,0,($B$10/$B$7)*100)` },
      { f: '(C5+C6)/2' },
      '28-35%',
      { f: 'IF(B7<=35,"✓ On Target","⚠ Over Target")' }
    ],
    
    ['Labor Cost %',
      { f: `IF($B$7=0,0,($B$11/$B$7)*100)` },
      current.targetLaborCostPct,
      '25-35%',
      { f: 'IF(B8<=C8,"✓ On Target","⚠ Over Target")' }
    ],
    
    ['Prime Cost %',
      { f: `IF($B$7=0,0,($B$12/$B$7)*100)` },
      current.targetPrimeCostPct,
      '60-65%',
      { f: 'IF(B9<=C9,"✓ Excellent","⚠ High")' }
    ],
    
    ['Net Profit Margin %',
      { f: `IF($B$7=0,0,($B$13/$B$7)*100)` },
      current.targetNetProfitPct,
      '3-10%',
      { f: 'IF(B10>=C10,"✓ Profitable","⚠ Below Target")' }
    ],
    ['', '', '', '', ''],
    
    // Calculated Values (hidden formulas for reference)
    ['CALCULATIONS (Reference)', '', '', '', ''],
    ['Total Sales', totalSales, '', '', ''],
    ['Total COGS', totalCOGS, '', '', ''],
    ['Total Labor', totalLabor, '', '', ''],
    ['Prime Cost', primeCost, '', '', ''],
    ['Net Profit', { f: 'B7-B8-B9-B11' }, '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
  ];
  
  return ws;
}

/**
 * Variance Analysis Sheet
 */
function createVarianceAnalysis(current: ComprehensivePLData): XLSX.WorkSheet {
  const data: any[][] = [
    ['BUDGET VARIANCE ANALYSIS', '', '', '', ''],
    [`${current.month} ${current.year}`, '', '', '', ''],
    ['', '', '', '', ''],
    ['Category', 'Budget', 'Actual', 'Variance', 'Variance %'],
    
    // Revenue Variances
    ['REVENUE VARIANCES', '', '', '', ''],
    ['Food Sales', current.budgetFoodSales, current.actualFoodSales, 
      { f: 'C6-B6' }, { f: 'IF(B6=0,0,(D6/B6)*100)' }],
    ['Beverage Sales', current.budgetBeverageSales, current.actualBeverageSales,
      { f: 'C7-B7' }, { f: 'IF(B7=0,0,(D7/B7)*100)' }],
    ['Other Revenue', current.budgetOtherRevenue, current.actualOtherRevenue,
      { f: 'C8-B8' }, { f: 'IF(B8=0,0,(D8/B8)*100)' }],
    ['', '', '', '', ''],
    
    // Cost Variances  
    ['COST VARIANCES', '', '', '', ''],
    ['Food Cost', { f: `${current.budgetFoodSales}*${current.budgetFoodCostPct}/100` }, current.actualFoodCost,
      { f: 'C11-B11' }, { f: 'IF(B11=0,0,(D11/B11)*100)' }],
    ['Beverage Cost', { f: `${current.budgetBeverageSales}*${current.budgetBeverageCostPct}/100` }, current.actualBeverageCost,
      { f: 'C12-B12' }, { f: 'IF(B12=0,0,(D12/B12)*100)' }],
    ['Total Labor', 
      current.actualKitchenLabor + current.actualFohLabor + current.actualManagementLabor + current.actualPayrollTaxes,
      { f: `(${current.budgetFoodSales}+${current.budgetBeverageSales}+${current.budgetOtherRevenue})*${current.budgetLaborCostPct}/100` },
      { f: 'C13-B13' }, { f: 'IF(B13=0,0,(D13/B13)*100)' }],
    ['', '', '', '', ''],
    
    ['SUMMARY', '', '', '', ''],
    ['Favorable Variances', { f: 'SUMIF(D6:D13,">0",D6:D13)' }, '', '', ''],
    ['Unfavorable Variances', { f: 'SUMIF(D6:D13,"<0",D6:D13)' }, '', '', ''],
    ['Net Variance', { f: 'B16+B17' }, '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
  ];
  
  return ws;
}

/**
 * YTD Summary Sheet
 */
function createYTDSummary(ytdData: ComprehensivePLData[]): XLSX.WorkSheet {
  const headers = [
    ['YEAR-TO-DATE SUMMARY', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Month', 'Total Sales', 'COGS', 'Labor', 'Prime Cost %', 'Net Profit %'],
  ];
  
  const rows = ytdData.map((period, index) => {
    const totalSales = period.actualFoodSales + period.actualBeverageSales + period.actualOtherRevenue;
    const totalCOGS = period.actualFoodCost + period.actualBeverageCost;
    const totalLabor = period.actualKitchenLabor + period.actualFohLabor + period.actualManagementLabor + period.actualPayrollTaxes;
    const rowNum = index + 4;
    
    return [
      `${period.month} ${period.year}`,
      totalSales,
      totalCOGS,
      totalLabor,
      { f: `IF(B${rowNum}=0,0,((C${rowNum}+D${rowNum})/B${rowNum})*100)` },
      { f: `IF(B${rowNum}=0,0,((B${rowNum}-C${rowNum}-D${rowNum})/B${rowNum})*100)` },
    ];
  });
  
  const data = [...headers, ...rows];
  
  // Add totals row
  const lastRow = rows.length + 4;
  data.push(
    ['', '', '', '', '', ''],
    ['YTD TOTALS',
      { f: `SUM(B4:B${lastRow - 1})` },
      { f: `SUM(C4:C${lastRow - 1})` },
      { f: `SUM(D4:D${lastRow - 1})` },
      { f: `IF(B${lastRow}=0,0,((C${lastRow}+D${lastRow})/B${lastRow})*100)` },
      { f: `IF(B${lastRow}=0,0,((B${lastRow}-C${lastRow}-D${lastRow})/B${lastRow})*100)` },
    ]
  );
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  ];
  
  return ws;
}
