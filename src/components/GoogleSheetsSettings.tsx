import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Check, Cloud, CloudOff, ExternalLink, Loader2 } from 'lucide-react';
import { storage } from '../services/storage';
import { useEffect, useState } from 'react';
import formatLastSync from '../lib/time';

export function GoogleSheetsSettings(): React.JSX.Element {
  const { isAuthenticated, user, isLoading: authLoading, signIn, signOut } = useGoogleAuth();
  const { isSyncing, lastSync, syncError, syncNow } = useGoogleSheets();
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
      <CardContent className="space-y-3">
        {/* Authentication Status (compact) */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Connection</p>
            {isAuthenticated ? (
              <p className="text-sm text-muted-foreground truncate">{user || 'Connected'}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {isAuthenticated ? (
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white"
                role="status"
                aria-label="Connected"
              >
                <Check className="h-4 w-4" />
              </span>
            ) : (
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600"
                role="status"
                aria-label="Disconnected"
              >
                <CloudOff className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        {/* Connect/Disconnect */}
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
            {/* Last Sync Row (matching Connection row style) */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-sm text-muted-foreground">
                  {formatLastSync(lastSync, { nullLabel: 'Never', justNowLabel: 'Just now' })}
                </p>
                {syncError && (
                  <p className="text-xs mt-1 text-destructive">
                    <span className="inline-flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {syncError}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <Button onClick={syncNow} disabled={isSyncing} size="sm" variant="outline">
                  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sync Now'}
                </Button>
              </div>
            </div>

            {/* Subtle link to sheet */}
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground inline-flex items-center gap-1"
              >
                Open in Google Sheets
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <div className="pt-2">
              <Button onClick={signOut} variant="destructive" className="w-full">
                Disconnect Google Account
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
