import { storage } from './storage';
import { googleAuthService } from './google-auth';
import type { SyncStrategy } from './strategies/SyncStrategy';
import { GoogleSheetsSyncStrategy } from './strategies/GoogleSheetsSyncStrategy';

type SyncListener = () => void;

export const syncService = {
  isSyncing: false,
  listeners: new Set<SyncListener>(),

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  },

  async processQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping');
      return;
    }

    this.isSyncing = true;

    try {
      const queue = await storage.getSyncQueue();
      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} items...`);

      // Determine strategy
      // Use googleAuthService to ensure we have a valid, non-expired token
      const accessToken = await googleAuthService.getAccessToken();
      const isConnected = !!accessToken;

      if (!isConnected) {
        console.log('Not connected to Google Sheets (or session expired), skipping sync');
        return;
      }

      const strategy: SyncStrategy = new GoogleSheetsSyncStrategy();

      console.log('Using strategy: Google Sheets');

      for (const item of queue) {
        try {
          await strategy.syncItem(item);
          await storage.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Failed to sync item', item, error);
          // Keep in queue to retry later
        }
      }

      console.log('Sync complete');
      this.notifyListeners();
    } finally {
      this.isSyncing = false;
    }
  },
};
