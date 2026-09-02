export type TransactionType = 'inflow' | 'outflow' | 'transfer';

export type TransactionCategory =
  | 'Pendapatan'
  | 'Pemasaran'
  | 'Aset'
  | 'Payroll'
  | 'Operasional'
  | 'Gaji & Payroll'
  | 'Invoicing Klien'
  | 'Sewa & Operasional'
  | 'Pajak & Legal'
  | 'Lainnya';

export type AccountName =
  | 'BCA Bisnis'
  | 'Mandiri Utama'
  | 'Kas Kecil (Petty Cash)'
  | 'GoPay Corporate';

export type TransactionStatus = 'Selesai' | 'Perlu Review';

export interface TransactionItem {
  id: string | number;
  date: string; // '12 Aug 2024' or '2024-08-12'
  rawDate?: string;
  description: string;
  category: TransactionCategory | string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  anomaly?: boolean;
  receiptUrl?: string | null;
  accountName?: AccountName | string;
  entityName?: string;
  referenceNumber?: string;
  aiConfidence?: number;
  rawSourceType?: 'screenshot' | 'ocr_receipt' | 'text' | 'manual';
}

export interface BankAccount {
  id: string;
  name: AccountName;
  accountNumber: string;
  bankCode: string;
  balance: number;
  currency: 'IDR';
  color: string;
  badgeText: string;
}

export interface CashFlowMetrics {
  totalLiquidBalance: number;
  totalInflowThisMonth: number;
  totalOutflowThisMonth: number;
  netCashFlowThisMonth: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  unverifiedCount: number;
  anomalyCount: number;
  forecastEndMonth: number;
}
