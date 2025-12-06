import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import type { TransactionType } from '../types';
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

interface Props {
  type: TransactionType;
  onClose: () => void;
}

export function CategoryManager({ type, onClose }: Props): React.JSX.Element {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredCategories = categories
    .filter(c => c.type === type)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim(), type);
    setNewCategoryName('');
  };

  const startEditing = (category: { id: string; name: string }): void => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const saveEdit = async (): Promise<void> => {
    if (editingId && editName.trim()) {
      await updateCategory(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <Card className="w-full h-full max-h-[600px] flex flex-col shadow-xl border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">
          Manage {type === 'income' ? 'Income' : 'Expense'} Categories
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newCategoryName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <Separator />

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
          {filteredCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              {editingId === category.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={saveEdit}
                    className="h-8 w-8 text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-sm">{category.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(category)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(category.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No categories found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
