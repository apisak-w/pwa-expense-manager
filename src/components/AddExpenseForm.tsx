import { useEffect, useState } from 'react';
import type { Expense, TransactionType } from '../types';
import dayjs from 'dayjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCategories } from '../hooks/useCategories';
import { useLabels } from '../hooks/useLabels';
import { CategoryManager } from './CategoryManager';
import { LabelManager } from './LabelManager';
import { CheckCircle2, Circle, Settings, Tag } from 'lucide-react';

interface Props {
  onAdd: (
    expense: Omit<Expense, 'id' | 'synced' | 'updatedAt'>,
    labelIds?: string[]
  ) => Promise<void>;
}

export function AddExpenseForm({ onAdd }: Props): React.JSX.Element {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isCleared, setIsCleared] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const { getCategoriesByType, refreshCategories } = useCategories();
  const { labels, refreshLabels } = useLabels();
  const availableCategories = getCategoriesByType(type);

  // Reset category when type changes
  useEffect(() => {
    setCategory('');
  }, [type]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    setIsSubmitting(true);
    await onAdd(
      {
        amount: parseFloat(amount),
        description,
        category,
        date,
        type,
        isCleared,
      },
      selectedLabelIds
    );
    setIsSubmitting(false);

    // Reset form
    setAmount('');
    setDescription('');
    // Keep current type and category
    setDate(dayjs().format('YYYY-MM-DD'));
    setIsCleared(true);
    setSelectedLabelIds([]);
  };

  if (showCategoryManager) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <CategoryManager
            type={type}
            onClose={async () => {
              await refreshCategories();
              setShowCategoryManager(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (showLabelManager) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <LabelManager
            onClose={async () => {
              await refreshLabels();
              setShowLabelManager(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Transaction Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  type === 'expense'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  type === 'income'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Income
              </button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 text-base"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={type === 'expense' ? 'What did you buy?' : 'Source of income'}
                className="h-11 text-base"
                required
              />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category" className="text-sm font-medium text-foreground">
                    Category
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryManager(true)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Settings size={12} /> Manage
                  </button>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Labels (Optional)</Label>
                  <button
                    type="button"
                    onClick={() => setShowLabelManager(true)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Tag size={12} /> Manage
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
                  {labels
                    .filter(label => selectedLabelIds.includes(label.id))
                    .map(label => (
                      <div
                        key={label.id}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        {label.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLabelIds(prev => prev.filter(id => id !== label.id))
                          }
                          className="text-primary hover:text-primary/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  {labels.length > 0 && (
                    <Select
                      value=""
                      onValueChange={value => {
                        if (value && !selectedLabelIds.includes(value)) {
                          setSelectedLabelIds(prev => [...prev, value]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-auto h-8 border-none shadow-none p-0 bg-transparent">
                        <SelectValue placeholder="Add label..." />
                      </SelectTrigger>
                      <SelectContent>
                        {labels
                          .filter(label => !selectedLabelIds.includes(label.id))
                          .map(label => (
                            <SelectItem key={label.id} value={label.id}>
                              {label.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                  {labels.length === 0 && (
                    <span className="text-muted-foreground text-sm">No labels available</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCleared(!isCleared)}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                {isCleared ? (
                  <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                  <Circle className="text-muted-foreground" size={20} />
                )}
                <span>Mark as cleared</span>
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-11 text-base font-semibold mt-2 ${
                type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
