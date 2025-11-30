export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
  synced: boolean;
  updatedAt: number; // timestamp
}

export interface SyncItem {
  id: string; // uuid
  action: 'create' | 'update' | 'delete';
  payload: unknown;
  timestamp: number;
}
