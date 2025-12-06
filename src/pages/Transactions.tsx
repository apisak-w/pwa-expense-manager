import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { ExpenseList } from '../components/ExpenseList';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { ArrowLeft, Search, X } from 'lucide-react';
import dayjs from 'dayjs';

export function Transactions(): React.JSX.Element {
  const { expenses, deleteExpense, toggleCleared } = useExpenses();
  const { categories } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'));

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Filter by Search Query
      if (
        searchQuery &&
        !expense.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !expense.amount.toString().includes(searchQuery)
      ) {
        return false;
      }

      // Filter by Type
      if (selectedType !== 'all' && expense.type !== selectedType) {
        return false;
      }

      // Filter by Category
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
        return false;
      }

      // Filter by Month
      if (selectedMonth) {
        const expenseMonth = dayjs(expense.date).format('YYYY-MM');
        if (expenseMonth !== selectedMonth) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, searchQuery, selectedType, selectedCategory, selectedMonth]);

  const clearFilters = (): void => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedMonth(dayjs().format('YYYY-MM'));
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedMonth !== dayjs().format('YYYY-MM');

  return (
    <div className="pb-20 max-w-3xl mx-auto px-6 py-12">
      <header className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Transactions</h1>
        <p className="text-muted-foreground">
          {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} found
        </p>
      </header>

      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="col-span-2 md:col-span-1">
            <Input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      <ExpenseList
        expenses={filteredExpenses}
        onDelete={deleteExpense}
        onToggleCleared={toggleCleared}
      />
    </div>
  );
}
