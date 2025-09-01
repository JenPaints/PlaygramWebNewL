#!/usr/bin/env node

/**
 * Firebase Phone Authentication Setup Checker
 * This script helps verify and guide Firebase phone auth configuration
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('\n📋 Checking Environment Configuration...', 'cyan');
  
  const envPath = path.join(path.dirname(__dirname), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found', 'red');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    
    if (match && match[1].trim()) {
      log(`✅ ${varName}: Set`, 'green');
    } else {
      log(`❌ ${varName}: Missing or empty`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function extractProjectId() {
  const envPath = path.join(path.dirname(__dirname), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^VITE_FIREBASE_PROJECT_ID=(.+)$/m);
  
  return match ? match[1].trim() : null;
}

function checkFirebaseConfig() {
  log('\n🔥 Firebase Configuration Status:', 'cyan');
  
  const projectId = extractProjectId();
  
  if (!projectId) {
    log('❌ Cannot determine Firebase project ID', 'red');
    return;
  }
  
  log(`📱 Project ID: ${projectId}`, 'blue');
  
  // Provide direct links to Firebase Console
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}`;
  const authUrl = `${consoleUrl}/authentication/providers`;
  const settingsUrl = `${consoleUrl}/authentication/settings`;
  
  log('\n🔗 Quick Links:', 'yellow');
  log(`   Firebase Console: ${consoleUrl}`);
  log(`   Authentication Providers: ${authUrl}`);
  log(`   Authentication Settings: ${settingsUrl}`);
}

function printSetupInstructions() {
  log('\n📝 Setup Instructions:', 'magenta');
  
  log('\n1️⃣ Enable Phone Authentication:', 'bright');
  log('   • Go to Firebase Console → Authentication → Sign-in method');
  log('   • Find "Phone" provider and click it');
  log('   • Toggle "Enable" to ON');
  log('   • Click "Save"');
  
  log('\n2️⃣ Configure Authorized Domains:', 'bright');
  log('   • Go to Firebase Console → Authentication → Settings');
  log('   • Scroll to "Authorized domains" section');
  log('   • Add these domains:');
  log('     - localhost');
  log('     - 127.0.0.1');
  log('     - your-production-domain.com');
  
  log('\n3️⃣ Enable Required APIs:', 'bright');
  log('   • Go to Google Cloud Console');
  log('   • Navigate to APIs & Services → Library');
  log('   • Search and enable:');
  log('     - Identity Toolkit API');
  log('     - Firebase Authentication API');
  
  log('\n4️⃣ Test Your Setup:', 'bright');
  log('   • Run: npm run dev');
  log('   • Try phone authentication in the app');
  log('   • Check browser console for detailed logs');
}

function printTestingInfo() {
  log('\n🧪 Testing Information:', 'cyan');
  
  log('\n📱 Development Mode:', 'bright');
  log('   • App automatically detects development environment');
  log('   • Uses mock authentication when Firebase is not configured');
  log('   • Test OTP code: 123456');
  
  log('\n🔍 Debug Commands (in browser console):', 'bright');
  log('   • testFirebaseConfig() - Run configuration test');
  log('   • checkFirebaseStatus() - Show current status');
  
  log('\n📊 Console Messages to Look For:', 'bright');
  log('   ✅ "Firebase initialized successfully" - Real Firebase working');
  log('   🚧 "Firebase not available - using mock OTP" - Mock mode');
  log('   🔄 "Firebase configuration issue detected" - Auto-fallback');
}

function printTroubleshooting() {
  log('\n🔧 Common Issues & Solutions:', 'yellow');
  
  log('\n❌ "auth/invalid-app-credential":', 'bright');
  log('   → Enable Phone Authentication in Firebase Console');
  log('   → Check API key permissions in Google Cloud Console');
  
  log('\n❌ "auth/unauthorized-domain":', 'bright');
  log('   → Add your domain to Authorized domains in Firebase');
  
  log('\n❌ reCAPTCHA issues:', 'bright');
  log('   → Ensure domain is authorized');
  log('   → Try disabling browser extensions');
  log('   → Check for ad blockers');
  
  log('\n❌ SMS not received:', 'bright');
  log('   → Verify phone number format (+country code)');
  log('   → Check Firebase Console for SMS quota');
  log('   → Ensure billing is enabled for production');
}

async function main() {
  log('🚀 Firebase Phone Authentication Setup Checker', 'bright');
  log('=' * 50, 'blue');
  
  // Check environment configuration
  const envOk = checkEnvFile();
  
  // Check Firebase configuration
  checkFirebaseConfig();
  
  // Print setup instructions
  printSetupInstructions();
  
  // Print testing information
  printTestingInfo();
  
  // Print troubleshooting guide
  printTroubleshooting();
  
  log('\n' + '=' * 50, 'blue');
  
  if (envOk) {
    log('✅ Environment configuration looks good!', 'green');
    log('📱 Follow the setup instructions above to enable phone auth', 'cyan');
  } else {
    log('❌ Environment configuration needs attention', 'red');
    log('📝 Please check your .env.local file', 'yellow');
  }
  
  log('\n💡 Need help? Check FIREBASE_PHONE_AUTH_SETUP.md', 'blue');
}

// Run the checker
main().catch(console.error);