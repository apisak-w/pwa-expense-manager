import { act, renderHook, waitFor } from '@testing-library/react';
import { useCategories } from './useCategories';
import { storage } from '../services/storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category } from '../types';

// Mock storage
vi.mock('../services/storage', () => ({
  storage: {
    getCategories: vi.fn(),
    addCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getExpenses: vi.fn().mockResolvedValue([]),
    addExpense: vi.fn(),
  },
}));

describe('useCategories Hook', () => {
  const mockCategory: Category = {
    id: '1',
    name: 'Food',
    type: 'expense',
    isDefault: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getCategories).mockResolvedValue([]);
  });

  it('loads categories on mount', async () => {
    vi.mocked(storage.getCategories).mockResolvedValue([mockCategory]);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(1);
    });
    expect(result.current.categories[0]).toEqual(mockCategory);
  });

  it('adds a category', async () => {
    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.addCategory('New Cat', 'expense');
    });

    expect(storage.addCategory).toHaveBeenCalled();
    expect(storage.getCategories).toHaveBeenCalled();
  });

  it('deletes a category', async () => {
    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.deleteCategory('1');
    });

    expect(storage.deleteCategory).toHaveBeenCalledWith('1');
    expect(storage.getCategories).toHaveBeenCalled();
  });

  it('updates a category', async () => {
    vi.mocked(storage.getCategories).mockResolvedValue([mockCategory]);
    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(1);
    });

    await act(async () => {
      await result.current.updateCategory('1', 'Updated Food');
    });

    expect(storage.addCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        name: 'Updated Food',
      })
    );
  });

  it('filters categories by type', async () => {
    const incomeCategory: Category = { ...mockCategory, id: '2', type: 'income' };
    vi.mocked(storage.getCategories).mockResolvedValue([mockCategory, incomeCategory]);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(2);
    });

    const expenses = result.current.getCategoriesByType('expense');
    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toEqual(mockCategory);

    const income = result.current.getCategoriesByType('income');
    expect(income).toHaveLength(1);
    expect(income[0]).toEqual(incomeCategory);
  });
});
