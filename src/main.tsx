import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ContentProvider } from "./contexts/ContentContext";
import { analytics } from "./services/analytics";
import { memoryManagementService } from "./services/memoryManagementService";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

// Initialize memory management service early
memoryManagementService.initialize();

// Global error handlers to prevent crashes
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Perform cleanup if error seems memory-related
  if (event.error?.message?.includes('memory') || event.error?.message?.includes('heap')) {
    console.warn('Memory-related error detected, performing cleanup');
    memoryManagementService.performEmergencyCleanup();
  }
  
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Perform cleanup if rejection seems memory-related
  if (event.reason?.message?.includes('memory') || event.reason?.message?.includes('heap')) {
    console.warn('Memory-related rejection detected, performing cleanup');
    memoryManagementService.performEmergencyCleanup();
  }
  
  event.preventDefault();
});

// Clear any existing service workers and caches immediately
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

// Initialize analytics
analytics.initialize();

// Initialize Convex client with error handling and debugging
const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://intent-ibis-667.convex.cloud';
console.log('🔗 Convex URL being used:', convexUrl);
console.log('🌍 Environment variables:', {
  VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

let convex;
try {
  convex = new ConvexReactClient(convexUrl);
  console.log('✅ Convex client initialized successfully with URL:', convexUrl);
} catch (error) {
  console.error('❌ Failed to initialize Convex client:', error);
  // Use the working development URL as fallback
  convex = new ConvexReactClient('https://intent-ibis-667.convex.cloud');
  console.log('🔄 Using working development Convex deployment: https://intent-ibis-667.convex.cloud');
}

// Error Boundary Component with proper TypeScript types
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1>PlayGram</h1>
          <p>Loading...</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <ConvexAuthProvider client={convex}>
          <ContentProvider>
            <App />
          </ContentProvider>
        </ConvexAuthProvider>
      </ConvexProvider>
    </ErrorBoundary>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback rendering
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; text-align: center; background-color: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1>PlayGram</h1>
      <p>Loading...</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Reload App</button>
    </div>
  `;
}
