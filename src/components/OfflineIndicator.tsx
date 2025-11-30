import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Alert, AlertDescription } from './ui/alert';

export function OfflineIndicator(): React.JSX.Element | null {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Alert
      variant="warning"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md backdrop-blur-sm"
    >
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        You are offline. Changes will sync when you reconnect.
      </AlertDescription>
    </Alert>
  );
}
