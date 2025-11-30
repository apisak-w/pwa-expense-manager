import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import type { TransactionType } from '../types';
import { Plus, Trash2, X } from 'lucide-react';

interface Props {
  type: TransactionType;
  onClose: () => void;
}

export function CategoryManager({ type, onClose }: Props) {
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories
    .filter(c => c.type === type)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim(), type);
    setNewCategoryName('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        <X size={20} />
      </button>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        Manage {type === 'income' ? 'Income' : 'Expense'} Categories
      </h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          className="input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newCategoryName.trim()}>
          <Plus size={20} />
        </button>
      </form>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="input"
          style={{ width: '100%' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {filteredCategories.map(category => (
          <div
            key={category.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.5rem',
            }}
          >
            <span>{category.name}</span>
            {!category.isDefault && (
              <button
                onClick={() => deleteCategory(category.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--status-error)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
            No categories found.
          </p>
        )}
      </div>
    </div>
  );
}
