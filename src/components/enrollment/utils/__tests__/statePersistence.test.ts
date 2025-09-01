// Tests for state persistence utilities

import { StatePersistenceManager, StateRecoveryManager } from '../statePersistence';
import { EnrollmentState } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StatePersistenceManager', () => {
  let manager: StatePersistenceManager;
  const mockState: Partial<EnrollmentState> = {
    currentStep: 'pricing',
    userPhone: '+1234567890',
    isAuthenticated: true,
    selectedPlan: {
      id: 'plan-1',
      duration: '12-month',
      price: 1000,
      originalPrice: 1200,
      totalPrice: 1000,
      sessions: 48,
      features: ['Feature 1', 'Feature 2'],
      popular: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new StatePersistenceManager({
      key: 'test_enrollment_state',
      expirationMinutes: 10,
    });
  });

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const result = manager.saveState(mockState);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test_enrollment_state',
        expect.any(String)
      );
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = manager.saveState(mockState);

      expect(result).toBe(false);
    });

    it('should sanitize sensitive data before saving', () => {
      const stateWithSensitiveData = {
        ...mockState,
        errors: { auth: 'Some error' },
      };

      manager.saveState(stateWithSensitiveData);

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      
      expect(parsedData.enrollmentState.errors).toEqual({});
    });
  });

  describe('loadState', () => {
    it('should load valid state from localStorage', () => {
      const now = Date.now();
      const persistedState = {
        enrollmentState: mockState,
        timestamp: now,
        expiresAt: now + (10 * 60 * 1000),
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.loadState();

      expect(result).toEqual(mockState);
    });

    it('should return null for expired state', () => {
      const now = Date.now();
      const persistedState = {
        enrollmentState: mockState,
        timestamp: now - (20 * 60 * 1000),
        expiresAt: now - (10 * 60 * 1000), // Expired
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.loadState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_enrollment_state');
    });

    it('should return null for version mismatch', () => {
      const now = Date.now();
      const persistedState = {
        enrollmentState: mockState,
        timestamp: now,
        expiresAt: now + (10 * 60 * 1000),
        sessionId: 'test-session',
        version: '0.9.0', // Different version
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.loadState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_enrollment_state');
    });

    it('should return null for corrupted data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = manager.loadState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_enrollment_state');
    });

    it('should return null when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = manager.loadState();

      expect(result).toBeNull();
    });

    it('should deserialize Date objects correctly', () => {
      const now = Date.now();
      const stateWithDates = {
        ...mockState,
        enrollmentData: {
          phoneNumber: '+1234567890',
          sport: 'football' as const,
          planId: 'plan-1',
          status: 'active' as const,
          enrollmentDate: new Date().toISOString(),
          sessionStartDate: new Date().toISOString(),
        },
      };

      const persistedState = {
        enrollmentState: stateWithDates,
        timestamp: now,
        expiresAt: now + (10 * 60 * 1000),
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.loadState();

      expect(result?.enrollmentData?.enrollmentDate).toBeInstanceOf(Date);
      expect(result?.enrollmentData?.sessionStartDate).toBeInstanceOf(Date);
    });
  });

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      manager.clearState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_enrollment_state');
    });
  });

  describe('hasValidState', () => {
    it('should return true for valid state', () => {
      const now = Date.now();
      const persistedState = {
        enrollmentState: mockState,
        timestamp: now,
        expiresAt: now + (10 * 60 * 1000),
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.hasValidState();

      expect(result).toBe(true);
    });

    it('should return false for expired state', () => {
      const now = Date.now();
      const persistedState = {
        enrollmentState: mockState,
        timestamp: now - (20 * 60 * 1000),
        expiresAt: now - (10 * 60 * 1000), // Expired
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.hasValidState();

      expect(result).toBe(false);
    });
  });

  describe('getStateAge', () => {
    it('should return age in minutes', () => {
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      const persistedState = {
        enrollmentState: mockState,
        timestamp: fiveMinutesAgo,
        expiresAt: now + (5 * 60 * 1000),
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.getStateAge();

      expect(result).toBeCloseTo(5, 0);
    });

    it('should return null for no data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = manager.getStateAge();

      expect(result).toBeNull();
    });
  });

  describe('extendExpiration', () => {
    it('should extend expiration time', () => {
      const now = Date.now();
      const persistedState = {
        enrollmentState: mockState,
        timestamp: now,
        expiresAt: now + (10 * 60 * 1000),
        sessionId: 'test-session',
        version: '1.0.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

      const result = manager.extendExpiration(5);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      
      expect(parsedData.expiresAt).toBe(now + (15 * 60 * 1000));
    });

    it('should return false when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = manager.extendExpiration(5);

      expect(result).toBe(false);
    });
  });

  describe('encryption', () => {
    it('should encrypt and decrypt data when encryption key is provided', () => {
      const managerWithEncryption = new StatePersistenceManager({
        key: 'test_encrypted_state',
        encryptionKey: 'test-key',
      });

      managerWithEncryption.saveState(mockState);

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      
      // Data should be encrypted (base64 encoded)
      expect(savedData).toMatch(/^[A-Za-z0-9+/]+=*$/);
      expect(savedData).not.toContain('pricing'); // Should not contain plain text

      // Should be able to decrypt and load
      localStorageMock.getItem.mockReturnValue(savedData);
      const result = managerWithEncryption.loadState();

      expect(result?.currentStep).toBe('pricing');
    });
  });
});

