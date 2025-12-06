import { syncService } from './sync';
import { storage } from './storage';
import { googleSheetsService } from './google-sheets';
import { googleAuthService } from './google-auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Expense } from '../types';

// Mock dependencies
vi.mock('./storage', () => ({
  storage: {
    getSyncQueue: vi.fn(),
    removeFromSyncQueue: vi.fn(),
    addExpense: vi.fn(),
    getSyncMetadata: vi.fn(),
    setSyncMetadata: vi.fn(),
  },
}));

vi.mock('./google-auth', () => ({
  googleAuthService: {
    getAccessToken: vi.fn(),
  },
}));

vi.mock('./google-sheets', () => ({
  googleSheetsService: {
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    setAccessToken: vi.fn(),
    setSpreadsheetId: vi.fn(),
    initializeSpreadsheet: vi.fn(),
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
      vi.mocked(googleAuthService.getAccessToken).mockResolvedValue('mock-token');
      vi.mocked(storage.getSyncMetadata).mockResolvedValue({
        spreadsheetId: 'mock-sheet-id',
        lastSyncTimestamp: null,
        autoSyncEnabled: true,
        syncIntervalMinutes: 5,
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
    it('initializes spreadsheet if ID is missing', async () => {
      vi.mocked(storage.getSyncMetadata).mockResolvedValue({
        spreadsheetId: null,
        lastSyncTimestamp: null,
        autoSyncEnabled: true,
        syncIntervalMinutes: 5,
      });

      vi.mocked(googleSheetsService.initializeSpreadsheet).mockResolvedValue({
        spreadsheetId: 'new-sheet-id',
        spreadsheetUrl: 'http://example.com',
      });

      const syncItem = {
        id: 'sync-1',
        action: 'create' as const,
        payload: mockExpense,
        timestamp: 1234567890,
      };

      vi.mocked(storage.getSyncQueue).mockResolvedValue([syncItem]);

      await syncService.processQueue();

      expect(googleSheetsService.initializeSpreadsheet).toHaveBeenCalled();
      expect(storage.setSyncMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ spreadsheetId: 'new-sheet-id' })
      );
      expect(googleSheetsService.updateTransaction).toHaveBeenCalledWith(mockExpense);
    });

    it('prevents concurrent syncs', async () => {
      vi.mocked(storage.getSyncQueue).mockResolvedValue([
        {
          id: 'sync-1',
          action: 'create',
          payload: mockExpense,
          timestamp: 1234567890,
        },
      ]);

      // Simulate a slow sync
      vi.mocked(googleSheetsService.updateTransaction).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      // Call processQueue twice concurrently
      const promise1 = syncService.processQueue();
      const promise2 = syncService.processQueue();

      await Promise.all([promise1, promise2]);

      // Should only be called once
      expect(storage.getSyncQueue).toHaveBeenCalledTimes(1);
    });

    it('notifies listeners after sync', async () => {
      const listener = vi.fn();
      syncService.subscribe(listener);

      vi.mocked(storage.getSyncQueue).mockResolvedValue([
        {
          id: 'sync-1',
          action: 'create',
          payload: mockExpense,
          timestamp: 1234567890,
        },
      ]);

      await syncService.processQueue();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('when NOT connected to Google Sheets', () => {
    beforeEach(() => {
      vi.mocked(googleAuthService.getAccessToken).mockResolvedValue(null);
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
