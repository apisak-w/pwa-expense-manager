import { useState, useEffect, useCallback, useRef } from 'react';
import { googleAuthService } from '../services/google-auth';
import { googleSheetsService } from '../services/google-sheets';
import { storage } from '../services/storage';
import type { SyncStatus, Expense } from '../types';
import dayjs from 'dayjs';

export function useGoogleSheets(): {
  isSyncing: boolean;
  lastSync: number | null;
  syncError: string | null;
  syncNow: () => Promise<void>;
  enableAutoSync: () => void;
  disableAutoSync: () => void;
  isAutoSyncEnabled: boolean;
} {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    lastSyncError: null,
  });
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const syncIntervalRef = useRef<number | null>(null);

  // Load initial sync state
  useEffect(() => {
    storage.getSyncMetadata().then(metadata => {
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: metadata.lastSyncTimestamp,
      }));
      setIsAutoSyncEnabled(metadata.autoSyncEnabled);
    });
  }, []);

  /**
   * Bidirectional sync with conflict resolution (last-write-wins)
   */
  const bidirectionalSync = async (): Promise<void> => {
    // Get local and remote transactions
    const localTransactions = await storage.getExpenses();
    const remoteTransactions = await googleSheetsService.readTransactions();

    // Create maps for quick lookup
    const localMap = new Map(localTransactions.map(t => [t.id, t]));
    const remoteMap = new Map(remoteTransactions.map(t => [t.id, t]));

    // Process local transactions
    for (const local of localTransactions) {
      const remote = remoteMap.get(local.id);
      if (remote && remote.updatedAt > local.updatedAt) {
        // Remote is newer - update local
        await storage.addExpense(remote);
      }
    }

    // Process remote transactions
    for (const remote of remoteTransactions) {
      if (!localMap.has(remote.id)) {
        // Exists remotely but not locally - create locally
        await storage.addExpense(remote);
      }
    }

    // Apply changes to remote (always rewrite all to ensure consistency)
    const allLocal = await storage.getExpenses();
    const allRemote = await googleSheetsService.readTransactions();

    // Merge with conflict resolution (last-write-wins)
    const merged = new Map<string, Expense>();

    for (const t of allRemote) {
      merged.set(t.id, t);
    }

    for (const t of allLocal) {
      const existing = merged.get(t.id);
      if (!existing || t.updatedAt >= existing.updatedAt) {
        merged.set(t.id, t);
      }
    }

    await googleSheetsService.writeTransactions(Array.from(merged.values()));

    // Handle deletions (transactions in remote but deleted locally)
    // This is complex and requires tracking deletions separately
    // For now, we'll skip this and implement it later if needed
  };

  const performSync = useCallback(async (): Promise<void> => {
    const authState = googleAuthService.getAuthState();
    if (!authState.isAuthenticated || !authState.accessToken) {
      throw new Error('Not authenticated with Google');
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, lastSyncError: null }));

    try {
      // Set the access token
      googleSheetsService.setAccessToken(authState.accessToken);

      // Get or initialize spreadsheet
      const metadata = await storage.getSyncMetadata();
      if (metadata.spreadsheetId) {
        googleSheetsService.setSpreadsheetId(metadata.spreadsheetId);
      } else {
        const sheetMetadata = await googleSheetsService.initializeSpreadsheet();
        await storage.setSyncMetadata({
          ...metadata,
          spreadsheetId: sheetMetadata.spreadsheetId,
        });
      }

      // Perform bidirectional sync
      await bidirectionalSync();

      // Update last sync timestamp
      const now = dayjs().valueOf();
      const updatedMetadata = await storage.getSyncMetadata();
      await storage.setSyncMetadata({
        ...updatedMetadata,
        lastSyncTimestamp: now,
      });

      setSyncStatus({
        isSyncing: false,
        lastSyncTime: now,
        lastSyncError: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      console.error('Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncError: errorMessage,
      }));
      throw error;
    }
  }, []);

  const syncNow = useCallback(async (): Promise<void> => {
    await performSync();
  }, [performSync]);

  const enableAutoSync = useCallback((): void => {
    setIsAutoSyncEnabled(true);
    storage.getSyncMetadata().then(metadata => {
      storage.setSyncMetadata({ ...metadata, autoSyncEnabled: true });
    });
  }, []);

  const disableAutoSync = useCallback((): void => {
    setIsAutoSyncEnabled(false);
    storage.getSyncMetadata().then(metadata => {
      storage.setSyncMetadata({ ...metadata, autoSyncEnabled: false });
    });

    // Clear interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  // Auto-sync setup
  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const authState = googleAuthService.getAuthState();
    if (!authState.isAuthenticated) return;

    // Initial sync
    performSync().catch(console.error);

    // Set up interval (5 minutes)
    syncIntervalRef.current = window.setInterval(
      () => {
        performSync().catch(console.error);
      },
      5 * 60 * 1000
    );

    return (): void => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isAutoSyncEnabled, performSync]);

  return {
    isSyncing: syncStatus.isSyncing,
    lastSync: syncStatus.lastSyncTime,
    syncError: syncStatus.lastSyncError,
    syncNow,
    enableAutoSync,
    disableAutoSync,
    isAutoSyncEnabled,
  };
}
