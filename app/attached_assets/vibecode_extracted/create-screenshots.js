const sharp = require('sharp');

// iPhone 14 Pro Max dimensions: 1290x2796
async function createScreenshot(title, content, filename) {
  const svg = `
    <svg width="1290" height="2796" viewBox="0 0 1290 2796" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="1290" height="2796" fill="#F9FAFB"/>
      
      <!-- Status bar -->
      <rect x="0" y="0" width="1290" height="150" fill="#000000"/>
      <text x="100" y="90" font-family="Arial" font-size="42" font-weight="bold" fill="#ffffff">9:41</text>
      <text x="1100" y="90" font-family="Arial" font-size="36" fill="#ffffff">100%</text>
      <rect x="1150" y="65" width="80" height="40" rx="20" fill="#34D399"/>
      
      <!-- Header -->
      <rect x="0" y="150" width="1290" height="200" fill="#2563EB"/>
      <text x="645" y="280" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#ffffff">${title}</text>
      
      <!-- Content area -->
      <g transform="translate(60, 400)">
        ${content}
      </g>
      
      <!-- Bottom navigation indicator -->
      <rect x="500" y="2650" width="290" height="80" rx="40" fill="#E5E7EB"/>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(`./assets/images/${filename}`);
  
  console.log(`Created ${filename}`);
}

async function createScreenshots() {
  // Screenshot 1: P&L Dashboard
  const dashboardContent = `
    <!-- Dashboard cards -->
    <rect x="0" y="0" width="550" height="300" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="50" font-family="Arial" font-size="32" font-weight="600" fill="#374151">Revenue Target</text>
    <text x="30" y="150" font-family="Arial" font-size="72" font-weight="bold" fill="#2563EB">$25,000</text>
    <text x="30" y="200" font-family="Arial" font-size="28" fill="#10B981">↗ On track</text>
    
    <rect x="620" y="0" width="550" height="300" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="650" y="50" font-family="Arial" font-size="32" font-weight="600" fill="#374151">Actual Profit</text>
    <text x="650" y="150" font-family="Arial" font-size="72" font-weight="bold" fill="#10B981">$6,250</text>
    <text x="650" y="200" font-family="Arial" font-size="28" fill="#10B981">25% margin</text>
    
    <!-- Chart area -->
    <rect x="0" y="350" width="1170" height="400" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="400" font-family="Arial" font-size="36" font-weight="600" fill="#374151">Monthly Performance</text>
    
    <!-- Simple chart bars -->
    <rect x="150" y="550" width="80" height="150" rx="10" fill="#10B981"/>
    <rect x="280" y="500" width="80" height="200" rx="10" fill="#10B981"/>
    <rect x="410" y="450" width="80" height="250" rx="10" fill="#10B981"/>
    <rect x="540" y="480" width="80" height="220" rx="10" fill="#F59E0B"/>
    <rect x="670" y="430" width="80" height="270" rx="10" fill="#10B981"/>
    
    <!-- Action buttons -->
    <rect x="0" y="800" width="360" height="120" rx="60" fill="#2563EB"/>
    <text x="180" y="880" text-anchor="middle" font-family="Arial" font-size="36" font-weight="bold" fill="#ffffff">Edit Targets</text>
    
    <rect x="410" y="800" width="360" height="120" rx="60" fill="#10B981"/>
    <text x="590" y="880" text-anchor="middle" font-family="Arial" font-size="36" font-weight="bold" fill="#ffffff">Inventory</text>
    
    <rect x="810" y="800" width="360" height="120" rx="60" fill="#7C3AED"/>
    <text x="990" y="880" text-anchor="middle" font-family="Arial" font-size="36" font-weight="bold" fill="#ffffff">Analytics</text>
  `;
  
  // Screenshot 2: Inventory Management
  const inventoryContent = `
    <!-- Inventory overview cards -->
    <rect x="0" y="0" width="550" height="200" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="50" font-family="Arial" font-size="28" font-weight="600" fill="#374151">Total Inventory</text>
    <text x="30" y="120" font-family="Arial" font-size="48" font-weight="bold" fill="#2563EB">$3,450</text>
    <text x="30" y="160" font-family="Arial" font-size="24" fill="#6B7280">13.8% of revenue</text>
    
    <rect x="620" y="0" width="550" height="200" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="650" y="50" font-family="Arial" font-size="28" font-weight="600" fill="#374151">Items Below Par</text>
    <text x="650" y="120" font-family="Arial" font-size="48" font-weight="bold" fill="#F59E0B">3</text>
    <text x="650" y="160" font-family="Arial" font-size="24" fill="#D97706">Need attention</text>
    
    <!-- Inventory items list -->
    <rect x="0" y="250" width="1170" height="150" rx="15" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="290" font-family="Arial" font-size="32" font-weight="600" fill="#374151">Chicken Breast</text>
    <text x="30" y="330" font-family="Arial" font-size="24" fill="#6B7280">Protein • Freezer</text>
    <text x="900" y="290" font-family="Arial" font-size="36" font-weight="bold" fill="#F59E0B">25 lbs</text>
    <text x="900" y="330" font-family="Arial" font-size="24" fill="#6B7280">Below par (75)</text>
    <rect x="30" y="350" width="400" height="8" rx="4" fill="#E5E7EB"/>
    <rect x="30" y="350" width="133" height="8" rx="4" fill="#F59E0B"/>
    
    <rect x="0" y="430" width="1170" height="150" rx="15" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="470" font-family="Arial" font-size="32" font-weight="600" fill="#374151">Lettuce</text>
    <text x="30" y="510" font-family="Arial" font-size="24" fill="#6B7280">Vegetables • Walk-in Cooler</text>
    <text x="900" y="470" font-family="Arial" font-size="36" font-weight="bold" fill="#DC2626">8 heads</text>
    <text x="900" y="510" font-family="Arial" font-size="24" fill="#6B7280">Critical (35 par)</text>
    <rect x="30" y="530" width="400" height="8" rx="4" fill="#E5E7EB"/>
    <rect x="30" y="530" width="91" height="8" rx="4" fill="#DC2626"/>
    
    <rect x="0" y="610" width="1170" height="150" rx="15" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="650" font-family="Arial" font-size="32" font-weight="600" fill="#374151">Rice</text>
    <text x="30" y="690" font-family="Arial" font-size="24" fill="#6B7280">Grains • Dry Storage</text>
    <text x="900" y="650" font-family="Arial" font-size="36" font-weight="bold" fill="#10B981">45 lbs</text>
    <text x="900" y="690" font-family="Arial" font-size="24" fill="#6B7280">Optimal (75 par)</text>
    <rect x="30" y="710" width="400" height="8" rx="4" fill="#E5E7EB"/>
    <rect x="30" y="710" width="240" height="8" rx="4" fill="#10B981"/>
  `;
  
  // Screenshot 3: Analytics
  const analyticsContent = `
    <!-- Period selector -->
    <rect x="0" y="0" width="1170" height="100" rx="50" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <rect x="20" y="20" width="360" height="60" rx="30" fill="#2563EB"/>
    <text x="200" y="65" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold" fill="#ffffff">6 Months</text>
    <text x="590" y="65" text-anchor="middle" font-family="Arial" font-size="32" font-weight="600" fill="#6B7280">12 Months</text>
    <text x="980" y="65" text-anchor="middle" font-family="Arial" font-size="32" font-weight="600" fill="#6B7280">All Time</text>
    
    <!-- Trend cards -->
    <rect x="0" y="150" width="550" height="200" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="200" font-family="Arial" font-size="28" font-weight="600" fill="#374151">Avg Revenue</text>
    <text x="30" y="270" font-family="Arial" font-size="48" font-weight="bold" fill="#2563EB">$24,800</text>
    <text x="30" y="310" font-family="Arial" font-size="24" fill="#10B981">↗ +8.2%</text>
    
    <rect x="620" y="150" width="550" height="200" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="650" y="200" font-family="Arial" font-size="28" font-weight="600" fill="#374151">Avg Profit Margin</text>
    <text x="650" y="270" font-family="Arial" font-size="48" font-weight="bold" fill="#10B981">23.4%</text>
    <text x="650" y="310" font-family="Arial" font-size="24" fill="#10B981">↗ +2.1%</text>
    
    <!-- Chart -->
    <rect x="0" y="400" width="1170" height="300" rx="20" fill="#ffffff" stroke="#E5E7EB" stroke-width="2"/>
    <text x="30" y="450" font-family="Arial" font-size="36" font-weight="600" fill="#374151">6-Month Performance</text>
    
    <!-- Line chart representation -->
    <polyline points="100,600 250,580 400,550 550,570 700,520 850,510" stroke="#10B981" stroke-width="6" fill="none"/>
    <polyline points="100,650 250,640 400,620 550,630 700,600 850,590" stroke="#2563EB" stroke-width="6" fill="none"/>
    
    <!-- Legend -->
    <rect x="30" y="720" width="30" height="6" fill="#10B981"/>
    <text x="80" y="735" font-family="Arial" font-size="24" fill="#374151">Profit</text>
    <rect x="200" y="720" width="30" height="6" fill="#2563EB"/>
    <text x="250" y="735" font-family="Arial" font-size="24" fill="#374151">Revenue</text>
    
    <!-- Best month highlight -->
    <rect x="0" y="780" width="1170" height="120" rx="15" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-width="2"/>
    <text x="30" y="820" font-family="Arial" font-size="28" font-weight="600" fill="#065F46">🏆 Best Month: March 2025</text>
    <text x="30" y="860" font-family="Arial" font-size="24" fill="#047857">$7,200 profit (28.8% margin)</text>
  `;
  
  await createScreenshot('P&L Dashboard', dashboardContent, 'screenshot-1-dashboard.png');
  await createScreenshot('Inventory Management', inventoryContent, 'screenshot-2-inventory.png');
  await createScreenshot('Analytics & Insights', analyticsContent, 'screenshot-3-analytics.png');
  
  console.log('\n✅ All screenshots created successfully!');
}

createScreenshots();