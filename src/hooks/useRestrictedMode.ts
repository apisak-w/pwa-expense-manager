import { useNetworkStatus } from './useNetworkStatus';

export type RestrictedAction =
  | 'sync'
  | 'analytics'
  | 'backup'
  | 'add_expense'
  | 'edit_expense'
  | 'delete_expense';

export function useRestrictedMode(): {
  isRestricted: boolean;
  canPerformAction: (action: RestrictedAction) => boolean;
} {
  const isOnline = useNetworkStatus();
  const isRestricted = !isOnline;

  const canPerformAction = (action: RestrictedAction): boolean => {
    if (isOnline) return true;

    // Actions that require online connectivity
    const onlineOnlyActions: RestrictedAction[] = ['sync', 'analytics', 'backup'];

    if (onlineOnlyActions.includes(action)) {
      return false;
    }

    // Actions allowed offline (local-first)
    return true;
  };

  return { isRestricted, canPerformAction };
}
