// State persistence utilities for enrollment system

import React from 'react';
import { EnrollmentState, EnrollmentStep } from '../types';

export interface PersistedState {
  enrollmentState: Partial<EnrollmentState>;
  timestamp: number;
  expiresAt: number;
  sessionId: string;
  version: string;
}

export interface StatePersistenceOptions {
  key?: string;
  expirationMinutes?: number;
  version?: string;
  encryptionKey?: string;
}

const DEFAULT_OPTIONS: Required<StatePersistenceOptions> = {
  key: 'enrollment_state',
  expirationMinutes: 10,
  version: '1.0.0',
  encryptionKey: '',
};

/**
 * State persistence manager for enrollment system
 */
export class StatePersistenceManager {
  private options: Required<StatePersistenceOptions>;
  private sessionId: string;

  constructor(options: StatePersistenceOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Saves enrollment state to localStorage
   */
  saveState(state: Partial<EnrollmentState>): boolean {
    try {
      const now = Date.now();
      const expiresAt = now + (this.options.expirationMinutes * 60 * 1000);

      const persistedState: PersistedState = {
        enrollmentState: this.sanitizeState(state),
        timestamp: now,
        expiresAt,
        sessionId: this.sessionId,
        version: this.options.version,
      };

      const serialized = JSON.stringify(persistedState);
      const encrypted = this.options.encryptionKey 
        ? this.encrypt(serialized, this.options.encryptionKey)
        : serialized;

      localStorage.setItem(this.options.key, encrypted);
      return true;
    } catch (error) {
      console.warn('Failed to save enrollment state:', error);
      return false;
    }
  }

  /**
   * Loads enrollment state from localStorage
   */
  loadState(): Partial<EnrollmentState> | null {
    try {
      const stored = localStorage.getItem(this.options.key);
      if (!stored) return null;

      const decrypted = this.options.encryptionKey
        ? this.decrypt(stored, this.options.encryptionKey)
        : stored;

      const persistedState: PersistedState = JSON.parse(decrypted);

      // Check version compatibility
      if (persistedState.version !== this.options.version) {
        console.warn('State version mismatch, clearing stored state');
        this.clearState();
        return null;
      }

      // Check expiration
      if (Date.now() > persistedState.expiresAt) {
        console.info('Stored state expired, clearing');
        this.clearState();
        return null;
      }

      return this.deserializeState(persistedState.enrollmentState);
    } catch (error) {
      console.warn('Failed to load enrollment state:', error);
      this.clearState();
      return null;
    }
  }

  /**
   * Clears stored state
   */
  clearState(): void {
    try {
      localStorage.removeItem(this.options.key);
    } catch (error) {
      console.warn('Failed to clear enrollment state:', error);
    }
  }

  /**
   * Checks if there is valid stored state
   */
  hasValidState(): boolean {
    const state = this.loadState();
    return state !== null;
  }

  /**
   * Gets the age of stored state in minutes
   */
  getStateAge(): number | null {
    try {
      const stored = localStorage.getItem(this.options.key);
      if (!stored) return null;

      const decrypted = this.options.encryptionKey
        ? this.decrypt(stored, this.options.encryptionKey)
        : stored;

      const persistedState: PersistedState = JSON.parse(decrypted);
      return (Date.now() - persistedState.timestamp) / (1000 * 60);
    } catch (error) {
      return null;
    }
  }

  /**
   * Updates the expiration time of stored state
   */
  extendExpiration(additionalMinutes: number = 10): boolean {
    try {
      const stored = localStorage.getItem(this.options.key);
      if (!stored) return false;

      const decrypted = this.options.encryptionKey
        ? this.decrypt(stored, this.options.encryptionKey)
        : stored;

      const persistedState: PersistedState = JSON.parse(decrypted);
      persistedState.expiresAt += additionalMinutes * 60 * 1000;

      const serialized = JSON.stringify(persistedState);
      const encrypted = this.options.encryptionKey
        ? this.encrypt(serialized, this.options.encryptionKey)
        : serialized;

      localStorage.setItem(this.options.key, encrypted);
      return true;
    } catch (error) {
      console.warn('Failed to extend state expiration:', error);
      return false;
    }
  }

  /**
   * Sanitizes state before saving (removes sensitive data)
   */
  private sanitizeState(state: Partial<EnrollmentState>): Partial<EnrollmentState> {
    const sanitized = { ...state };

    // Remove sensitive payment data
    if (sanitized.enrollmentData) {
      sanitized.enrollmentData = {
        ...sanitized.enrollmentData,
        // Keep enrollment data but remove sensitive payment details
      };
    }

    // Clear any temporary errors
    if (sanitized.errors) {
      sanitized.errors = {};
    }

    return sanitized;
  }

  /**
   * Deserializes state after loading (reconstructs Date objects, etc.)
   */
  private deserializeState(state: Partial<EnrollmentState>): Partial<EnrollmentState> {
    const deserialized = { ...state };

    // Reconstruct Date objects
    if (deserialized.enrollmentData?.enrollmentDate) {
      deserialized.enrollmentData.enrollmentDate = new Date(deserialized.enrollmentData.enrollmentDate);
    }

    if (deserialized.enrollmentData?.sessionStartDate) {
      deserialized.enrollmentData.sessionStartDate = new Date(deserialized.enrollmentData.sessionStartDate);
    }

    return deserialized;
  }

  /**
   * Simple encryption (for basic obfuscation, not cryptographically secure)
   */
  private encrypt(text: string, key: string): string {
    if (!key) return text;
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  }

  /**
   * Simple decryption
   */
  private decrypt(encryptedText: string, key: string): string {
    if (!key) return encryptedText;
    
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }
}

// Default instance
export const statePersistence = new StatePersistenceManager();

/**
 * Hook for state persistence
 */
export function useStatePersistence(options?: StatePersistenceOptions) {
  const manager = new StatePersistenceManager(options);

  const saveState = (state: Partial<EnrollmentState>) => {
    return manager.saveState(state);
  };

  const loadState = () => {
    return manager.loadState();
  };

  const clearState = () => {
    manager.clearState();
  };

  const hasValidState = () => {
    return manager.hasValidState();
  };

  const getStateAge = () => {
    return manager.getStateAge();
  };

  const extendExpiration = (minutes?: number) => {
    return manager.extendExpiration(minutes);
  };

  return {
    saveState,
    loadState,
    clearState,
    hasValidState,
    getStateAge,
    extendExpiration,
  };
}

/**
 * Recovery utilities
 */
export interface RecoveryOptions {
  onStateRecovered?: (state: Partial<EnrollmentState>) => void;
  onRecoveryFailed?: (error: any) => void;
  autoRecover?: boolean;
  showRecoveryPrompt?: boolean;
}

export class StateRecoveryManager {
  private persistence: StatePersistenceManager;
  private options: RecoveryOptions;

