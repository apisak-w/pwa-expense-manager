import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { Expense, SyncItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { syncService } from '../services/sync';
import dayjs from 'dayjs';
import { useNetworkStatus } from './useNetworkStatus';

export function useExpenses(): {
  expenses: Expense[];
  addExpense: (expenseData: Omit<Expense, 'id' | 'synced' | 'updatedAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  toggleCleared: (id: string) => Promise<void>;
} {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const isOnline = useNetworkStatus();

  const loadExpenses = useCallback(async () => {
    const data = await storage.getExpenses();
    setExpenses(
      data.sort((a, b) => {
        // Primary sort: Date (descending)
        const dateDiff = dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
        if (dateDiff !== 0) return dateDiff;

        // Secondary sort: Creation time (descending)
        // Fallback to updatedAt if createdAt is missing
        const bTime = b.createdAt || b.updatedAt;
        const aTime = a.createdAt || a.updatedAt;
        return bTime - aTime;
      })
    );
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Subscribe to sync updates
  useEffect(() => {
    const unsubscribe = syncService.subscribe(() => {
      loadExpenses();
    });
    return unsubscribe;
  }, [loadExpenses]);

  // Sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncService.processQueue();
    }
  }, [isOnline]);

  const addExpense = async (
    expenseData: Omit<Expense, 'id' | 'synced' | 'updatedAt' | 'createdAt'>
  ): Promise<void> => {
    const now = dayjs().valueOf();
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4(),
      synced: false,
      updatedAt: now,
      createdAt: now,
    };

    await storage.addExpense(newExpense);

    // Queue for sync
    const syncItem: SyncItem = {
      id: uuidv4(),
      action: 'create',
      payload: newExpense,
      timestamp: dayjs().valueOf(),
    };
    await storage.addToSyncQueue(syncItem);

    // Try to sync immediately if online
    if (isOnline) {
      syncService.processQueue().then(() => loadExpenses()); // Background sync
    }

    await loadExpenses();
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await storage.deleteExpense(id);

    const syncItem: SyncItem = {
      id: uuidv4(),
      action: 'delete',
      payload: { id },
      timestamp: dayjs().valueOf(),
    };
    await storage.addToSyncQueue(syncItem);

    if (isOnline) {
      syncService.processQueue().then(() => loadExpenses());
    }

    await loadExpenses();
  };

  const toggleCleared = async (id: string): Promise<void> => {
    const expense = await storage.getExpense(id);
    if (!expense) return;

    const updatedExpense = {
      ...expense,
      isCleared: !expense.isCleared,
      updatedAt: dayjs().valueOf(),
      synced: false,
    };
    await storage.addExpense(updatedExpense);

    const syncItem: SyncItem = {
      id: uuidv4(),
      action: 'update',
      payload: updatedExpense,
      timestamp: dayjs().valueOf(),
    };
    await storage.addToSyncQueue(syncItem);

    if (isOnline) {
      syncService.processQueue().then(() => loadExpenses());
    }

    await loadExpenses();
  };

  return { expenses, addExpense, deleteExpense, toggleCleared };
}
