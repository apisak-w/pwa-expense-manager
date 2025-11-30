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

  return {
    categories,
    addCategory,
    deleteCategory,
    getCategoriesByType,
    refreshCategories: loadCategories,
  };
}
