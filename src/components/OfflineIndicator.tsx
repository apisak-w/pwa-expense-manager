import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineIndicator() {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="offline-indicator">
            <WifiOff size={16} />
            <span>You are offline. Changes will sync when you reconnect.</span>
        </div>
    );
}