describe('StateRecoveryManager', () => {
  let persistence: StatePersistenceManager;
  let recovery: StateRecoveryManager;

  beforeEach(() => {
    jest.clearAllMocks();
    persistence = new StatePersistenceManager({ key: 'test_recovery_state' });
    recovery = new StateRecoveryManager(persistence);
  });

  describe('canRecover', () => {
    it('should return true when valid state exists', () => {
      jest.spyOn(persistence, 'hasValidState').mockReturnValue(true);

      const result = recovery.canRecover();

      expect(result).toBe(true);
    });

    it('should return false when no valid state exists', () => {
      jest.spyOn(persistence, 'hasValidState').mockReturnValue(false);

      const result = recovery.canRecover();

      expect(result).toBe(false);
    });
  });

  describe('getRecoveryInfo', () => {
    it('should return recovery information', () => {
      const mockState = { currentStep: 'pricing' as const };
      
      jest.spyOn(persistence, 'hasValidState').mockReturnValue(true);
      jest.spyOn(persistence, 'getStateAge').mockReturnValue(5);
      jest.spyOn(persistence, 'loadState').mockReturnValue(mockState);

      const result = recovery.getRecoveryInfo();

      expect(result).toEqual({
        canRecover: true,
        stateAge: 5,
        lastStep: 'pricing',
      });
    });

    it('should handle no state case', () => {
      jest.spyOn(persistence, 'hasValidState').mockReturnValue(false);
      jest.spyOn(persistence, 'getStateAge').mockReturnValue(null);

      const result = recovery.getRecoveryInfo();

      expect(result).toEqual({
        canRecover: false,
        stateAge: null,
        lastStep: null,
      });
    });
  });

  describe('recoverState', () => {
    it('should recover state and call callback', async () => {
      const mockState = { currentStep: 'pricing' as const };
      const onStateRecovered = jest.fn();
      
      recovery = new StateRecoveryManager(persistence, { onStateRecovered });
      jest.spyOn(persistence, 'loadState').mockReturnValue(mockState);

      const result = await recovery.recoverState();

      expect(result).toEqual(mockState);
      expect(onStateRecovered).toHaveBeenCalledWith(mockState);
    });

    it('should handle recovery failure', async () => {
      const onRecoveryFailed = jest.fn();
      
      recovery = new StateRecoveryManager(persistence, { onRecoveryFailed });
      jest.spyOn(persistence, 'loadState').mockImplementation(() => {
        throw new Error('Recovery failed');
      });

      const result = await recovery.recoverState();

      expect(result).toBeNull();
      expect(onRecoveryFailed).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});