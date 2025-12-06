import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { AlertCircle, Cloud, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import formatLastSync from '../lib/time';

export function SyncIndicator(): React.JSX.Element {
  const { isAuthenticated } = useGoogleAuth();
  const { isSyncing, lastSync, syncError } = useGoogleSheets();

  if (!isAuthenticated) return <></>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-20 right-4 z-40 rounded-full bg-background p-3 shadow-lg border">
            {isSyncing ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : syncError ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Cloud className="h-5 w-5 text-green-600" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <div className="text-sm">
            {isSyncing ? (
              <p>Syncing with Google Sheets...</p>
            ) : syncError ? (
              <>
                <p className="font-medium text-destructive">Sync Error</p>
                <p className="text-xs">{syncError}</p>
              </>
            ) : (
              <p>
                {formatLastSync(lastSync, {
                  nullLabel: 'Not synced yet',
                  justNowLabel: 'just now',
                  prefix: 'Synced',
                })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
