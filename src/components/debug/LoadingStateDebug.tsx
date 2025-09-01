/**
 * Loading State Debug Component
 * Helps debug loading state issues in the mobile app
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

interface LoadingStateDebugProps {
  isInitializing: boolean;
  appState: string;
  hasCheckedAuth: boolean;
  showLoginModal: boolean;
}

export const LoadingStateDebug: React.FC<LoadingStateDebugProps> = ({
  isInitializing,
  appState,
  hasCheckedAuth,
  showLoginModal
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [debugVisible, setDebugVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  // Monitor state changes
  useEffect(() => {
    addLog(`Auth Loading: ${isLoading}`);
  }, [isLoading]);

  useEffect(() => {
    addLog(`App Initializing: ${isInitializing}`);
  }, [isInitializing]);

  useEffect(() => {
    addLog(`User: ${user ? user.phoneNumber : 'null'}`);
  }, [user]);

  useEffect(() => {
    addLog(`App State: ${appState}`);
  }, [appState]);

  useEffect(() => {
    addLog(`Has Checked Auth: ${hasCheckedAuth}`);
  }, [hasCheckedAuth]);

  useEffect(() => {
    addLog(`Show Login Modal: ${showLoginModal}`);
  }, [showLoginModal]);

  // Show debug panel if loading for more than 5 seconds
  useEffect(() => {
    if (isInitializing || isLoading) {
      const timer = setTimeout(() => {
        setDebugVisible(true);
        addLog('🚨 Debug panel auto-shown due to long loading');
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setDebugVisible(false);
    }
  }, [isInitializing, isLoading]);

  if (!debugVisible && !(isInitializing || isLoading)) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxHeight: '300px',
        overflow: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#ff6b6b' }}>🐛 Loading State Debug</h3>
        <button 
          onClick={() => setDebugVisible(false)}
          style={{
            background: 'transparent',
            border: '1px solid #666',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div>
          <strong>Current State:</strong>
          <div>Auth Loading: <span style={{ color: isLoading ? '#ff6b6b' : '#51cf66' }}>{isLoading.toString()}</span></div>
          <div>App Initializing: <span style={{ color: isInitializing ? '#ff6b6b' : '#51cf66' }}>{isInitializing.toString()}</span></div>
          <div>Is Authenticated: <span style={{ color: isAuthenticated ? '#51cf66' : '#ff6b6b' }}>{isAuthenticated.toString()}</span></div>
        </div>
        <div>
          <strong>App State:</strong>
          <div>App State: <span style={{ color: '#74c0fc' }}>{appState}</span></div>
          <div>Has Checked Auth: <span style={{ color: hasCheckedAuth ? '#51cf66' : '#ff6b6b' }}>{hasCheckedAuth.toString()}</span></div>
          <div>Show Login Modal: <span style={{ color: showLoginModal ? '#ffd43b' : '#51cf66' }}>{showLoginModal.toString()}</span></div>
        </div>
      </div>
      
      <div>
        <strong>User Info:</strong>
        <div>Phone: {user?.phoneNumber || 'null'}</div>
        <div>Name: {user?.name || 'null'}</div>
        <div>Student ID: {user?.studentId || 'null'}</div>
        <div>UID: {user?.uid || 'null'}</div>
      </div>
      
      <div style={{ marginTop: '15px' }}>
        <strong>Recent Logs:</strong>
        <div style={{ maxHeight: '100px', overflow: 'auto', background: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '4px', marginTop: '5px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ fontSize: '11px', marginBottom: '2px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => {
            addLog('🔄 Manual force complete initialization');
            // This would need to be passed as a prop
            console.log('Force completing initialization...');
          }}
          style={{
            background: '#339af0',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Force Complete
        </button>
        <button 
          onClick={() => {
            setLogs([]);
            addLog('🧹 Logs cleared');
          }}
          style={{
            background: '#868e96',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
};

export default LoadingStateDebug;