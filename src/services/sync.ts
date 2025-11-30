import { storage } from './storage';
import { api } from './api';
import type { SyncItem, Expense } from '../types';

export const syncService = {
  async processQueue(): Promise<void> {
    const queue = await storage.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} items...`);

    for (const item of queue) {
      try {
        await this.processItem(item);
        await storage.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error('Failed to sync item', item, error);
        // Keep in queue to retry later
      }
    }

    console.log('Sync complete');
  },

  async processItem(item: SyncItem): Promise<void> {
    switch (item.action) {
      case 'create':
        await api.createExpense(item.payload as Expense);
        // Update local DB to mark as synced
        await storage.addExpense({ ...(item.payload as Expense), synced: true });
        break;
      case 'update':
        await api.updateExpense(item.payload as Expense);
        await storage.addExpense({ ...(item.payload as Expense), synced: true });
        break;
      case 'delete':
        await api.deleteExpense((item.payload as { id: string }).id);
        // Already deleted from local DB, nothing to update
        break;
    }
  },
};
