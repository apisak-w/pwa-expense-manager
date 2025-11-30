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
      <div className="space-y-2">
        {expenses.map(expense => (
          <Card key={expense.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">{expense.description}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dayjs(expense.date).format('MMM D, YYYY')}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-lg">${expense.amount.toFixed(2)}</span>
                  {expense.synced ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Synced</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Clock className="h-4 w-4 text-yellow-500" />
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
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
