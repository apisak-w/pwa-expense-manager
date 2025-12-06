import { useEffect } from 'react';
import { googleAuthService } from '../services/google-auth';
import { syncService } from '../services/sync';

export function useSync(): void {
  useEffect(() => {
    // 1. Subscribe to auth changes
    const unsubscribe = googleAuthService.subscribe(async state => {
      if (state.isAuthenticated) {
        console.log('User authenticated (event), triggering sync...');
        await syncService.processQueue();
      }
    });

    // 2. Check initial state
    const currentState = googleAuthService.getAuthState();
    if (currentState.isAuthenticated) {
      console.log('User authenticated (mount), triggering sync...');
      syncService.processQueue();
    }

    // 3. Periodic sync (every 60 seconds)
    const intervalId = setInterval(async () => {
      const state = googleAuthService.getAuthState();
      if (state.isAuthenticated) {
        // processQueue checks if queue is empty internally, so this is safe/efficient
        await syncService.processQueue();
      }
    }, 60000);

    return (): void => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);
}
