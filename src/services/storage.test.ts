import { initDB, storage } from './storage';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Expense } from '../types';

describe('Storage Service', () => {
  const mockExpense: Expense = {
    id: '1',
    amount: 100,
    category: 'Food',
    date: '2023-01-01',
    description: 'Lunch',
    type: 'expense',
    synced: false,
    updatedAt: 1234567890,
    isCleared: true,
  };

  beforeEach(async () => {
    // Clear DB before each test
    const db = await initDB();
    await db.clear('expenses');
    await db.clear('syncQueue');
  });

  it('adds and retrieves expenses', async () => {
    await storage.addExpense(mockExpense);
    const expenses = await storage.getExpenses();
    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toEqual(mockExpense);
  });

  it('deletes expense', async () => {
    await storage.addExpense(mockExpense);
    await storage.deleteExpense(mockExpense.id);
    const expenses = await storage.getExpenses();
    expect(expenses).toHaveLength(0);
  });

  it('gets single expense', async () => {
    await storage.addExpense(mockExpense);
    const expense = await storage.getExpense(mockExpense.id);
    expect(expense).toEqual(mockExpense);
  });

  it('manages sync queue', async () => {
    const syncItem = {
      id: 'sync-1',
      action: 'create' as const,
      payload: mockExpense,
      timestamp: 1234567890,
    };

    await storage.addToSyncQueue(syncItem);
    const queue = await storage.getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(syncItem);

    await storage.removeFromSyncQueue('sync-1');
    const emptyQueue = await storage.getSyncQueue();
    expect(emptyQueue).toHaveLength(0);
  });
});
