import type { Expense } from '../types';
import dayjs from 'dayjs';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-center py-4">
          No expenses yet. Add your first expense above!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {expenses.map(expense => (
          <Card
            key={expense.id}
            className="transition-all hover:shadow-md border border-border bg-card"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-base text-foreground truncate">
                      {expense.description}
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium shrink-0">
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dayjs(expense.date).format('MMM D, YYYY')}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-xl text-foreground">
                    ${expense.amount.toFixed(2)}
                  </span>
                  {expense.synced ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Synced</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pending sync</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(expense.id)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete expense</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
