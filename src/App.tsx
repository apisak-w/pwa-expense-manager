import { OfflineIndicator } from './components/OfflineIndicator';
import { AddExpenseForm } from './components/AddExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { useExpenses } from './hooks/useExpenses';
import { useRestrictedMode } from './hooks/useRestrictedMode';
import { Badge } from './components/ui/badge';

function App() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { isRestricted } = useRestrictedMode();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Expense Manager</h1>
        {isRestricted && <Badge variant="destructive">Offline Mode</Badge>}
      </header>

      <AddExpenseForm onAdd={addExpense} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        <ExpenseList expenses={expenses} onDelete={deleteExpense} />
      </div>

      <OfflineIndicator />
    </div>
  );
}

export default App;
