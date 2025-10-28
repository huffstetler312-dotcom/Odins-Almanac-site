import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface PLData {
  month: string;
  year: number;
  targets: {
    targetRevenue: number;
    targetFoodCostPct: number;
    targetLaborCostPct: number;
    targetOverheadPct: number;
    targetProfitMarginPct: number;
  };
  actuals: {
    actualRevenue: number;
    actualFoodCost: number;
    actualLaborCost: number;
    actualOverhead: number;
  };
}

interface PLCalculations {
  targetFoodCost: number;
  targetLaborCost: number;
  targetOverhead: number;
  targetProfit: number;
  actualFoodCostPct: number;
  actualLaborCostPct: number;
  actualOverheadPct: number;
  actualProfit: number;
  actualProfitMargin: number;
  varianceFoodCost: number;
  varianceLaborCost: number;
  varianceOverhead: number;
  varianceProfit: number;
}

/**
 * Viking Consultant Professional P&L Spreadsheet Export
 * Features:
 * - Built-in Excel formulas for automatic calculations
 * - Professional corporate styling
 * - Multiple sheets (Summary, Details, Historical Trends)
 * - Variance analysis with conditional formatting
 */
export function exportPLToExcel(
  plData: PLData,
  calculations: PLCalculations,
  historicalData: PLData[] = [],
  restaurantName: string = 'Restaurant'
): void {
  const workbook = XLSX.utils.book_new();

  // ===== SHEET 1: Executive Summary =====
  const summarySheet = createExecutiveSummary(plData, calculations, restaurantName);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // ===== SHEET 2: Detailed P&L with Formulas =====
  const detailSheet = createDetailedPL(plData, restaurantName);
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'P&L Detail');

  // ===== SHEET 3: Variance Analysis =====
  const varianceSheet = createVarianceAnalysis(plData, calculations);
  XLSX.utils.book_append_sheet(workbook, varianceSheet, 'Variance Analysis');

  // ===== SHEET 4: Historical Trends (if data available) =====
  if (historicalData.length > 0) {
    const trendsSheet = createHistoricalTrends(historicalData);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Historical Trends');
  }

  // Export with professional filename
  const filename = `${restaurantName.replace(/\s+/g, '_')}_PL_${plData.month}_${plData.year}_Viking_Consulting.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Creates Executive Summary sheet with key metrics and formulas
 */
function createExecutiveSummary(plData: PLData, calc: PLCalculations, restaurantName: string): XLSX.WorkSheet {
  const data: any[][] = [
    // Header with company branding
    ['VIKING CONSULTING GROUP', '', '', '', '', ''],
    ['Profit & Loss Statement - Executive Summary', '', '', '', '', ''],
    [`Client: ${restaurantName}`, '', '', `Period: ${plData.month} ${plData.year}`, '', ''],
    ['', '', '', '', '', ''],
    
    // Key Performance Indicators
    ['KEY PERFORMANCE INDICATORS', '', '', '', '', ''],
    ['Metric', 'Target', 'Actual', 'Variance', 'Variance %', 'Status'],
    
    ['Revenue', plData.targets.targetRevenue, plData.actuals.actualRevenue, 
      { f: 'C7-B7' }, // Formula for variance
      { f: 'IF(B7=0,0,(D7/B7)*100)' }, // Formula for variance %
      { f: 'IF(E7>=0,"✓ On Track","⚠ Below Target")' }
    ],
    
    ['Food Cost', 
      { f: `(B7*${plData.targets.targetFoodCostPct}/100)` }, // Formula for target food cost
      plData.actuals.actualFoodCost,
      { f: 'C8-B8' },
      { f: 'IF(B8=0,0,(D8/B8)*100)' },
      { f: 'IF(E8<=0,"✓ Under Budget","⚠ Over Budget")' }
    ],
    
    ['Labor Cost', 
      { f: `(B7*${plData.targets.targetLaborCostPct}/100)` }, // Formula for target labor cost
      plData.actuals.actualLaborCost,
      { f: 'C9-B9' },
      { f: 'IF(B9=0,0,(D9/B9)*100)' },
      { f: 'IF(E9<=0,"✓ Under Budget","⚠ Over Budget")' }
    ],
    
    ['Overhead', 
      { f: `(B7*${plData.targets.targetOverheadPct}/100)` }, // Formula for target overhead
      plData.actuals.actualOverhead,
      { f: 'C10-B10' },
      { f: 'IF(B10=0,0,(D10/B10)*100)' },
      { f: 'IF(E10<=0,"✓ Under Budget","⚠ Over Budget")' }
    ],
    
    ['Net Profit', 
      { f: `(B7*${plData.targets.targetProfitMarginPct}/100)` }, // Formula for target profit
      { f: 'C7-C8-C9-C10' }, // Formula for actual profit
      { f: 'C11-B11' },
      { f: 'IF(B11=0,0,(D11/B11)*100)' },
      { f: 'IF(E11>=0,"✓ Profitable","⚠ Loss")' }
    ],
    
    ['', '', '', '', '', ''],
    
    // Profitability Ratios
    ['PROFITABILITY RATIOS', '', '', '', '', ''],
    ['Ratio', 'Target %', 'Actual %', 'Variance', '', ''],
    
    ['Food Cost %', plData.targets.targetFoodCostPct, 
      { f: 'IF($C$7=0,0,($C$8/$C$7)*100)' }, // Actual food cost %
      { f: 'C15-B15' }, '', ''
    ],
    
    ['Labor Cost %', plData.targets.targetLaborCostPct,
      { f: 'IF($C$7=0,0,($C$9/$C$7)*100)' }, // Actual labor cost %
      { f: 'C16-B16' }, '', ''
    ],
    
    ['Overhead %', plData.targets.targetOverheadPct,
      { f: 'IF($C$7=0,0,($C$10/$C$7)*100)' }, // Actual overhead %
      { f: 'C17-B17' }, '', ''
    ],
    
    ['Profit Margin %', plData.targets.targetProfitMarginPct,
      { f: 'IF($C$7=0,0,($C$11/$C$7)*100)' }, // Actual profit margin %
      { f: 'C18-B18' }, '', ''
    ],
    
    ['', '', '', '', '', ''],
    
    // Bottom Line Summary
    ['SUMMARY', '', '', '', '', ''],
    ['Total Revenue', '', { f: 'C7' }, '', '', ''],
    ['Total Costs', '', { f: 'C8+C9+C10' }, '', '', ''],
    ['Net Profit', '', { f: 'C22-C23' }, '', '', ''],
    ['Profit Margin %', '', { f: 'IF(C22=0,0,(C24/C22)*100)' }, '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths (Viking Consulting standard)
  ws['!cols'] = [
    { wch: 25 }, // Column A - Metric names
    { wch: 15 }, // Column B - Target
    { wch: 15 }, // Column C - Actual
    { wch: 15 }, // Column D - Variance
    { wch: 12 }, // Column E - Variance %
    { wch: 18 }, // Column F - Status
  ];

  // Merge cells for headers
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Viking header
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Title
  ];

  return ws;
}

/**
 * Creates detailed P&L sheet with all formulas
 */
function createDetailedPL(plData: PLData, restaurantName: string): XLSX.WorkSheet {
  const data: any[][] = [
    ['PROFIT & LOSS STATEMENT (DETAILED)', '', '', '', ''],
    [`${restaurantName} - ${plData.month} ${plData.year}`, '', '', '', ''],
    ['Prepared by Viking Consulting Group', '', '', '', ''],
    ['', '', '', '', ''],
    
    ['REVENUE', '', '', '', ''],
    ['Description', 'Target ($)', 'Actual ($)', 'Variance ($)', 'Variance (%)'],
    ['Total Revenue', plData.targets.targetRevenue, plData.actuals.actualRevenue, 
      { f: 'C7-B7' }, 
      { f: 'IF(B7=0,0,(D7/B7)*100)' }
    ],
    ['', '', '', '', ''],
    
    ['COST OF GOODS SOLD', '', '', '', ''],
    ['Description', 'Target ($)', 'Actual ($)', 'Variance ($)', 'Variance (%)'],
    ['Food Cost', 
      { f: '(B7*' + (plData.targets.targetFoodCostPct / 100) + ')' }, // Target food cost formula
      plData.actuals.actualFoodCost,
      { f: 'C11-B11' },
      { f: 'IF(B11=0,0,(D11/B11)*100)' }
    ],
    ['Food Cost %', plData.targets.targetFoodCostPct + '%', 
      { f: 'IF(C7=0,"0%",TEXT(C11/C7,"0.0%"))' }, '', ''
    ],
    ['', '', '', '', ''],
    
    ['LABOR COSTS', '', '', '', ''],
    ['Description', 'Target ($)', 'Actual ($)', 'Variance ($)', 'Variance (%)'],
    ['Labor Cost',
      { f: '(B7*' + (plData.targets.targetLaborCostPct / 100) + ')' }, // Target labor cost formula
      plData.actuals.actualLaborCost,
      { f: 'C16-B16' },
      { f: 'IF(B16=0,0,(D16/B16)*100)' }
    ],
    ['Labor Cost %', plData.targets.targetLaborCostPct + '%',
      { f: 'IF(C7=0,"0%",TEXT(C16/C7,"0.0%"))' }, '', ''
    ],
    ['', '', '', '', ''],
    
    ['OVERHEAD EXPENSES', '', '', '', ''],
    ['Description', 'Target ($)', 'Actual ($)', 'Variance ($)', 'Variance (%)'],
    ['Overhead',
      { f: '(B7*' + (plData.targets.targetOverheadPct / 100) + ')' }, // Target overhead formula
      plData.actuals.actualOverhead,
      { f: 'C21-B21' },
      { f: 'IF(B21=0,0,(D21/B21)*100)' }
    ],
    ['Overhead %', plData.targets.targetOverheadPct + '%',
      { f: 'IF(C7=0,"0%",TEXT(C21/C7,"0.0%"))' }, '', ''
    ],
    ['', '', '', '', ''],
    
    ['PROFIT ANALYSIS', '', '', '', ''],
    ['Description', 'Target ($)', 'Actual ($)', 'Variance ($)', 'Variance (%)'],
    ['Total Costs', 
      { f: 'B11+B16+B21' }, // Sum of all target costs
      { f: 'C11+C16+C21' }, // Sum of all actual costs
      { f: 'C26-B26' },
      { f: 'IF(B26=0,0,(D26/B26)*100)' }
    ],
    ['Net Profit',
      { f: 'B7-B26' }, // Target profit formula
      { f: 'C7-C26' }, // Actual profit formula
      { f: 'C27-B27' },
      { f: 'IF(B27=0,0,(D27/B27)*100)' }
    ],
    ['Profit Margin %',
      { f: 'IF(B7=0,"0%",TEXT(B27/B7,"0.0%"))' },
      { f: 'IF(C7=0,"0%",TEXT(C27/C7,"0.0%"))' },
      '', ''
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
  ];

  return ws;
}

/**
 * Creates variance analysis sheet with formulas referencing Executive Summary
 */
function createVarianceAnalysis(plData: PLData, calc: PLCalculations): XLSX.WorkSheet {
  const data: any[][] = [
    ['VARIANCE ANALYSIS', '', '', ''],
    [`Period: ${plData.month} ${plData.year}`, '', '', ''],
    ['', '', '', ''],
    
    ['Category', 'Favorable Variance ($)', 'Unfavorable Variance ($)', 'Net Impact'],
    
    ['Revenue Variance',
      { f: 'IF(\'Executive Summary\'!D7>=0,\'Executive Summary\'!D7,"")' },
      { f: 'IF(\'Executive Summary\'!D7<0,ABS(\'Executive Summary\'!D7),"")' },
      { f: '\'Executive Summary\'!D7' }
    ],
    
    ['Food Cost Variance',
      { f: 'IF(\'Executive Summary\'!D8>=0,\'Executive Summary\'!D8,"")' },
      { f: 'IF(\'Executive Summary\'!D8<0,ABS(\'Executive Summary\'!D8),"")' },
      { f: '\'Executive Summary\'!D8' }
    ],
    
    ['Labor Cost Variance',
      { f: 'IF(\'Executive Summary\'!D9>=0,\'Executive Summary\'!D9,"")' },
      { f: 'IF(\'Executive Summary\'!D9<0,ABS(\'Executive Summary\'!D9),"")' },
      { f: '\'Executive Summary\'!D9' }
    ],
    
    ['Overhead Variance',
      { f: 'IF(\'Executive Summary\'!D10>=0,\'Executive Summary\'!D10,"")' },
      { f: 'IF(\'Executive Summary\'!D10<0,ABS(\'Executive Summary\'!D10),"")' },
      { f: '\'Executive Summary\'!D10' }
    ],
    
    ['', '', '', ''],
    ['TOTALS', { f: 'SUM(B5:B8)' }, { f: 'SUM(C5:C8)' }, { f: 'B10-C10' }],
    ['', '', '', ''],
    
    ['Overall Profit Variance', '', '', { f: '\'Executive Summary\'!D11' }],
    ['Status', '', '', { f: 'IF(D13>=0,"✓ Favorable","⚠ Unfavorable")' }],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 25 },
    { wch: 22 },
    { wch: 24 },
    { wch: 15 },
  ];

  return ws;
}

/**
 * Creates historical trends sheet with formulas
 */
function createHistoricalTrends(historicalData: PLData[]): XLSX.WorkSheet {
  const headers = [
    ['HISTORICAL P&L TRENDS', '', '', '', '', '', '', ''],
    ['Viking Consulting Group - Trend Analysis', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Period', 'Revenue', 'Food Cost', 'Food Cost %', 'Labor Cost', 'Labor Cost %', 'Overhead', 'Net Profit', 'Profit Margin %'],
  ];

  const rows = historicalData.map((pl, index) => {
    const rowNum = index + 5; // Starting row for data
    return [
      `${pl.month} ${pl.year}`,
      pl.actuals.actualRevenue,
      pl.actuals.actualFoodCost,
      { f: `IF(B${rowNum}=0,0,(C${rowNum}/B${rowNum})*100)` }, // Food cost % formula
      pl.actuals.actualLaborCost,
      { f: `IF(B${rowNum}=0,0,(E${rowNum}/B${rowNum})*100)` }, // Labor cost % formula
      pl.actuals.actualOverhead,
      { f: `B${rowNum}-C${rowNum}-E${rowNum}-G${rowNum}` }, // Net profit formula
      { f: `IF(B${rowNum}=0,0,(H${rowNum}/B${rowNum})*100)` }, // Profit margin % formula
    ];
  });

  const data = [...headers, ...rows];

  // Add summary row with formulas
  const lastRow = rows.length + 5;
  data.push(
    ['', '', '', '', '', '', '', '', ''],
    ['AVERAGES', 
      { f: `AVERAGE(B5:B${lastRow - 1})` },
      { f: `AVERAGE(C5:C${lastRow - 1})` },
      { f: `AVERAGE(D5:D${lastRow - 1})` },
      { f: `AVERAGE(E5:E${lastRow - 1})` },
      { f: `AVERAGE(F5:F${lastRow - 1})` },
      { f: `AVERAGE(G5:G${lastRow - 1})` },
      { f: `AVERAGE(H5:H${lastRow - 1})` },
      { f: `AVERAGE(I5:I${lastRow - 1})` },
    ]
  );

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
  ];

  return ws;
}
