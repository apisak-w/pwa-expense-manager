export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: string; // categoryId or name for backward compatibility
  date: string; // ISO string
  description: string;
  synced: boolean;
  updatedAt: number; // timestamp
  type: TransactionType;
  isCleared: boolean;
}

export interface SyncItem {
  id: string; // uuid
  action: 'create' | 'update' | 'delete';
  payload: unknown;
  timestamp: number;
}

export interface GoogleAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  userEmail: string | null;
}

export interface SyncMetadata {
  spreadsheetId: string | null;
  lastSyncTimestamp: number | null;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastSyncError: string | null;
}

export interface AuthTokens {
  accessToken: string | null;
  expiresAt: number | null;
  userEmail: string | null;
}
