import { syncService } from './sync';
import { storage } from './storage';
import { googleSheetsService } from './google-sheets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Expense } from '../types';

// Mock dependencies
vi.mock('./storage', () => ({
  storage: {
    getSyncQueue: vi.fn(),
    removeFromSyncQueue: vi.fn(),
    addExpense: vi.fn(),
    getAuthTokens: vi.fn(),
  },
}));

vi.mock('./google-sheets', () => ({
  googleSheetsService: {
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
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

  describe('when connected to Google Sheets', () => {
    beforeEach(() => {
      vi.mocked(storage.getAuthTokens).mockResolvedValue({
        accessToken: 'mock-token',
        expiresAt: Date.now() + 3600000,
        userEmail: 'test@example.com',
      });
    });

    it('processes create action using Google Sheets service', async () => {
      const syncItem = {
        id: 'sync-1',
        action: 'create' as const,
        payload: mockExpense,
        timestamp: 1234567890,
      };

      vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

      await syncService.processQueue();

      expect(googleSheetsService.updateTransaction).toHaveBeenCalledWith(mockExpense);
      expect(storage.addExpense).toHaveBeenCalledWith({ ...mockExpense, synced: true });
      expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync-1');
    });

    it('processes update action using Google Sheets service', async () => {
      const syncItem = {
        id: 'sync-2',
        action: 'update' as const,
        payload: mockExpense,
        timestamp: 1234567890,
      };

      vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

      await syncService.processQueue();

      expect(googleSheetsService.updateTransaction).toHaveBeenCalledWith(mockExpense);
      expect(storage.addExpense).toHaveBeenCalledWith({ ...mockExpense, synced: true });
      expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync-2');
    });

    it('processes delete action using Google Sheets service', async () => {
      const syncItem = {
        id: 'sync-3',
        action: 'delete' as const,
        payload: { id: '1' },
        timestamp: 1234567890,
      };

      vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

      await syncService.processQueue();

      expect(googleSheetsService.deleteTransaction).toHaveBeenCalledWith('1');
      expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync-3');
    });
  });

  describe('when NOT connected to Google Sheets', () => {
    beforeEach(() => {
      vi.mocked(storage.getAuthTokens).mockResolvedValue({
        accessToken: null,
        expiresAt: null,
        userEmail: null,
      });
    });

    it('does NOT process queue', async () => {
      const syncItem = {
        id: 'sync-1',
        action: 'create' as const,
        payload: mockExpense,
        timestamp: 1234567890,
      };

      vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

      await syncService.processQueue();

      expect(googleSheetsService.updateTransaction).not.toHaveBeenCalled();
      expect(storage.addExpense).not.toHaveBeenCalled();
      expect(storage.removeFromSyncQueue).not.toHaveBeenCalled();
    });
  });

  it('does nothing if queue is empty', async () => {
    vi.mocked(storage.getSyncQueue).mockResolvedValue([]);
    await syncService.processQueue();
    expect(googleSheetsService.updateTransaction).not.toHaveBeenCalled();
  });
});
