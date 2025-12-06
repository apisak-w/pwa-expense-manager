import { useCallback, useEffect, useState } from 'react';
import { googleAuthService } from '../services/google-auth';
import type { GoogleAuthState } from '../types';

export function useGoogleAuth(): {
  isAuthenticated: boolean;
  user: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    accessToken: null,
    expiresAt: null,
    userEmail: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth service
    googleAuthService
      .initialize()
      .then(() => {
        setAuthState(googleAuthService.getAuthState());
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to initialize Google Auth:', err);
        setError(err.message);
        setIsLoading(false);
      });

    // Subscribe to auth state changes
    const unsubscribe = googleAuthService.subscribe(newState => {
      setAuthState(newState);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await googleAuthService.signIn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await googleAuthService.signOut();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.userEmail,
    isLoading,
    error,
    signIn,
    signOut,
  };
}
