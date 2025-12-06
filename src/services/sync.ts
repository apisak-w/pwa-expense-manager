import { storage } from './storage';
import type { SyncStrategy } from './strategies/SyncStrategy';
import { GoogleSheetsSyncStrategy } from './strategies/GoogleSheetsSyncStrategy';

export const syncService = {
  async processQueue(): Promise<void> {
    const queue = await storage.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} items...`);

    // Determine strategy
    const tokens = await storage.getAuthTokens();
    const isConnected = !!tokens.accessToken;

    if (!isConnected) {
      console.log('Not connected to Google Sheets, skipping sync');
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
  },
};
