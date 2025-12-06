import { renderHook } from '@testing-library/react';
import { useSync } from './useSync';
import { googleAuthService } from '../services/google-auth';
import { syncService } from '../services/sync';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { GoogleAuthState } from '../types';

vi.mock('../services/google-auth', () => ({
  googleAuthService: {
    subscribe: vi.fn(),
    getAuthState: vi.fn(),
  },
}));

vi.mock('../services/sync', () => ({
  syncService: {
    processQueue: vi.fn(),
  },
}));

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(googleAuthService.getAuthState).mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      userEmail: null,
    });
  });

  it('subscribes to auth service on mount', () => {
    vi.mocked(googleAuthService.subscribe).mockReturnValue(vi.fn());
    renderHook(() => useSync());
    expect(googleAuthService.subscribe).toHaveBeenCalled();
  });

  it('triggers sync when authenticated', () => {
    let callback: (state: GoogleAuthState) => void = () => {};
    vi.mocked(googleAuthService.subscribe).mockImplementation(cb => {
      callback = cb;
      return vi.fn();
    });

    renderHook(() => useSync());

    // Simulate auth state change to authenticated
    callback({
      isAuthenticated: true,
      accessToken: 'token',
      expiresAt: Date.now(),
      userEmail: 'test@example.com',
    });

    expect(syncService.processQueue).toHaveBeenCalled();
  });

  it('does NOT trigger sync when NOT authenticated', () => {
    let callback: (state: GoogleAuthState) => void = () => {};
    vi.mocked(googleAuthService.subscribe).mockImplementation(cb => {
      callback = cb;
      return vi.fn();
    });

    renderHook(() => useSync());

    // Simulate auth state change to unauthenticated
    callback({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      userEmail: null,
    });

    expect(syncService.processQueue).not.toHaveBeenCalled();
  });
});
