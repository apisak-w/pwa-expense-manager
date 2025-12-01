import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { Cloud, Loader2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function SyncIndicator(): React.JSX.Element {
  const { isAuthenticated } = useGoogleAuth();
  const { isSyncing, lastSync, syncError } = useGoogleSheets();

  if (!isAuthenticated) return <></>;

  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Not synced yet';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Synced just now';
    if (diffMins < 60) return `Synced ${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Synced ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Synced ${diffDays}d ago`;
  };

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
              <p>{formatLastSync(lastSync)}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
