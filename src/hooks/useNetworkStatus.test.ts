import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('useNetworkStatus Hook', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial online status', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(true);
  });

  it('updates status on offline/online events', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
