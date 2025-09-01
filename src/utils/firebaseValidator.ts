/**
 * Firebase Configuration Validator
 * Helps diagnose Firebase setup issues
 */

interface FirebaseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFirebaseConfig(): FirebaseValidationResult {
  const result: FirebaseValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check environment variables
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  for (const envVar of requiredEnvVars) {
    const value = import.meta.env[envVar];
    if (!value) {
      result.errors.push(`Missing environment variable: ${envVar}`);
      result.isValid = false;
    } else if (value.length < 10) {
      result.warnings.push(`${envVar} seems too short, please verify it's correct`);
    }
  }

  // Check API key format
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    result.warnings.push('Firebase API key should start with "AIza"');
  }

  // Check auth domain format
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  if (authDomain && !authDomain.includes('.firebaseapp.com')) {
    result.warnings.push('Auth domain should end with ".firebaseapp.com"');
  }

  // Check project ID format
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (projectId && projectId.includes(' ')) {
    result.errors.push('Project ID should not contain spaces');
    result.isValid = false;
  }

  return result;
}

export function logFirebaseValidation(): void {
  const validation = validateFirebaseConfig();
  
  console.group('🔥 Firebase Configuration Validation');
  
  if (validation.isValid) {
    console.log('✅ Configuration appears valid');
  } else {
    console.log('❌ Configuration has errors');
  }

  if (validation.errors.length > 0) {
    console.group('❌ Errors:');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  console.groupEnd();
}