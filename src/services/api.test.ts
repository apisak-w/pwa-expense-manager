import { api } from './api';
import { describe, expect, it } from 'vitest';
import type { Expense } from '../types';

describe('API Service', () => {
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

  it('createExpense returns synced expense', async () => {
    const result = await api.createExpense(mockExpense);
    expect(result).toEqual({ ...mockExpense, synced: true });
  });

  it('updateExpense returns synced expense', async () => {
    const result = await api.updateExpense(mockExpense);
    expect(result).toEqual({ ...mockExpense, synced: true });
  });

  it('deleteExpense returns success', async () => {
    const result = await api.deleteExpense('1');
    expect(result).toEqual({ success: true });
  });
});
