import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import type { Expense, SyncItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { syncService } from '../services/sync';
import { useNetworkStatus } from './useNetworkStatus';
import dayjs from 'dayjs';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const isOnline = useNetworkStatus();

  const loadExpenses = useCallback(async () => {
    const data = await storage.getExpenses();
    setExpenses(data.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncService.processQueue().then(() => loadExpenses());
    }
  }, [isOnline, loadExpenses]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'synced' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4(),
      synced: false,
      updatedAt: dayjs().valueOf(),
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

  const deleteExpense = async (id: string) => {
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

  return { expenses, addExpense, deleteExpense };
}
