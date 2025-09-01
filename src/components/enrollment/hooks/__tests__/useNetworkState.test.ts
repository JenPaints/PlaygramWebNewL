// Tests for network state hooks

import { renderHook, act } from '@testing-library/react';
import { useNetworkState, useTimeout, useRetry, useNetworkAwareOperation } from '../useNetworkState';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock connection API
const mockConnection = {
  type: 'wifi',
  effectiveType: '4g',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: mockConnection,
});

describe('useNetworkState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigator.onLine = true;
    mockConnection.effectiveType = '4g';
  });

  it('should return initial network state', () => {
    const { result } = renderHook(() => useNetworkState());

    expect(result.current).toEqual({
      isOnline: true,
      isSlowConnection: false,
      connectionType: 'wifi',
      effectiveType: '4g',
    });
  });

  it('should detect slow connection', () => {
    mockConnection.effectiveType = 'slow-2g';
    
    const { result } = renderHook(() => useNetworkState());

    expect(result.current.isSlowConnection).toBe(true);
  });

  it('should call onOnline callback when coming online', () => {
    const onOnline = jest.fn();
    navigator.onLine = false;

    const { result } = renderHook(() => useNetworkState({ onOnline }));

    expect(result.current.isOnline).toBe(false);

    // Simulate coming online
    act(() => {
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));
    });

    expect(onOnline).toHaveBeenCalled();
  });

  it('should call onOffline callback when going offline', () => {
    const onOffline = jest.fn();
    navigator.onLine = true;

    const { result } = renderHook(() => useNetworkState({ onOffline }));

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    act(() => {
      navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));
    });

    expect(onOffline).toHaveBeenCalled();
  });
});

describe('useTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve promise before timeout', async () => {
    const { result } = renderHook(() => useTimeout({ timeout: 5000 }));

    const promise = Promise.resolve('success');
    const timeoutPromise = result.current.createTimeoutPromise(promise);

    const resolvedValue = await timeoutPromise;
    expect(resolvedValue).toBe('success');
    expect(result.current.isTimedOut).toBe(false);
  });

  it('should reject promise after timeout', async () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() => useTimeout({ timeout: 1000, onTimeout }));

    const promise = new Promise(resolve => setTimeout(resolve, 2000));
    const timeoutPromise = result.current.createTimeoutPromise(promise);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await expect(timeoutPromise).rejects.toThrow('Request timed out');
    expect(onTimeout).toHaveBeenCalled();
    expect(result.current.isTimedOut).toBe(true);
  });

  it('should reset timeout state', () => {
    const { result } = renderHook(() => useTimeout());

    act(() => {
      result.current.resetTimeout();
    });

    expect(result.current.isTimedOut).toBe(false);
  });
});

describe('useRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const { result } = renderHook(() => useRetry());

    const operation = jest.fn().mockResolvedValue('success');
    const promise = result.current.executeWithRetry(operation);

    const resolvedValue = await promise;
    expect(resolvedValue).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(0);
  });

  it('should retry on failure and eventually succeed', async () => {
    const onRetry = jest.fn();
    const { result } = renderHook(() => useRetry({ maxRetries: 3, onRetry }));

    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = result.current.executeWithRetry(operation);

    // Fast-forward through retry delays
    act(() => {
      jest.runAllTimers();
    });

    const resolvedValue = await promise;
    expect(resolvedValue).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    const onMaxRetriesReached = jest.fn();
    const { result } = renderHook(() => useRetry({ maxRetries: 2, onMaxRetriesReached }));

    const operation = jest.fn().mockRejectedValue(new Error('always fail'));
    const promise = result.current.executeWithRetry(operation);

    // Fast-forward through retry delays
    act(() => {
      jest.runAllTimers();
    });

    await expect(promise).rejects.toThrow('always fail');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(onMaxRetriesReached).toHaveBeenCalled();
  });

  it('should respect retry condition', async () => {
    const retryCondition = jest.fn().mockReturnValue(false);
    const { result } = renderHook(() => useRetry({ retryCondition }));

    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    const promise = result.current.executeWithRetry(operation);

    await expect(promise).rejects.toThrow('fail');
    expect(operation).toHaveBeenCalledTimes(1); // No retries
    expect(retryCondition).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should reset retry state', () => {
    const { result } = renderHook(() => useRetry());

    act(() => {
      result.current.reset();
    });

    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });
});

describe('useNetworkAwareOperation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    navigator.onLine = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should execute operation successfully', async () => {
    const { result } = renderHook(() => useNetworkAwareOperation());

    const operation = jest.fn().mockResolvedValue('success');
    const promise = result.current.execute(operation);

    const resolvedValue = await promise;
    expect(resolvedValue).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should fail when offline and requireOnline is true', async () => {
    navigator.onLine = false;
    const { result } = renderHook(() => useNetworkAwareOperation());

    const operation = jest.fn().mockResolvedValue('success');
    const promise = result.current.execute(operation, { requireOnline: true });

    await expect(promise).rejects.toThrow('No internet connection available');
    expect(operation).not.toHaveBeenCalled();
  });

  it('should execute when offline and requireOnline is false', async () => {
    navigator.onLine = false;
    const { result } = renderHook(() => useNetworkAwareOperation());

    const operation = jest.fn().mockResolvedValue('success');
    const promise = result.current.execute(operation, { requireOnline: false });

    const resolvedValue = await promise;
    expect(resolvedValue).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should skip retry when skipRetry is true', async () => {
    const { result } = renderHook(() => useNetworkAwareOperation());

    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    const promise = result.current.execute(operation, { skipRetry: true });

    await expect(promise).rejects.toThrow('fail');
    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });
});