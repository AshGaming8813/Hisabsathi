import Papa from 'papaparse';
import { autoCategorizeDescription, generateDuplicateHash } from './autoCategorize';

export interface ParsedStatementRow {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  duplicateHash: string;
}

export function parseCSVStatement(file: File): Promise<ParsedStatementRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedRows: ParsedStatementRow[] = [];

          results.data.forEach((row: any) => {
            // Flexible header lookup for typical Indian bank statements (SBI, HDFC, ICICI, Paytm, PhonePe)
            const dateRaw =
              row['Date'] ||
              row['Txn Date'] ||
              row['Transaction Date'] ||
              row['date'] ||
              row['DATE'] ||
              new Date().toISOString().split('T')[0];

            const description =
              row['Description'] ||
              row['Narration'] ||
              row['Particulars'] ||
              row['Remarks'] ||
              row['Notes'] ||
              row['description'] ||
              'Statement Entry';

            const deposit = parseFloat(
              (row['Deposit'] || row['Credit'] || row['CR'] || row['Income'] || '0').replace(
                /[^0-9.]/g,
                ''
              )
            );
            const withdrawal = parseFloat(
              (row['Withdrawal'] || row['Debit'] || row['DR'] || row['Expense'] || '0').replace(
                /[^0-9.]/g,
                ''
              )
            );

            let amount = 0;
            let rawType: 'income' | 'expense' = 'expense';

            if (deposit > 0) {
              amount = deposit;
              rawType = 'income';
            } else if (withdrawal > 0) {
              amount = withdrawal;
              rawType = 'expense';
            } else {
              // Check single amount column
              const rawAmountStr = String(row['Amount'] || row['amount'] || '0');
              const numericAmount = parseFloat(rawAmountStr.replace(/[^0-9.-]/g, ''));
              if (numericAmount < 0) {
                amount = Math.abs(numericAmount);
                rawType = 'expense';
              } else {
                amount = numericAmount;
                rawType = 'income';
              }
            }

            if (amount > 0) {
              const catRes = autoCategorizeDescription(description);
              const formattedDate = formatDateStandard(dateRaw);
              const hash = generateDuplicateHash(formattedDate, amount, description);

              parsedRows.push({
                date: formattedDate,
                description,
                amount,
                type: catRes.type === 'transfer' ? 'transfer' : rawType,
                category: catRes.category,
                duplicateHash: hash,
              });
            }
          });

          resolve(parsedRows);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

function formatDateStandard(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    // Try DD/MM/YYYY or DD-MM-YYYY format common in India
    const parts = dateStr.split(/[\/\.-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  } catch (e) {
    // fallback to today
  }
  return new Date().toISOString().split('T')[0];
}
