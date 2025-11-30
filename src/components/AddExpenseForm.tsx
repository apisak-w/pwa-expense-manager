import { useState } from 'react';
import type { Expense } from '../types';

interface Props {
    onAdd: (expense: Omit<Expense, 'id' | 'synced' | 'updatedAt'>) => Promise<void>;
}

export function AddExpenseForm({ onAdd }: Props) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
        setDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="input"
                        placeholder="0.00"
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="input"
                        placeholder="What did you buy?"
                        required
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Category</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="input"
                        >
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '0.5rem', width: '100%' }}>
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                </button>
            </div>
        </form>
    );
}
