const fetch = require('node-fetch');

async function testSpreadsheetGeneration() {
  console.log('🧪 Testing AI-Powered Spreadsheet Generation...');
  
  const testGoals = {
    restaurantName: "Vikings Feast",
    restaurantType: "casual-dining", 
    salesGoal: 1200000,
    foodCostPercentage: 28,
    laborCostPercentage: 30,
    targetProfitPercentage: 15,
    supplyCostPercentage: 3,
    rentPercentage: 8,
    utilitiesPercentage: 4,
    marketingPercentage: 2,
    previousYearSales: 1000000
  };

  try {
    const response = await fetch('http://localhost:3001/api/ai/generate-spreadsheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goals: testGoals,
        query: 'Generate comprehensive P&L spreadsheet with formulas'
      })
    });

    const data = await response.json();
    
    console.log('✅ Spreadsheet Generation Result:');
    console.log('📊 Success:', data.success);
    console.log('🏛️ Restaurant:', data.restaurantInfo?.name);
    console.log('📈 Sales Goal:', data.restaurantInfo?.salesGoal?.toLocaleString());
    
    if (data.excelFile) {
      console.log('📁 Excel File Generated:');
      console.log('  - Filename:', data.excelFile.filename);
      console.log('  - Download URL:', data.excelFile.downloadPath);
      console.log('  - Sheets:', data.excelFile.sheets?.join(', '));
    }
    
    if (data.formulas) {
      console.log('🧮 Key Formulas:');
      console.log('  - Monthly Revenue:', data.formulas.monthlyRevenue);
      console.log('  - Food Cost:', data.formulas.foodCostDollar);
      console.log('  - Labor Cost:', data.formulas.laborCostDollar);
      console.log('  - Net Profit:', data.formulas.netProfit);
    }
    
    console.log('🧠 AI Consultation:', data.consultation?.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpreadsheetGeneration();