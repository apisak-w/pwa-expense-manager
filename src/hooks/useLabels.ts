import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { Label } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useLabels(): {
  labels: Label[];
  addLabel: (name: string) => Promise<void>;
  updateLabel: (id: string, name: string) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  refreshLabels: () => Promise<void>;
} {
  const [labels, setLabels] = useState<Label[]>([]);

  const loadLabels = useCallback(async () => {
    const data = await storage.getLabels();
    setLabels(data);
  }, []);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const addLabel = async (name: string): Promise<void> => {
    const newLabel: Label = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
    };
    await storage.addLabel(newLabel);
    await loadLabels();
  };

  const updateLabel = async (id: string, name: string): Promise<void> => {
    const label = labels.find(l => l.id === id);
    if (!label) return;

    const updatedLabel: Label = {
      ...label,
      name,
    };
    await storage.addLabel(updatedLabel);
    await loadLabels();
  };

  const deleteLabel = async (id: string): Promise<void> => {
    // First, remove all mappings for this label
    const mappings = await storage.getTransactionLabelMapsByLabel(id);
    for (const map of mappings) {
      await storage.deleteTransactionLabelMap(map.id);
    }

    await storage.deleteLabel(id);
    await loadLabels();
  };

  return {
    labels,
    addLabel,
    updateLabel,
    deleteLabel,
    refreshLabels: loadLabels,
  };
}
