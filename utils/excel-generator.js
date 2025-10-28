const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

class RestaurantPLGenerator {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  async generatePLSpreadsheet(financialGoals, aiConsultation) {
    console.log('🧠 Generating AI-Powered P&L Spreadsheet...');
    
    // Create Monthly P&L Sheet
    const monthlySheet = this.workbook.addWorksheet('Monthly P&L', {
      properties: { tabColor: { argb: 'FF2E7D32' } }
    });

    // Set up Monthly P&L structure
    this.setupMonthlyPL(monthlySheet, financialGoals);
    
    // Create Quarterly Summary Sheet
    const quarterlySheet = this.workbook.addWorksheet('Quarterly Summary', {
      properties: { tabColor: { argb: 'FF1976D2' } }
    });
    
    this.setupQuarterlySummary(quarterlySheet, financialGoals);

    // Create Annual View Sheet
    const annualSheet = this.workbook.addWorksheet('Annual View', {
      properties: { tabColor: { argb: 'FFF57C00' } }
    });
    
    this.setupAnnualView(annualSheet, financialGoals);

    // Create Variance Analysis Sheet
    const varianceSheet = this.workbook.addWorksheet('Variance Analysis', {
      properties: { tabColor: { argb: 'FFD32F2F' } }
    });
    
    this.setupVarianceAnalysis(varianceSheet, financialGoals);

    // Generate file
    const filename = `${financialGoals.restaurantName.replace(/[^a-z0-9]/gi, '_')}_PL_${new Date().getTime()}.xlsx`;
    const filePath = path.join(__dirname, '..', 'generated-spreadsheets', filename);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write Excel file
    await this.workbook.xlsx.writeFile(filePath);
    
    console.log(`✅ P&L Spreadsheet generated: ${filename}`);
    
    return {
      filename,
      filePath,
      downloadPath: `/download/${filename}`,
      sheets: ['Monthly P&L', 'Quarterly Summary', 'Annual View', 'Variance Analysis']
    };
  }

  setupMonthlyPL(sheet, goals) {
    // Header styling
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `${goals.restaurantName} - Monthly P&L Statement`;
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E7D32' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Column headers
    sheet.getCell('A3').value = 'Category';
    sheet.getCell('B3').value = 'Amount ($)';
    sheet.getCell('C3').value = '% of Sales';
    sheet.getCell('D3').value = 'Budget ($)';
    sheet.getCell('E3').value = 'Budget %';
    sheet.getCell('F3').value = 'Variance';
    
    // Style headers
    const headerRow = sheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };

    // Revenue Section
    let row = 5;
    sheet.getCell(`A${row}`).value = 'REVENUE';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    
    row++;
    sheet.getCell(`A${row}`).value = 'Monthly Sales';
    sheet.getCell(`B${row}`).value = { formula: 'B7' }; // User input cell
    sheet.getCell(`C${row}`).value = { formula: 'B6/B6*100' }; // Always 100%
    sheet.getCell(`D${row}`).value = goals.salesGoal / 12; // Monthly goal
    sheet.getCell(`E${row}`).value = 100;
    sheet.getCell(`F${row}`).value = { formula: 'B6-D6' };

    // Make B7 the main input cell (highlighted)
    row++;
    sheet.getCell(`A${row}`).value = '→ Enter Monthly Sales:';
    sheet.getCell(`B${row}`).value = 0; // User will input here
    sheet.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
    sheet.getCell(`B${row}`).border = {
      top: { style: 'thick' }, bottom: { style: 'thick' },
      left: { style: 'thick' }, right: { style: 'thick' }
    };

    // COGS Section
    row += 2;
    sheet.getCell(`A${row}`).value = 'COST OF GOODS SOLD';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    
    row++;
    sheet.getCell(`A${row}`).value = 'Food Costs';
    sheet.getCell(`B${row}`).value = { formula: `B7*${goals.foodCostPercentage/100}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };
    sheet.getCell(`D${row}`).value = { formula: `D6*${goals.foodCostPercentage/100}` };
    sheet.getCell(`E${row}`).value = goals.foodCostPercentage;
    sheet.getCell(`F${row}`).value = { formula: `B${row}-D${row}` };

    row++;
    sheet.getCell(`A${row}`).value = 'Labor Costs';
    sheet.getCell(`B${row}`).value = { formula: `B7*${goals.laborCostPercentage/100}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };
    sheet.getCell(`D${row}`).value = { formula: `D6*${goals.laborCostPercentage/100}` };
    sheet.getCell(`E${row}`).value = goals.laborCostPercentage;
    sheet.getCell(`F${row}`).value = { formula: `B${row}-D${row}` };

