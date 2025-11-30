import type { Expense } from '../types';
import dayjs from 'dayjs';
import { CheckCircle2, Circle, Clock, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onToggleCleared: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete, onToggleCleared }: Props) {
  if (expenses.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-center py-4">
          No transactions yet. Add your first one above!
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
                    {expense.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <span className="font-semibold text-base text-foreground truncate">
                      {expense.description}
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium shrink-0">
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{dayjs(expense.date).format('MMM D, YYYY')}</span>
                    {expense.isCleared ? (
                      <span className="text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">
                        Cleared
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded">
                        Uncleared
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`font-bold text-xl ${expense.type === 'income' ? 'text-green-600' : 'text-foreground'}`}
                  >
                    {expense.type === 'income' ? '+' : ''}${expense.amount.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleCleared(expense.id)}
                          className={`h-9 w-9 ${expense.isCleared ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {expense.isCleared ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{expense.isCleared ? 'Mark as uncleared' : 'Mark as cleared'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {expense.synced ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-9 w-9 flex items-center justify-center cursor-help">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Synced</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-9 w-9 flex items-center justify-center cursor-help">
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
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete transaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
