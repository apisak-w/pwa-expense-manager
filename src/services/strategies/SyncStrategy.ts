import type { SyncItem } from '../../types';

export interface SyncStrategy {
  syncItem(item: SyncItem): Promise<void>;
}
