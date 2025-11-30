import type { Expense } from '../types';

// Mock API delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async createExpense(expense: Expense): Promise<Expense> {
    await delay(500);
    console.log('API: Created expense', expense);
    return { ...expense, synced: true };
  },

  async updateExpense(expense: Expense): Promise<Expense> {
    await delay(500);
    console.log('API: Updated expense', expense);
    return { ...expense, synced: true };
  },

  async deleteExpense(id: string): Promise<{ success: boolean }> {
    await delay(500);
    console.log('API: Deleted expense', id);
    return { success: true };
  },
};
