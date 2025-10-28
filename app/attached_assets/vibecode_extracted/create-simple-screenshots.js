const sharp = require('sharp');

async function createSimpleScreenshots() {
  // Create simple mockup screenshots using solid colors and shapes
  
  // Screenshot 1: Dashboard mockup
  await sharp({
    create: {
      width: 1290,
      height: 2796,
      channels: 4,
      background: { r: 249, g: 250, b: 251, alpha: 1 }
    }
  })
  .composite([
    // Header
    { 
      input: Buffer.from(`<svg width="1290" height="200"><rect width="1290" height="200" fill="#2563EB"/><text x="645" y="120" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#ffffff">P&amp;L Dashboard</text></svg>`),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toFile('./assets/images/screenshot-1-dashboard.png');
  
  // Screenshot 2: Inventory mockup  
  await sharp({
    create: {
      width: 1290,
      height: 2796,
      channels: 4,
      background: { r: 249, g: 250, b: 251, alpha: 1 }
    }
  })
  .composite([
    // Header
    { 
      input: Buffer.from(`<svg width="1290" height="200"><rect width="1290" height="200" fill="#10B981"/><text x="645" y="120" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#ffffff">Inventory Management</text></svg>`),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toFile('./assets/images/screenshot-2-inventory.png');
  
  // Screenshot 3: Analytics mockup
  await sharp({
    create: {
      width: 1290,
      height: 2796,
      channels: 4,
      background: { r: 249, g: 250, b: 251, alpha: 1 }
    }
  })
  .composite([
    // Header
    { 
      input: Buffer.from(`<svg width="1290" height="200"><rect width="1290" height="200" fill="#7C3AED"/><text x="645" y="120" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#ffffff">Analytics &amp; Insights</text></svg>`),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toFile('./assets/images/screenshot-3-analytics.png');
  
  console.log('✅ Simple screenshots created successfully!');
}

createSimpleScreenshots().catch(console.error);