#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * Run this to check if your Firebase configuration is ready for Phone Authentication
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Firebase Phone Authentication Setup Checker\n');

// Check if .env.local exists
const envPath = path.join(path.dirname(__dirname), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Required Firebase variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('📋 Checking Firebase Configuration:');
let allPresent = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value.length > 5) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Missing or invalid`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.log('\n❌ Some Firebase configuration variables are missing or invalid.');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

console.log('\n✅ All Firebase configuration variables are present!');

// Validate specific formats
const apiKey = envVars.VITE_FIREBASE_API_KEY;
const authDomain = envVars.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = envVars.VITE_FIREBASE_PROJECT_ID;

console.log('\n🔍 Validating Configuration Format:');

if (apiKey && apiKey.startsWith('AIza')) {
  console.log('✅ API Key format looks correct');
} else {
  console.log('⚠️ API Key should start with "AIza"');
}

if (authDomain && authDomain.includes('.firebaseapp.com')) {
  console.log('✅ Auth Domain format looks correct');
} else {
  console.log('⚠️ Auth Domain should end with ".firebaseapp.com"');
}

if (projectId && !projectId.includes(' ')) {
  console.log('✅ Project ID format looks correct');
} else {
  console.log('⚠️ Project ID should not contain spaces');
}

console.log('\n📱 Next Steps:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log(`2. Select your project: ${projectId}`);
console.log('3. Navigate to Authentication → Sign-in method');
console.log('4. Enable Phone authentication');
console.log('5. Add "localhost" to Authorized domains');
console.log('6. Restart your development server');
console.log('\nFor detailed instructions, see: FIREBASE_PHONE_AUTH_SETUP.md');

console.log('\n🚀 Ready to test Phone Authentication!');