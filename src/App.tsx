import { OfflineIndicator } from './components/OfflineIndicator';
import { AddExpenseForm } from './components/AddExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { useExpenses } from './hooks/useExpenses';
import { useRestrictedMode } from './hooks/useRestrictedMode';

function App() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { isRestricted } = useRestrictedMode();

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Expense Manager</h1>
        {isRestricted && (
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Offline Mode</span>
        )}
      </header>

      <AddExpenseForm onAdd={addExpense} />

      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Expenses</h2>
        <ExpenseList expenses={expenses} onDelete={deleteExpense} />
      </div>

      <OfflineIndicator />
    </div>
  )
}

export default App