    row++;
    sheet.getCell(`A${row}`).value = 'Supply Costs';
    sheet.getCell(`B${row}`).value = { formula: `B7*${(goals.supplyCostPercentage || 3)/100}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };
    sheet.getCell(`D${row}`).value = { formula: `D6*${(goals.supplyCostPercentage || 3)/100}` };
    sheet.getCell(`E${row}`).value = goals.supplyCostPercentage || 3;
    sheet.getCell(`F${row}`).value = { formula: `B${row}-D${row}` };

    // Operating Expenses
    row += 2;
    sheet.getCell(`A${row}`).value = 'OPERATING EXPENSES';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    
    row++;
    sheet.getCell(`A${row}`).value = 'Rent';
    sheet.getCell(`B${row}`).value = { formula: `B7*${(goals.rentPercentage || 8)/100}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };
    
    row++;
    sheet.getCell(`A${row}`).value = 'Utilities';
    sheet.getCell(`B${row}`).value = { formula: `B7*${(goals.utilitiesPercentage || 4)/100}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };

    row++;
    sheet.getCell(`A${row}`).value = 'Marketing';
    sheet.getCell(`B${row}`).value = { formula: `B7*${(goals.marketingPercentage || 3)/100}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };

    // Key Calculations
    row += 2;
    sheet.getCell(`A${row}`).value = 'PRIME COST';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFD32F2F' } };
    sheet.getCell(`B${row}`).value = { formula: 'B10+B11' }; // Food + Labor
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };
    sheet.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } };

    row++;
    sheet.getCell(`A${row}`).value = 'TOTAL EXPENSES';
    sheet.getCell(`B${row}`).value = { formula: 'SUM(B10:B16)' };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };

    row++;
    sheet.getCell(`A${row}`).value = 'NET PROFIT';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF2E7D32' } };
    sheet.getCell(`B${row}`).value = { formula: `B7-B${row-1}` };
    sheet.getCell(`C${row}`).value = { formula: `B${row}/B7*100` };
    sheet.getCell(`D${row}`).value = { formula: `D6*${goals.targetProfitPercentage/100}` };
    sheet.getCell(`E${row}`).value = goals.targetProfitPercentage;
    sheet.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };

    // Format currency columns
    const currencyFormat = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)';
    const percentFormat = '0.0%';
    
    ['B', 'D', 'F'].forEach(col => {
      for (let i = 6; i <= row; i++) {
        sheet.getCell(`${col}${i}`).numFmt = currencyFormat;
      }
    });

    ['C', 'E'].forEach(col => {
      for (let i = 6; i <= row; i++) {
        sheet.getCell(`${col}${i}`).numFmt = percentFormat;
      }
    });

    // Set column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 12;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 12;
    sheet.getColumn('F').width = 15;

    // Protect formulas but allow data entry
    sheet.protect('odins-almanac', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      deleteColumns: false,
      deleteRows: false
    });

    // Unlock the input cell
    sheet.getCell('B7').protection = { locked: false };
  }

  setupQuarterlySummary(sheet, goals) {
    sheet.getCell('A1').value = `${goals.restaurantName} - Quarterly Summary`;
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF1976D2' } };
    
    // Quarterly calculations linking to monthly sheet
    sheet.getCell('A3').value = 'Q1 Revenue';
    sheet.getCell('B3').value = { formula: "'Monthly P&L'!B7*3" };
    
    sheet.getCell('A4').value = 'Q1 Profit';
    sheet.getCell('B4').value = { formula: "'Monthly P&L'!B20*3" };
    
    sheet.getCell('A5').value = 'Q1 Profit Margin';
    sheet.getCell('B5').value = { formula: "B4/B3*100" };
  }

  setupAnnualView(sheet, goals) {
    sheet.getCell('A1').value = `${goals.restaurantName} - Annual Projections`;
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFF57C00' } };
    
    // Annual calculations
    sheet.getCell('A3').value = 'Annual Revenue Goal';
    sheet.getCell('B3').value = goals.salesGoal;
    
    sheet.getCell('A4').value = 'Projected Annual Revenue';
    sheet.getCell('B4').value = { formula: "'Monthly P&L'!B7*12" };
    
    sheet.getCell('A5').value = 'Annual Profit Target';
    sheet.getCell('B5').value = { formula: `B3*${goals.targetProfitPercentage/100}` };
    
    sheet.getCell('A6').value = 'Projected Annual Profit';
    sheet.getCell('B6').value = { formula: "'Monthly P&L'!B20*12" };
  }

  setupVarianceAnalysis(sheet, goals) {
    sheet.getCell('A1').value = `${goals.restaurantName} - Variance Analysis`;
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFD32F2F' } };
    
    // Variance calculations
    sheet.getCell('A3').value = 'Revenue Variance';
    sheet.getCell('B3').value = { formula: "'Monthly P&L'!F6" };
    
    sheet.getCell('A4').value = 'Food Cost Variance';
    sheet.getCell('B4').value = { formula: "'Monthly P&L'!F10" };
    
    sheet.getCell('A5').value = 'Labor Cost Variance';
    sheet.getCell('B5').value = { formula: "'Monthly P&L'!F11" };
  }
}

module.exports = { RestaurantPLGenerator };