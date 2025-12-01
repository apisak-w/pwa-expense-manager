import { renderHook, act, waitFor } from '@testing-library/react';
import { useExpenses } from './useExpenses';
import { storage } from '../services/storage';
import { syncService } from '../services/sync';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Expense } from '../types';

// Mock dependencies
vi.mock('../services/storage', () => ({
  storage: {
    getExpenses: vi.fn(),
    addExpense: vi.fn(),
    deleteExpense: vi.fn(),
    getExpense: vi.fn(),
    addToSyncQueue: vi.fn(),
  },
}));

vi.mock('../services/sync', () => ({
  syncService: {
    processQueue: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('./useNetworkStatus', () => ({
  useNetworkStatus: vi.fn().mockReturnValue(true),
}));

describe('useExpenses Hook', () => {
  const mockExpense: Expense = {
    id: '1',
    amount: 100,
    category: 'Food',
    date: '2023-01-01',
    description: 'Lunch',
    type: 'expense',
    synced: true,
    updatedAt: 1234567890,
    isCleared: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getExpenses).mockResolvedValue([]);
  });

  it('loads expenses on mount', async () => {
    vi.mocked(storage.getExpenses).mockResolvedValue([mockExpense]);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.expenses).toHaveLength(1);
    });
    expect(result.current.expenses[0]).toEqual(mockExpense);
  });

  it('adds an expense', async () => {
    const { result } = renderHook(() => useExpenses());

    await act(async () => {
      await result.current.addExpense({
        amount: 200,
        category: 'Transport',
        date: '2023-01-02',
        description: 'Bus',
        type: 'expense',
        isCleared: true,
      });
    });

    expect(storage.addExpense).toHaveBeenCalled();
    expect(storage.addToSyncQueue).toHaveBeenCalled();
    expect(syncService.processQueue).toHaveBeenCalled();
    expect(storage.getExpenses).toHaveBeenCalled();
  });

  it('deletes an expense', async () => {
    const { result } = renderHook(() => useExpenses());

    await act(async () => {
      await result.current.deleteExpense('1');
    });

    expect(storage.deleteExpense).toHaveBeenCalledWith('1');
    expect(storage.addToSyncQueue).toHaveBeenCalled();
    expect(syncService.processQueue).toHaveBeenCalled();
    expect(storage.getExpenses).toHaveBeenCalled();
  });
});
