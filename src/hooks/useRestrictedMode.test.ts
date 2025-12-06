import { renderHook } from '@testing-library/react';
import { useRestrictedMode } from './useRestrictedMode';
import { describe, expect, it, vi } from 'vitest';

// Mock useNetworkStatus
vi.mock('./useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(),
}));

import { useNetworkStatus } from './useNetworkStatus';

describe('useRestrictedMode Hook', () => {
  it('is not restricted when online', () => {
    vi.mocked(useNetworkStatus).mockReturnValue(true);
    const { result } = renderHook(() => useRestrictedMode());
    expect(result.current.isRestricted).toBe(false);
    expect(result.current.canPerformAction('sync')).toBe(true);
  });

  it('is restricted when offline', () => {
    vi.mocked(useNetworkStatus).mockReturnValue(false);
    const { result } = renderHook(() => useRestrictedMode());
    expect(result.current.isRestricted).toBe(true);
  });

  it('blocks online-only actions when offline', () => {
    vi.mocked(useNetworkStatus).mockReturnValue(false);
    const { result } = renderHook(() => useRestrictedMode());
    expect(result.current.canPerformAction('sync')).toBe(false);
    expect(result.current.canPerformAction('analytics')).toBe(false);
  });

  it('allows local actions when offline', () => {
    vi.mocked(useNetworkStatus).mockReturnValue(false);
    const { result } = renderHook(() => useRestrictedMode());
    expect(result.current.canPerformAction('add_expense')).toBe(true);
  });
});
