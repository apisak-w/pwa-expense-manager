import type { SyncStrategy } from './SyncStrategy';
import type { SyncItem, Expense } from '../../types';
import { googleSheetsService } from '../google-sheets';
import { storage } from '../storage';

export class GoogleSheetsSyncStrategy implements SyncStrategy {
  async syncItem(item: SyncItem): Promise<void> {
    const expense = item.payload as Expense;

    switch (item.action) {
      case 'create':
        // For create, we might want to append.
        // Note: googleSheetsService.appendTransaction takes an Expense.
        // We should ensure the expense has all required fields.
        await googleSheetsService.updateTransaction(expense);
        // updateTransaction handles both update and create (if not found)
        // But let's check if we want to be more specific.
        // The plan said: create -> appendTransaction (or updateTransaction)
        // updateTransaction in google-sheets.ts does: findIndex -> if -1 append, else update.
        // So updateTransaction is safe for both.
        break;
      case 'update':
        await googleSheetsService.updateTransaction(expense);
        break;
      case 'delete':
        // For delete, payload might be just { id: string } or the full expense.
        // In sync.ts it was cast to { id: string }.
        await googleSheetsService.deleteTransaction((item.payload as { id: string }).id);
        break;
    }

    // After successful sync to Google Sheets, update the local database
    // to mark the expense as synced. This ensures the UI reflects the
    // correct status (e.g., removing "unsynced" indicators).
    if (item.action !== 'delete') {
      await storage.addExpense({ ...expense, synced: true });
    }
  }
}
