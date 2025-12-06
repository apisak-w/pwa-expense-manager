import { useSync } from '../hooks/useSync';

export function SyncManager(): null {
  useSync();
  return null;
}
