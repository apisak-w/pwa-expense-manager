import { OfflineIndicator } from './components/OfflineIndicator';
import { UpdateNotification } from './components/UpdateNotification';
import { AddExpenseForm } from './components/AddExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { GoogleSheetsSettings } from './components/GoogleSheetsSettings';
import { SyncIndicator } from './components/SyncIndicator';
import { useExpenses } from './hooks/useExpenses';
import { useRestrictedMode } from './hooks/useRestrictedMode';
import { Badge } from './components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Settings } from 'lucide-react';
import { useState } from 'react';

function App(): React.JSX.Element {
  const { expenses, addExpense, deleteExpense, toggleCleared } = useExpenses();
  const { isRestricted } = useRestrictedMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
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
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Recent Transactions</h2>
          <ExpenseList
            expenses={expenses}
            onDelete={deleteExpense}
            onToggleCleared={toggleCleared}
          />
        </div>
      </div>

      <OfflineIndicator />
      <UpdateNotification />
      <SyncIndicator />
    </div>
  );
}

export default App;
