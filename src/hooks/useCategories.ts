import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import type { Category, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(async () => {
    const data = await storage.getCategories();
    setCategories(data);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = async (name: string, type: TransactionType) => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      type,
      isDefault: false,
    };
    await storage.addCategory(newCategory);
    await loadCategories();
  };

  const deleteCategory = async (id: string) => {
    await storage.deleteCategory(id);
    await loadCategories();
  };

  const getCategoriesByType = (type: TransactionType) => {
    return categories.filter(c => c.type === type);
  };

  const updateCategory = async (id: string, name: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    const oldName = category.name;

    const updatedCategory: Category = {
      ...category,
      name,
    };
    await storage.addCategory(updatedCategory);

    // Update expenses with old category name
    if (oldName !== name) {
      const expenses = await storage.getExpenses();
      const expensesToUpdate = expenses.filter(e => e.category === oldName);
      for (const expense of expensesToUpdate) {
        // We use addExpense which handles sync queue automatically
        // However, we should probably batch this or be careful about sync
        // For now, simple iteration is safe
        await storage.addExpense({ ...expense, category: name });
      }
    }

    await loadCategories();
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    refreshCategories: loadCategories,
  };
}
