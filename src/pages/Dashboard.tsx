import { Link } from 'react-router-dom';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Footer } from '../components/Footer';
import { useExpenses } from '../hooks/useExpenses';
import { useRestrictedMode } from '../hooks/useRestrictedMode';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowRight, Settings } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { GoogleSheetsSettings } from '../components/GoogleSheetsSettings';

export function Dashboard(): React.JSX.Element {
  const { expenses, addExpense, deleteExpense, toggleCleared } = useExpenses();
  const { isRestricted } = useRestrictedMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Show only recent 5 transactions on dashboard
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="pb-20 max-w-3xl mx-auto px-6 py-12">
      {/* Header with Mailchimp-style friendly spacing */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Expense Manager</h1>
          <div className="flex items-center gap-2">
            {isRestricted && (
              <Badge variant="destructive" className="text-xs">
                Offline Mode
              </Badge>
            )}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <GoogleSheetsSettings />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mt-2">Track your income and expenses</p>
      </header>

      {/* Form Section */}
      <div className="mb-10">
        <AddExpenseForm onAdd={addExpense} />
      </div>

      {/* Expenses List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ExpenseList
          expenses={recentExpenses}
          onDelete={deleteExpense}
          onToggleCleared={toggleCleared}
        />
      </div>

      <Footer />
    </div>
  );
}
