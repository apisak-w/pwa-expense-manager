import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Expense, SyncItem } from '../types';

interface ExpenseDB extends DBSchema {
    expenses: {
        key: string;
        value: Expense;
        indexes: { 'by-date': string; 'synced': number };
    };
    syncQueue: {
        key: string;
        value: SyncItem;
    };
}

const DB_NAME = 'expense-manager-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ExpenseDB>>;

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<ExpenseDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('expenses')) {
                    const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
                    expenseStore.createIndex('by-date', 'date');
                    expenseStore.createIndex('synced', 'synced');
                }
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
};

export const storage = {
    async addExpense(expense: Expense) {
        const db = await initDB();
        await db.put('expenses', expense);
    },

    async getExpenses() {
        const db = await initDB();
        return db.getAllFromIndex('expenses', 'by-date');
    },

    async deleteExpense(id: string) {
        const db = await initDB();
        await db.delete('expenses', id);
    },

    async getExpense(id: string) {
        const db = await initDB();
        return db.get('expenses', id);
    },

    // Sync Queue Methods
    async addToSyncQueue(item: SyncItem) {
        const db = await initDB();
        await db.put('syncQueue', item);
    },

    async getSyncQueue() {
        const db = await initDB();
        return db.getAll('syncQueue');
    },

    async removeFromSyncQueue(id: string) {
        const db = await initDB();
        await db.delete('syncQueue', id);
    },

    async clearSyncQueue() {
        const db = await initDB();
        await db.clear('syncQueue');
    }
};
