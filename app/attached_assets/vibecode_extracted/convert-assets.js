const sharp = require('sharp');
const fs = require('fs');

// Create a simple app icon as a buffer (since we can't easily convert SVG with sharp in this environment)
// Let's create a programmatic PNG instead

async function createAppIcon(size) {
  // Create a simple gradient background with chart elements
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2563EB"/>
          <stop offset="100%" style="stop-color:#1D4ED8"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
      <rect x="${size * 0.15}" y="${size * 0.4}" width="${size * 0.7}" height="${size * 0.4}" rx="${size * 0.05}" fill="white" opacity="0.2"/>
      <circle cx="${size * 0.5}" cy="${size * 0.25}" r="${size * 0.08}" fill="white"/>
      <rect x="${size * 0.25}" y="${size * 0.5}" width="${size * 0.08}" height="${size * 0.25}" rx="${size * 0.02}" fill="#10B981"/>
      <rect x="${size * 0.4}" y="${size * 0.45}" width="${size * 0.08}" height="${size * 0.3}" rx="${size * 0.02}" fill="#10B981"/>
      <rect x="${size * 0.55}" y="${size * 0.4}" width="${size * 0.08}" height="${size * 0.35}" rx="${size * 0.02}" fill="#10B981"/>
      <text x="${size * 0.5}" y="${size * 0.9}" text-anchor="middle" font-family="Arial" font-size="${size * 0.12}" font-weight="bold" fill="white">$</text>
    </svg>
  `;
  
  return Buffer.from(svg);
}

async function createSplashScreen() {
  const svg = `
    <svg width="1170" height="2532" viewBox="0 0 1170 2532" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="splash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2563EB"/>
          <stop offset="100%" style="stop-color:#1D4ED8"/>
        </linearGradient>
      </defs>
      <rect width="1170" height="2532" fill="url(#splash)"/>
      <circle cx="585" cy="1100" r="120" fill="white" opacity="0.9"/>
      <rect x="465" y="1200" width="240" height="160" rx="20" fill="white" opacity="0.2"/>
      <rect x="500" y="1240" width="30" height="80" rx="8" fill="#10B981"/>
      <rect x="545" y="1220" width="30" height="100" rx="8" fill="#10B981"/>
      <rect x="590" y="1200" width="30" height="120" rx="8" fill="#10B981"/>
      <rect x="635" y="1210" width="30" height="110" rx="8" fill="#10B981"/>
      <text x="585" y="1500" text-anchor="middle" font-family="Arial" font-size="42" font-weight="bold" fill="white">Restaurant P&L Manager</text>
      <text x="585" y="1560" text-anchor="middle" font-family="Arial" font-size="28" fill="white" opacity="0.9">Profit & Loss Made Simple</text>
    </svg>
  `;
  
  return Buffer.from(svg);
}

async function convertAssets() {
  const iconSizes = [1024, 180, 167, 152, 120, 76, 40, 29, 20];
  
  try {
    // Create app icons
    for (const size of iconSizes) {
      const svgBuffer = await createAppIcon(size);
      await sharp(svgBuffer)
        .png()
        .toFile(`./assets/images/icon-${size}.png`);
      console.log(`Created icon-${size}.png`);
    }
    
    // Create splash screen
    const splashBuffer = await createSplashScreen();
    await sharp(splashBuffer)
      .png() 
      .toFile('./assets/images/splash.png');
    console.log('Created splash.png');
    
    // Create a simple favicon
    const iconBuffer = await createAppIcon(32);
    await sharp(iconBuffer)
      .png()
      .toFile('./assets/images/favicon.png');
    console.log('Created favicon.png');
    
    console.log('\n✅ All PNG assets created successfully!');
    
  } catch (error) {
    console.error('Error creating assets:', error);
    
    // Fallback: Create simple colored squares if sharp fails
    console.log('Creating fallback assets...');
    
    for (const size of iconSizes) {
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 37, g: 99, b: 235, alpha: 1 }
        }
      })
      .png()
      .toFile(`./assets/images/icon-${size}.png`);
    }
    
    await sharp({
      create: {
        width: 1170,
        height: 2532,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 }
      }
    })
    .png()
    .toFile('./assets/images/splash.png');
    
    console.log('✅ Fallback assets created!');
  }
}

convertAssets();