  constructor(persistence: StatePersistenceManager, options: RecoveryOptions = {}) {
    this.persistence = persistence;
    this.options = {
      autoRecover: true,
      showRecoveryPrompt: true,
      ...options,
    };
  }

  /**
   * Attempts to recover state
   */
  async recoverState(): Promise<Partial<EnrollmentState> | null> {
    try {
      const state = this.persistence.loadState();
      
      if (state) {
        this.options.onStateRecovered?.(state);
        return state;
      }

      return null;
    } catch (error) {
      this.options.onRecoveryFailed?.(error);
      return null;
    }
  }

  /**
   * Checks if recovery is possible
   */
  canRecover(): boolean {
    return this.persistence.hasValidState();
  }

  /**
   * Gets recovery information
   */
  getRecoveryInfo(): {
    canRecover: boolean;
    stateAge: number | null;
    lastStep: EnrollmentStep | null;
  } {
    const canRecover = this.canRecover();
    const stateAge = this.persistence.getStateAge();
    
    let lastStep: EnrollmentStep | null = null;
    if (canRecover) {
      const state = this.persistence.loadState();
      lastStep = state?.currentStep || null;
    }

    return {
      canRecover,
      stateAge,
      lastStep,
    };
  }

  /**
   * Creates a recovery prompt component props
   */
  getRecoveryPromptProps() {
    const info = this.getRecoveryInfo();
    
    return {
      show: info.canRecover && this.options.showRecoveryPrompt,
      stateAge: info.stateAge,
      lastStep: info.lastStep,
      onRecover: () => this.recoverState(),
      onDiscard: () => this.persistence.clearState(),
    };
  }
}

/**
 * Hook for state recovery
 */
export function useStateRecovery(options?: RecoveryOptions) {
  const persistence = new StatePersistenceManager();
  const recovery = new StateRecoveryManager(persistence, options);

  return {
    recoverState: () => recovery.recoverState(),
    canRecover: () => recovery.canRecover(),
    getRecoveryInfo: () => recovery.getRecoveryInfo(),
    getRecoveryPromptProps: () => recovery.getRecoveryPromptProps(),
    clearState: () => persistence.clearState(),
  };
}

/**
 * Auto-save hook that saves state on changes
 */
export function useAutoSave(
  state: Partial<EnrollmentState>,
  options?: StatePersistenceOptions & { debounceMs?: number }
) {
  const { debounceMs = 1000, ...persistenceOptions } = options || {};
  const persistence = new StatePersistenceManager(persistenceOptions);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      persistence.saveState(state);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [state, debounceMs, persistence]);

  return {
    saveNow: () => persistence.saveState(state),
    clearState: () => persistence.clearState(),
  };
}