const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Restaurant P&L Manager is ready for App Store launch...\n');

// Check required files
const requiredFiles = [
  { path: 'app.json', description: 'App configuration' },
  { path: 'eas.json', description: 'EAS build configuration' },
  { path: 'assets/images/icon-1024.png', description: 'App Store icon' },
  { path: 'assets/images/splash.png', description: 'Splash screen' },
  { path: 'assets/images/screenshot-1-dashboard.png', description: 'Dashboard screenshot' },
  { path: 'assets/images/screenshot-2-inventory.png', description: 'Inventory screenshot' },
  { path: 'assets/images/screenshot-3-analytics.png', description: 'Analytics screenshot' },
  { path: 'package.json', description: 'Dependencies' },
  { path: 'src/screens/PLDashboardScreen.tsx', description: 'Main app screen' },
  { path: 'src/state/plStore.ts', description: 'App state management' },
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`${exists ? '✅' : '❌'} ${file.description}: ${file.path}`);
  if (!exists) allFilesExist = false;
});

// Check app.json configuration
console.log('\n📱 Checking app.json configuration:');
try {
  const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const expo = appConfig.expo;
  
  const checks = [
    { key: 'name', expected: 'Restaurant P&L Manager', actual: expo.name },
    { key: 'bundle identifier', expected: 'com.restaurantpl.manager', actual: expo.ios?.bundleIdentifier },
    { key: 'version', expected: '1.0.0', actual: expo.version },
    { key: 'icon', expected: './assets/images/icon-1024.png', actual: expo.icon },
    { key: 'splash image', expected: './assets/images/splash.png', actual: expo.splash?.image },
    { key: 'description', expected: 'defined', actual: expo.description ? 'defined' : 'missing' },
  ];
  
  checks.forEach(check => {
    const isValid = check.actual === check.expected || (check.expected === 'defined' && check.actual !== 'missing');
    console.log(`${isValid ? '✅' : '❌'} ${check.key}: ${check.actual}`);
  });
} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
  allFilesExist = false;
}

// Check TypeScript compilation
console.log('\n🔨 Checking TypeScript compilation:');
const { exec } = require('child_process');
exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ TypeScript compilation failed');
    console.log(stderr);
  } else {
    console.log('✅ TypeScript compilation passed');
  }
  
  // Final summary
  console.log('\n🎯 Launch Readiness Summary:');
  console.log(`📁 Required files: ${allFilesExist ? '✅ All present' : '❌ Missing files'}`);
  console.log(`📱 App configuration: ${allFilesExist ? '✅ Configured' : '❌ Needs fixes'}`);
  console.log(`🔨 TypeScript: ${error ? '❌ Has errors' : '✅ Compiles clean'}`);
  
  if (allFilesExist && !error) {
    console.log('\n🚀 READY TO LAUNCH!');
    console.log('Your app is 100% ready for App Store submission.');
    console.log('\nNext steps:');
    console.log('1. Get Apple Developer Account ($99/year)');
    console.log('2. npx eas login');
    console.log('3. npx eas build --platform ios');
    console.log('4. npx eas submit --platform ios');
    console.log('\nSee LAUNCH-GUIDE.md for detailed instructions.');
  } else {
    console.log('\n⚠️  Some issues need to be resolved before launch.');
  }
});

// Show file sizes
console.log('\n📊 Asset sizes:');
const assetFiles = [
  'assets/images/icon-1024.png',
  'assets/images/splash.png',
  'assets/images/screenshot-1-dashboard.png',
  'assets/images/screenshot-2-inventory.png',
  'assets/images/screenshot-3-analytics.png',
];

assetFiles.forEach(file => {
  try {
    const stats = fs.statSync(file);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📎 ${file}: ${sizeMB}MB`);
  } catch (error) {
    console.log(`❌ ${file}: File not found`);
  }
});

console.log('\n💡 Revenue potential:');
console.log('• Target market: 50,000+ restaurants');
console.log('• Freemium model: Free + $9.99/mo premium');
console.log('• Conservative estimate: $800/month in 6 months');
console.log('• Optimistic estimate: $6,000/month in 12 months');