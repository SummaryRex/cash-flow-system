import { BankAccount, TransactionItem } from './types';

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'BCA Bisnis',
    accountNumber: '8830-192-881',
    bankCode: 'BCA',
    balance: 285000000,
    currency: 'IDR',
    color: 'bg-indigo-600',
    badgeText: 'Operasional Utama',
  },
  {
    id: 'acc-2',
    name: 'Mandiri Utama',
    accountNumber: '137-000-9821-41',
    bankCode: 'MANDIRI',
    balance: 165000000,
    currency: 'IDR',
    color: 'bg-amber-600',
    badgeText: 'Payroll & Reserve',
  },
  {
    id: 'acc-3',
    name: 'Kas Kecil (Petty Cash)',
    accountNumber: 'CASH-OFFICE-01',
    bankCode: 'CASH',
    balance: 18500000,
    currency: 'IDR',
    color: 'bg-emerald-600',
    badgeText: 'Tunai Kantor',
  },
  {
    id: 'acc-4',
    name: 'GoPay Corporate',
    accountNumber: '0812-9908-1122',
    bankCode: 'GOPAY',
    balance: 16500000,
    currency: 'IDR',
    color: 'bg-cyan-600',
    badgeText: 'Transport & Snack',
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generates 1,000 realistic, fast, and structured cash flow transactions
export function generate1000Transactions(): TransactionItem[] {
  const categories = [
    { name: 'Pendapatan', type: 'inflow' as const, accounts: ['BCA Bisnis', 'Mandiri Utama'] },
    { name: 'Payroll', type: 'outflow' as const, accounts: ['Mandiri Utama'] },
    { name: 'Operasional', type: 'outflow' as const, accounts: ['BCA Bisnis', 'Kas Kecil (Petty Cash)', 'GoPay Corporate'] },
    { name: 'Pemasaran', type: 'outflow' as const, accounts: ['BCA Bisnis', 'GoPay Corporate'] },
    { name: 'Aset', type: 'outflow' as const, accounts: ['BCA Bisnis', 'Mandiri Utama'] },
  ];

  const incomeTemplates = [
    { desc: 'Invoicing Termin 1 Proyek ERP Enterprise', entity: 'PT Telekomunikasi Indonesia', min: 75000000, max: 180000000 },
    { desc: 'Retainer Bulanan Digital Marketing & Tech', entity: 'PT Astra International Tbk', min: 35000000, max: 70000000 },
    { desc: 'Pelunasan Custom AI Platform Development', entity: 'PT Bank Central Asia Tbk', min: 90000000, max: 250000000 },
    { desc: 'Langganan SaaS CashFlow B2B Tahunan', entity: 'CV Surya Makmur Abadi', min: 15000000, max: 45000000 },
    { desc: 'Konsultasi Transformasi Digital & Cloud', entity: 'PT Samudera Logistik Nusantara', min: 25000000, max: 60000000 },
    { desc: 'Pembayaran Termin 2 Mobile App Commerce', entity: 'PT Global E-Commerce Indo', min: 50000000, max: 120000000 },
    { desc: 'Jasa Implementasi Data Warehouse & BI', entity: 'PT Finansial Solusi Mandiri', min: 40000000, max: 85000000 },
    { desc: 'Pendapatan Lisensi Software & API SDK', entity: 'TechCorp Asia Pte Ltd', min: 30000000, max: 95000000 },
  ];

  const expenseTemplates = [
    { cat: 'Payroll', desc: 'Payroll Gaji Pokok Tim Engineering & Dev', entity: 'Payroll Tim Tech', min: 45000000, max: 85000000, acc: 'Mandiri Utama' },
    { cat: 'Payroll', desc: 'Payroll Gaji Tim Marketing, Sales & Ops', entity: 'Payroll Tim Komersil', min: 25000000, max: 45000000, acc: 'Mandiri Utama' },
    { cat: 'Payroll', desc: 'Tunjangan & Bonus Kinerja Q2/Q3', entity: 'Bonus Kinerja Staf', min: 15000000, max: 35000000, acc: 'Mandiri Utama' },
    { cat: 'Pemasaran', desc: 'Meta Ads Instagram & Facebook Campaign', entity: 'Meta Platforms Ireland', min: 5000000, max: 22000000, acc: 'BCA Bisnis' },
    { cat: 'Pemasaran', desc: 'Google Search & YouTube Ads Performance', entity: 'Google Asia Pacific', min: 8000000, max: 28000000, acc: 'BCA Bisnis' },
    { cat: 'Pemasaran', desc: 'Sponsorship Event Tech Conference 2026', entity: 'IndoTech Summit', min: 10000000, max: 30000000, acc: 'BCA Bisnis' },
    { cat: 'Pemasaran', desc: 'Jasa Influencer & Content Creator B2B', entity: 'Agensi Media Kreatif', min: 4500000, max: 16000000, acc: 'GoPay Corporate' },
    { cat: 'Operasional', desc: 'Sewa Server Cloud AWS & Kubernetes Node', entity: 'Amazon Web Services', min: 12000000, max: 32000000, acc: 'BCA Bisnis' },
    { cat: 'Operasional', desc: 'Langganan Google Workspace & Zoom Pro', entity: 'Google Cloud Corp', min: 2500000, max: 6500000, acc: 'BCA Bisnis' },
    { cat: 'Operasional', desc: 'Sewa Dedicated Coworking Office 1 Bulan', entity: 'WeWork Coworking Space', min: 15000000, max: 25000000, acc: 'BCA Bisnis' },
    { cat: 'Operasional', desc: 'Konsumsi Meeting Klien & Coffee Pantry', entity: 'Pantry Office & GoFood', min: 350000, max: 1800000, acc: 'Kas Kecil (Petty Cash)' },
    { cat: 'Operasional', desc: 'Transportasi Tim Operasional & Grab Corp', entity: 'Grab for Business', min: 250000, max: 1200000, acc: 'GoPay Corporate' },
    { cat: 'Operasional', desc: 'Tagihan Listrik PLN & Internet Dedicated 1Gbps', entity: 'PLN & Biznet Networks', min: 4500000, max: 8500000, acc: 'BCA Bisnis' },
    { cat: 'Operasional', desc: 'Jasa Konsultan Pajak PPh 21/23 & Laporan', entity: 'Kantor Konsultan Pajak Mitra', min: 3500000, max: 7500000, acc: 'BCA Bisnis' },
    { cat: 'Aset', desc: 'Pengadaan MacBook Pro M3 untuk Tech Lead', entity: 'iBox Apple Indonesia', min: 28000000, max: 42000000, acc: 'Mandiri Utama' },
    { cat: 'Aset', desc: 'Perangkat Ergonomis & Monitor Dell 4K', entity: 'PT Toko Komputer Solusi', min: 8500000, max: 19000000, acc: 'BCA Bisnis' },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const sampleReceiptImages = [
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1621314545227-02ba402543e3?auto=format&fit=crop&q=80&w=600',
  ];

  const results: TransactionItem[] = [];

  // Create 1000 deterministic-random transactions distributed across 2026
  for (let i = 1; i <= 1000; i++) {
    // 35% inflow, 65% outflow (realistic for business volume)
    const isInflow = i % 3 === 0 || (i % 7 === 0);
    
    // Spread dates across Jan 2026 to Aug 2026 (with more weight on recent months)
    const monthIndex = Math.min(7, Math.floor((i / 1000) * 8 * (0.6 + (i % 5) * 0.1)));
    const month = months[monthIndex];
    const day = (i % 28) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${dayStr} ${month} 2026`;

    if (isInflow) {
      const tmpl = incomeTemplates[i % incomeTemplates.length];
      const variance = (i * 17) % 5000000;
      const amount = Math.round((tmpl.min + variance) / 100000) * 100000;
      const acc = (i % 2 === 0) ? 'BCA Bisnis' : 'Mandiri Utama';
      const isUnverified = i % 43 === 0;

      results.push({
        id: `tx-${i}`,
        date: dateStr,
        description: `${tmpl.desc} #${1000 + i}`,
        category: 'Pendapatan',
        amount,
        type: 'inflow',
        status: isUnverified ? 'Perlu Review' : 'Selesai',
        anomaly: false,
        accountName: acc,
        entityName: tmpl.entity,
        referenceNumber: `INV-2026-${1000 + i}`,
        receiptUrl: i % 12 === 0 ? sampleReceiptImages[i % sampleReceiptImages.length] : null,
      });
    } else {
      const tmpl = expenseTemplates[i % expenseTemplates.length];
      const variance = (i * 13) % (tmpl.max - tmpl.min);
      const amount = Math.round((tmpl.min + variance) / 50000) * 50000;
      const isAnomaly = i % 67 === 0;
      const isUnverified = isAnomaly || (i % 31 === 0);

      results.push({
        id: `tx-${i}`,
        date: dateStr,
        description: isAnomaly ? `[Anomali Lonjakan] ${tmpl.desc}` : tmpl.desc,
        category: tmpl.cat,
        amount,
        type: 'outflow',
        status: isUnverified ? 'Perlu Review' : 'Selesai',
        anomaly: isAnomaly,
        accountName: tmpl.acc,
        entityName: tmpl.entity,
        referenceNumber: `EXP-2026-${2000 + i}`,
        receiptUrl: i % 8 === 0 ? sampleReceiptImages[i % sampleReceiptImages.length] : null,
      });
    }
  }

  // Sort descending by date (recent first)
  const monthOrder: { [k: string]: number } = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8 };
  return results.sort((a, b) => {
    const parse = (d: string) => {
      const parts = d.split(' ');
      const day = parseInt(parts[0], 10) || 1;
      const m = monthOrder[parts[1]] || 1;
      return m * 100 + day;
    };
    return parse(b.date) - parse(a.date);
  });
}

export const INITIAL_TRANSACTIONS: TransactionItem[] = generate1000Transactions();

