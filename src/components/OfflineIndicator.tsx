import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Card } from './ui/card';

export function OfflineIndicator() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2">
        <WifiOff className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-yellow-500">
          You are offline. Changes will sync when you reconnect.
        </span>
      </div>
    </Card>
  );
}
