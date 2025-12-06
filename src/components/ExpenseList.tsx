import type { Expense } from '../types';
import dayjs from 'dayjs';
import { CheckCircle2, Circle, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
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

export function ExpenseList({ expenses, onDelete, onToggleCleared }: Props): React.JSX.Element {
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
            className={`transition-all hover:shadow-md border border-border bg-card ${
              !expense.synced ? 'opacity-75 italic' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {/* Top Row: Type, Category, Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expense.type === 'income' ? (
                      <TrendingUp className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <Badge variant="outline" className="text-xs font-medium">
                      {expense.category}
                    </Badge>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      expense.type === 'income' ? 'text-green-600' : 'text-foreground'
                    }`}
                  >
                    {expense.type === 'income' ? '+' : ''}${expense.amount.toFixed(2)}
                  </span>
                </div>

                {/* Middle Row: Description */}
                <div className="font-medium text-base truncate">{expense.description}</div>

                {/* Bottom Row: Date, Cleared, Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="text-sm text-muted-foreground italic">
                    {dayjs(expense.createdAt || expense.updatedAt || expense.date).format(
                      'MMM D, YYYY h:mm A'
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {expense.isCleared ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 h-5 bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0"
                      >
                        Cleared
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 h-5 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-0"
                      >
                        Uncleared
                      </Badge>
                    )}

                    <div className="flex items-center gap-0.5 ml-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${
                              expense.isCleared ? 'text-green-600' : 'text-muted-foreground'
                            }`}
                            onClick={e => {
                              e.stopPropagation();
                              onToggleCleared(expense.id);
                            }}
                          >
                            {expense.isCleared ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{expense.isCleared ? 'Mark as uncleared' : 'Mark as cleared'}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={e => {
                              e.stopPropagation();
                              onDelete(expense.id);
                            }}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
