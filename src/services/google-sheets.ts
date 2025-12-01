import type { Expense } from '../types';

const SPREADSHEET_NAME = 'Expense Manager Sync';

export interface SheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export class GoogleSheetsService {
  private accessToken: string | null = null;
  private spreadsheetId: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  setSpreadsheetId(id: string): void {
    this.spreadsheetId = id;
  }

  getSpreadsheetId(): string | null {
    return this.spreadsheetId;
  }

  /**
   * Initialize or find the sync spreadsheet
   */
  async initializeSpreadsheet(): Promise<SheetMetadata> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Try to find existing spreadsheet first
    const existing = await this.findSpreadsheet();
    if (existing) {
      this.spreadsheetId = existing.spreadsheetId;
      return existing;
    }

    // Create new spreadsheet
    return await this.createSpreadsheet();
  }

  /**
   * Find existing sync spreadsheet
   */
  private async findSpreadsheet(): Promise<SheetMetadata | null> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search for spreadsheet: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      return {
        spreadsheetId: file.id,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${file.id}`,
      };
    }

    return null;
  }

  /**
   * Create new sync spreadsheet with proper structure
   */
  private async createSpreadsheet(): Promise<SheetMetadata> {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_NAME,
        },
        sheets: [
          {
            properties: {
              title: 'Transactions',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
          {
            properties: {
              title: 'Metadata',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
    }

    const data = await response.json();
    this.spreadsheetId = data.spreadsheetId;

    // Set up header row
    await this.setupHeaders();

    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
    };
  }

  /**
   * Set up header row for transactions sheet
   */
  private async setupHeaders(): Promise<void> {
    const headers = [
      ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description', 'Cleared', 'Updated At'],
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Transactions!A1:H1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: headers,
        }),
      }
    );

    // Format header row (bold)
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      }),
    });
  }

  /**
   * Read all transactions from Google Sheets
   */
  async readTransactions(): Promise<Expense[]> {
    if (!this.spreadsheetId || !this.accessToken) {
      throw new Error('Not initialized');
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Transactions!A2:H`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to read transactions: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    return rows.map((row: string[]) => ({
      id: row[0],
      date: row[1],
      type: row[2] as 'income' | 'expense',
      category: row[3],
      amount: parseFloat(row[4]),
      description: row[5],
      isCleared: row[6] === 'true',
      updatedAt: parseInt(row[7]),
      synced: true,
    }));
  }

  /**
   * Write transactions to Google Sheets (batch operation)
   */
  async writeTransactions(expenses: Expense[]): Promise<void> {
    if (!this.spreadsheetId || !this.accessToken) {
      throw new Error('Not initialized');
    }

    // Clear existing data (except header)
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Transactions!A2:H:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (expenses.length === 0) return;

    // Prepare rows
    const rows = expenses.map(expense => [
      expense.id,
      expense.date,
      expense.type,
      expense.category,
      expense.amount.toString(),
      expense.description,
      expense.isCleared.toString(),
      expense.updatedAt.toString(),
    ]);

    // Write all rows
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Transactions!A2:H?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );
  }

  /**
   * Update a single transaction in the sheet
   */
  async updateTransaction(expense: Expense): Promise<void> {
    if (!this.spreadsheetId || !this.accessToken) {
      throw new Error('Not initialized');
    }

    // Find the row with this ID
    const transactions = await this.readTransactions();
    const rowIndex = transactions.findIndex(t => t.id === expense.id);

    if (rowIndex === -1) {
      // Transaction not found, append it
      await this.appendTransaction(expense);
      return;
    }

    // Update the row (row index + 2 because: 1 for header, 1 for 0-based to 1-based)
    const sheetRow = rowIndex + 2;
    const row = [
      expense.id,
      expense.date,
      expense.type,
      expense.category,
      expense.amount.toString(),
      expense.description,
      expense.isCleared.toString(),
      expense.updatedAt.toString(),
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Transactions!A${sheetRow}:H${sheetRow}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );
  }

  /**
   * Append a new transaction to the sheet
   */
  private async appendTransaction(expense: Expense): Promise<void> {
    const row = [
      expense.id,
      expense.date,
      expense.type,
      expense.category,
      expense.amount.toString(),
      expense.description,
      expense.isCleared.toString(),
      expense.updatedAt.toString(),
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Transactions!A:H:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );
  }

  /**
   * Delete a transaction from the sheet
   */
  async deleteTransaction(id: string): Promise<void> {
    if (!this.spreadsheetId || !this.accessToken) {
      throw new Error('Not initialized');
    }

    // Find the row with this ID
    const transactions = await this.readTransactions();
    const rowIndex = transactions.findIndex(t => t.id === id);

    if (rowIndex === -1) return; // Not found, nothing to delete

    // Delete the row (index + 1 for header, +1 for 0-based to 1-based)
    const sheetRow = rowIndex + 1; // +1 for header (0-indexed sheet ID)

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // First sheet (Transactions)
                dimension: 'ROWS',
                startIndex: sheetRow,
                endIndex: sheetRow + 1,
              },
            },
          },
        ],
      }),
    });
  }

  /**
   * Get metadata from sheet
   */
  async getMetadata(): Promise<{ lastSync: number | null }> {
    if (!this.spreadsheetId || !this.accessToken) {
      throw new Error('Not initialized');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Metadata!A1:B10`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return { lastSync: null };

      const data = await response.json();
      const rows = data.values || [];

      const lastSyncRow = rows.find((row: string[]) => row[0] === 'lastSync');
      return {
        lastSync: lastSyncRow ? parseInt(lastSyncRow[1]) : null,
      };
    } catch {
      return { lastSync: null };
    }
  }

  /**
   * Update metadata in sheet
   */
  async setMetadata(metadata: { lastSync: number }): Promise<void> {
    if (!this.spreadsheetId || !this.accessToken) {
      throw new Error('Not initialized');
    }

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Metadata!A1:B1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [['lastSync', metadata.lastSync.toString()]],
        }),
      }
    );
  }
}

export const googleSheetsService = new GoogleSheetsService();
