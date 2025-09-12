// Run: node install-network.js
const { execSync } = require('child_process');

try {
  console.log('Installing @react-native-community/netinfo...');
  execSync('npm install @react-native-community/netinfo', { stdio: 'inherit' });
  
  console.log('\nFor iOS, run:');
  console.log('cd ios && pod install');
  
  console.log('\nPackage installed successfully!');
} catch (error) {
  console.error('Installation failed:', error.message);
}