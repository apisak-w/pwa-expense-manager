import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function UpdateNotification(): React.JSX.Element | null {
  const [showReload, setShowReload] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      console.log('Service Worker registered:', swUrl);

      // Check for updates every hour
      if (registration) {
        setInterval(
          () => {
            console.log('Checking for updates...');
            registration.update();
          },
          60 * 60 * 1000
        ); // 1 hour
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowReload(true);
    }
  }, [needRefresh]);

  const handleUpdate = (): void => {
    setShowReload(false);
    setNeedRefresh(false);
    updateServiceWorker(true);
  };

  const handleDismiss = (): void => {
    setShowReload(false);
    setNeedRefresh(false);
  };

  if (!showReload) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">Update Available</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A new version of the app is available. Reload to get the latest features and
              improvements.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
