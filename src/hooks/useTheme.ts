import { useEffect } from 'react';

export function useTheme(): void {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (): void => {
      const isDark = mediaQuery.matches;
      const root = document.documentElement;

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Set initial theme
    updateTheme();

    // Listen for changes
    mediaQuery.addEventListener('change', updateTheme);

    return (): void => {
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);
}
