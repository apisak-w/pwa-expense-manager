import { syncService } from './sync';
import { storage } from './storage';
import { api } from './api';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Expense } from '../types';

// Mock dependencies
vi.mock('./storage', () => ({
  storage: {
    getSyncQueue: vi.fn(),
    removeFromSyncQueue: vi.fn(),
    addExpense: vi.fn(),
  },
}));

vi.mock('./api', () => ({
  api: {
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
  },
}));

describe('Sync Service', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes create action', async () => {
    const syncItem = {
      id: 'sync-1',
      action: 'create' as const,
      payload: mockExpense,
      timestamp: 1234567890,
    };

    vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

    await syncService.processQueue();

    expect(api.createExpense).toHaveBeenCalledWith(mockExpense);
    expect(storage.addExpense).toHaveBeenCalledWith({ ...mockExpense, synced: true });
    expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync-1');
  });

  it('processes update action', async () => {
    const syncItem = {
      id: 'sync-2',
      action: 'update' as const,
      payload: mockExpense,
      timestamp: 1234567890,
    };

    vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

    await syncService.processQueue();

    expect(api.updateExpense).toHaveBeenCalledWith(mockExpense);
    expect(storage.addExpense).toHaveBeenCalledWith({ ...mockExpense, synced: true });
    expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync-2');
  });

  it('processes delete action', async () => {
    const syncItem = {
      id: 'sync-3',
      action: 'delete' as const,
      payload: { id: '1' },
      timestamp: 1234567890,
    };

    vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

    await syncService.processQueue();

    expect(api.deleteExpense).toHaveBeenCalledWith('1');
    expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync-3');
  });

  it('does nothing if queue is empty', async () => {
    vi.mocked(storage.getSyncQueue).mockResolvedValue([]);
    await syncService.processQueue();
    expect(api.createExpense).not.toHaveBeenCalled();
  });
});
