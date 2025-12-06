import type { SyncStrategy } from './SyncStrategy';
import type { SyncItem, Expense } from '../../types';
import { api } from '../api';
import { storage } from '../storage';

export class MockApiSyncStrategy implements SyncStrategy {
  async syncItem(item: SyncItem): Promise<void> {
    const expense = item.payload as Expense;

    switch (item.action) {
      case 'create':
        await api.createExpense(expense);
        await storage.addExpense({ ...expense, synced: true });
        break;
      case 'update':
        await api.updateExpense(expense);
        await storage.addExpense({ ...expense, synced: true });
        break;
      case 'delete':
        await api.deleteExpense((item.payload as { id: string }).id);
        break;
    }
  }
}
