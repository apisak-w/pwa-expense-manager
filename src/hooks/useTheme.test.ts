import { renderHook } from '@testing-library/react';
import { useTheme } from './useTheme';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTheme Hook', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('sets dark mode if preferred', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark mode if not preferred', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    document.documentElement.classList.add('dark');
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates theme on change', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let changeListener: any;
    const addEventListener = vi.fn((event, cb) => {
      if (event === 'change') {
        changeListener = cb;
      }
    });

    const mediaQuery = {
      matches: false,
      addEventListener,
      removeEventListener: vi.fn(),
    };

    matchMediaMock.mockReturnValue(mediaQuery);

    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate change to dark
    mediaQuery.matches = true;
    changeListener(mediaQuery);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
