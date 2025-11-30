import { useState } from 'react';
import type { Expense } from '../types';
import dayjs from 'dayjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
  onAdd: (expense: Omit<Expense, 'id' | 'synced' | 'updatedAt'>) => Promise<void>;
}

export function AddExpenseForm({ onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsSubmitting(true);
    await onAdd({
      amount: parseFloat(amount),
      description,
      category,
      date,
    });
    setIsSubmitting(false);

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('Food');
    setDate(dayjs().format('YYYY-MM-DD'));
  };

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
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
                placeholder="What did you buy?"
                className="h-11 text-base"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="h-11 text-base"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base font-semibold mt-2"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
