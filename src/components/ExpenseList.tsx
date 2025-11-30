import type { Expense } from '../types';
import { format } from 'date-fns';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';

interface Props {
    expenses: Expense[];
    onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: Props) {
    if (expenses.length === 0) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No expenses yet.</p>
            </div>
        );
    }

    return (
        <div className="expense-list">
            {expenses.map((expense) => (
                <div key={expense.id} className="glass-panel expense-item" style={{ marginBottom: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{expense.description}</span>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'var(--text-muted)'
                            }}>{expense.category}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {format(new Date(expense.date), 'MMM d, yyyy')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>${expense.amount.toFixed(2)}</span>
                        {expense.synced ? (
                            <CheckCircle size={16} color="var(--status-success)" />
                        ) : (
                            <Clock size={16} color="var(--status-warning)" />
                        )}
                        <button
                            onClick={() => onDelete(expense.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-error)', padding: '0.25rem' }}
                            aria-label="Delete expense"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
