import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Expense, SyncItem, Category, SyncMetadata, AuthTokens } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseDB extends DBSchema {
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-date': string; synced: number };
  };
  categories: {
    key: string;
    value: Category;
    indexes: { type: string };
  };
  syncQueue: {
    key: string;
    value: SyncItem;
  };
  syncMetadata: {
    key: string;
    value: (SyncMetadata & { key: string }) | (AuthTokens & { key: string });
  };
}

const DB_NAME = 'expense-manager-db';
const DB_VERSION = 3;

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', type: 'expense', isDefault: true },
  { name: 'Transport', type: 'expense', isDefault: true },
  { name: 'Shopping', type: 'expense', isDefault: true },
  { name: 'Bills', type: 'expense', isDefault: true },
  { name: 'Entertainment', type: 'expense', isDefault: true },
  { name: 'Health', type: 'expense', isDefault: true },
  { name: 'Salary', type: 'income', isDefault: true },
  { name: 'Freelance', type: 'income', isDefault: true },
  { name: 'Investments', type: 'income', isDefault: true },
  { name: 'Gift', type: 'income', isDefault: true },
];

let dbPromise: Promise<IDBPDatabase<ExpenseDB>>;

export const initDB = (): Promise<IDBPDatabase<ExpenseDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<ExpenseDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('by-date', 'date');
          expenseStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('type', 'type');

          // Populate default categories
          DEFAULT_CATEGORIES.forEach(cat => {
            categoryStore.add({ ...cat, id: uuidv4() });
          });
        }

        if (!db.objectStoreNames.contains('syncMetadata')) {
          db.createObjectStore('syncMetadata', { keyPath: 'key' });
        }

        // Migration for existing expenses
        if (oldVersion < 2) {
          const expenseStore = transaction.objectStore('expenses');
          expenseStore.getAll().then(expenses => {
            expenses.forEach(expense => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const item = expense as any;
              if (!item.type) {
                item.type = 'expense';
              }
              if (item.isCleared === undefined) {
                item.isCleared = true;
              }
              expenseStore.put(item);
            });
          });
        }
      },
    });
  }
  return dbPromise;
};

export const storage = {
  async addExpense(expense: Expense): Promise<void> {
    const db = await initDB();
    await db.put('expenses', expense);
  },

  async getExpenses(): Promise<Expense[]> {
    const db = await initDB();
    return db.getAllFromIndex('expenses', 'by-date');
  },

  async deleteExpense(id: string): Promise<void> {
    const db = await initDB();
    await db.delete('expenses', id);
  },

  async getExpense(id: string): Promise<Expense | undefined> {
    const db = await initDB();
    return db.get('expenses', id);
  },

  // Category Methods
  async getCategories(): Promise<Category[]> {
    const db = await initDB();
    return db.getAll('categories');
  },

  async addCategory(category: Category): Promise<void> {
    const db = await initDB();
    await db.put('categories', category);
  },

  async deleteCategory(id: string): Promise<void> {
    const db = await initDB();
    await db.delete('categories', id);
  },

  // Sync Queue Methods
  async addToSyncQueue(item: SyncItem): Promise<void> {
    const db = await initDB();
    await db.put('syncQueue', item);
  },

  async getSyncQueue(): Promise<SyncItem[]> {
    const db = await initDB();
    return db.getAll('syncQueue');
  },

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await initDB();
    await db.delete('syncQueue', id);
  },

  async clearSyncQueue(): Promise<void> {
    const db = await initDB();
    await db.clear('syncQueue');
  },

  // Sync Metadata Methods
  async getSyncMetadata(): Promise<SyncMetadata> {
    const db = await initDB();
    const metadata = await db.get('syncMetadata', 'sync');
    return (
      (metadata as SyncMetadata) || {
        spreadsheetId: null,
        lastSyncTimestamp: null,
        autoSyncEnabled: true,
        syncIntervalMinutes: 5,
      }
    );
  },

  async setSyncMetadata(metadata: SyncMetadata): Promise<void> {
    const db = await initDB();
    await db.put('syncMetadata', { ...metadata, key: 'sync' });
  },

  // Auth Token Methods
  async getAuthTokens(): Promise<AuthTokens> {
    const db = await initDB();
    const tokens = await db.get('syncMetadata', 'authTokens');
    return (
      (tokens as AuthTokens) || {
        accessToken: null,
        expiresAt: null,
        userEmail: null,
      }
    );
  },

  async setAuthTokens(tokens: AuthTokens): Promise<void> {
    const db = await initDB();
    await db.put('syncMetadata', { ...tokens, key: 'authTokens' });
  },
};
