import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Loader2, Cloud, CloudOff, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { storage } from '../services/storage';
import { useState, useEffect } from 'react';
import formatLastSync from '../lib/time';

export function GoogleSheetsSettings(): React.JSX.Element {
  const { isAuthenticated, user, isLoading: authLoading, signIn, signOut } = useGoogleAuth();
  const {
    isSyncing,
    lastSync,
    syncError,
    syncNow,
    enableAutoSync,
    disableAutoSync,
    isAutoSyncEnabled,
  } = useGoogleSheets();
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      storage.getSyncMetadata().then(metadata => {
        if (metadata.spreadsheetId) {
          setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${metadata.spreadsheetId}`);
        }
      });
    }
  }, [isAuthenticated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Google Sheets Sync
        </CardTitle>
        <CardDescription>
          Automatically sync your transactions with Google Sheets for backup and analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Connection Status</p>
            {isAuthenticated && user ? (
              <p className="text-sm text-muted-foreground">{user}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>
          <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
            {isAuthenticated ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <CloudOff className="mr-1 h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        <Separator />

        {/* Connect/Disconnect Button */}
        {!isAuthenticated ? (
          <Button onClick={signIn} disabled={authLoading} className="w-full">
            {authLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Google Account'
            )}
          </Button>
        ) : (
          <>
            {/* Sync Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-sm text-muted-foreground">
                  {formatLastSync(lastSync, { nullLabel: 'Never', justNowLabel: 'Just now' })}
                </p>
              </div>

              {syncError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {syncError}
                </div>
              )}

              {isSyncing && (
                <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing with Google Sheets...
                </div>
              )}
            </div>

            <Separator />

            {/* Sync Controls */}
            <div className="space-y-3">
              <Button onClick={syncNow} disabled={isSyncing} className="w-full">
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </Button>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-Sync</p>
                  <p className="text-xs text-muted-foreground">Sync every 5 minutes</p>
                </div>
                <Button
                  variant={isAutoSyncEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={isAutoSyncEnabled ? disableAutoSync : enableAutoSync}
                >
                  {isAutoSyncEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {spreadsheetUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer">
                    Open in Google Sheets
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            <Separator />

            <Button onClick={signOut} variant="destructive" className="w-full">
              Disconnect Google Account
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
