import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_TRANSACTIONS, INITIAL_ACCOUNTS, formatCurrency, generate1000Transactions } from './data';
import { TransactionItem, CashFlowMetrics } from './types';
import { SmartUploadModal } from './components/SmartUploadModal';
import { ManualTransactionModal } from './components/ManualTransactionModal';
import { ReceiptViewModal } from './components/ReceiptViewModal';
import { FinAIChatModal } from './components/FinAIChatModal';

// --- Icons SVG (Strictly matching Figma UI) ---
const IconLayoutGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);
const IconArrowUpRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
);
const IconArrowDownLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 17H7V7"/><path d="M17 7 7 17"/></svg>
);
const IconWallet = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const IconTrendingUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
const IconAlertTriangle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
const IconMessageCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);
const IconActivity = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const IconRefreshCw = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
);
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    try {
      // Force load the new 1000 transactions if cache is empty or has old small dataset
      const saved = localStorage.getItem('finai_cashflow_txs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          return parsed;
        }
      }
      localStorage.removeItem('finai_cashflow_txs');
    } catch {
      // fallback
    }
    return INITIAL_TRANSACTIONS;
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const [showSmartUpload, setShowSmartUpload] = useState(false);
  const [showFinAI, setShowFinAI] = useState(false);
  const [receiptToView, setReceiptToView] = useState<string | null>(null);

  // Deletion & Action Modals
  const [txToDelete, setTxToDelete] = useState<TransactionItem | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToastMessage({ text, type });
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filters for Transactions table
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [timeFilter, setTimeFilter] = useState('Semua Waktu');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unreviewed' | 'anomaly'>('all');
  const [chartPeriod, setChartPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Pagination State (Default 20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, timeFilter, statusFilter, pageSize]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('finai_cashflow_txs_v2', JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Super-efficient Single-Pass Metrics & Aggregations Calculation (O(N) - <1ms for 1000 items)
  const { metrics, accounts, categoryBreakdown, chartData } = useMemo(() => {
    let totalInflowAll = 0;
    let totalOutflowAll = 0;
    let inflowAugust = 0;
    let outflowAugust = 0;
    let unverifiedCount = 0;
    let anomalyCount = 0;

    // Accounts net balances
    const accBalances: { [key: string]: number } = {
      'BCA Bisnis': 285000000,
      'Mandiri Utama': 165000000,
      'Kas Kecil (Petty Cash)': 18500000,
      'GoPay Corporate': 16500000,
    };

    // Category breakdown for expenses
    const catExpenses: { [key: string]: number } = {};

    // Chart Buckets
    // August 2026 buckets: 01-04, 05-08, 09-12, 13-16, 17-20, 21-23
    const augBuckets = [0, 0, 0, 0, 0, 0];
    const qTotals = { q1: 0, q2: 0, q3: 0 };
    let ytd2026Total = 0;

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const amt = tx.amount || 0;

      if (tx.type === 'inflow') {
        totalInflowAll += amt;
        if (accBalances[tx.accountName] !== undefined) {
          accBalances[tx.accountName] += amt;
        }
      } else {
        totalOutflowAll += amt;
        if (accBalances[tx.accountName] !== undefined) {
          accBalances[tx.accountName] -= amt;
        }
        catExpenses[tx.category] = (catExpenses[tx.category] || 0) + amt;
      }

      if (tx.status === 'Perlu Review') unverifiedCount++;
      if (tx.anomaly) anomalyCount++;

      // Date parsing for August 2026 & Quarters
      const dateParts = tx.date.split(' ');
      const day = parseInt(dateParts[0], 10) || 1;
      const month = dateParts[1];

      if (month === 'Aug') {
        if (tx.type === 'inflow') inflowAugust += amt;
        else outflowAugust += amt;

        if (day <= 4) augBuckets[0] += amt;
        else if (day <= 8) augBuckets[1] += amt;
        else if (day <= 12) augBuckets[2] += amt;
        else if (day <= 16) augBuckets[3] += amt;
        else if (day <= 20) augBuckets[4] += amt;
        else augBuckets[5] += amt;
      }

      // Quarters (Jan-Mar = Q1, Apr-Jun = Q2, Jul-Sep = Q3)
      if (month === 'Jan' || month === 'Feb' || month === 'Mar') qTotals.q1 += amt;
      else if (month === 'Apr' || month === 'May' || month === 'Jun') qTotals.q2 += amt;
      else if (month === 'Jul' || month === 'Aug' || month === 'Sep') qTotals.q3 += amt;

      ytd2026Total += amt;
    }

    const totalLiquid = Object.values(accBalances).reduce((a, b) => a + Math.max(0, b), 0);
    const avgMonthlyBurn = Math.max(25000000, Math.round(totalOutflowAll / 8));
    const runwayMonths = Math.max(1, Math.round(totalLiquid / avgMonthlyBurn));
    const netAug = inflowAugust - outflowAugust;

    const dynamicMetrics: CashFlowMetrics = {
      totalLiquidBalance: totalLiquid,
      totalInflowThisMonth: inflowAugust,
      totalOutflowThisMonth: outflowAugust,
      netCashFlowThisMonth: netAug,
      monthlyBurnRate: avgMonthlyBurn,
      runwayMonths: runwayMonths,
      unverifiedCount: unverifiedCount,
      anomalyCount: anomalyCount,
      forecastEndMonth: Math.round(totalLiquid + Math.max(30000000, netAug * 0.4)),
    };

    const dynamicAccounts = INITIAL_ACCOUNTS.map((acc) => ({
      ...acc,
      balance: Math.max(1000000, accBalances[acc.name] ?? acc.balance),
    }));

    // Category breakdown calculation
    const totalExp = Object.values(catExpenses).reduce((a, b) => a + b, 0) || 1;
    const dynamicBreakdown = Object.entries(catExpenses)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: Math.round((amount / totalExp) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);

    // Chart Data Computation
    let calculatedChartData;
    if (chartPeriod === 'month') {
      const b0 = Math.max(15, Math.round(augBuckets[0] / 1_000_000));
      const b1 = Math.max(20, Math.round(augBuckets[1] / 1_000_000));
      const b2 = Math.max(18, Math.round(augBuckets[2] / 1_000_000));
      const b3 = Math.max(25, Math.round(augBuckets[3] / 1_000_000));
      const b4 = Math.max(30, Math.round(augBuckets[4] / 1_000_000));
      const b5 = Math.max(22, Math.round(augBuckets[5] / 1_000_000));
      const avgB = Math.round((b0 + b1 + b2 + b3 + b4 + b5) / 6);

      const items = [
        { label: 'Agt 01-04', val: b0, isForecast: false, desc: 'Minggu 1' },
        { label: 'Agt 05-08', val: b1, isForecast: false, desc: 'Termin Invoicing' },
        { label: 'Agt 09-12', val: b2, isForecast: false, desc: 'SaaS & Server AWS' },
        { label: 'Agt 13-16', val: b3, isForecast: false, desc: 'Proyek Enterprise' },
        { label: 'Agt 17-20', val: b4, isForecast: false, desc: 'Retainer Masuk' },
        { label: 'Hari Ini', val: b5, isForecast: false, desc: 'Posisi Kas Terkini' },
        { label: 'Agt 24 (Est)', val: Math.round(avgB * 1.15), isForecast: true, desc: 'Pelunasan Termin' },
        { label: 'Agt 28 (Est)', val: Math.round(avgB * 1.35), isForecast: true, desc: 'Target Closing Proyek' },
        { label: 'Agt 31 (Est)', val: Math.round(avgB * 1.2), isForecast: true, desc: 'Proyeksi Akhir Bulan' },
      ];
      const maxVal = Math.max(...items.map((i) => i.val), 50);
      calculatedChartData = {
        items: items.map((it) => ({ ...it, heightPct: Math.min(100, Math.max(15, Math.round((it.val / maxVal) * 100))) })),
        legend: 'Bulan Agustus 2026',
      };
    } else if (chartPeriod === 'quarter') {
      const q1Val = Math.max(150, Math.round(qTotals.q1 / 1_000_000));
      const q2Val = Math.max(200, Math.round(qTotals.q2 / 1_000_000));
      const q3Val = Math.max(180, Math.round(qTotals.q3 / 1_000_000));
      const q4Est = Math.round((q1Val + q2Val + q3Val) / 3 * 1.25);

      const qItems = [
        { label: 'Q1 (Jan-Mar)', val: q1Val, isForecast: false, desc: `Rp ${q1Val} Juta` },
        { label: 'Q2 (Apr-Jun)', val: q2Val, isForecast: false, desc: `Rp ${q2Val} Juta` },
        { label: 'Q3 (Jul-Sep)', val: q3Val, isForecast: false, desc: `Rp ${q3Val} Juta (Berjalan)` },
        { label: 'Q4 (Okt-Des)', val: q4Est, isForecast: true, desc: `Rp ${q4Est} Juta (Target AI)` },
      ];
      const maxVal = Math.max(...qItems.map((q) => q.val), 100);
      calculatedChartData = {
        items: qItems.map((it) => ({ ...it, heightPct: Math.min(100, Math.max(20, Math.round((it.val / maxVal) * 100))) })),
        legend: 'Tahun Fiskal 2026',
      };
    } else {
      const ytdM = Math.max(600, Math.round(ytd2026Total / 1_000_000));
      const yItems = [
        { label: '2023', val: 520, isForecast: false, desc: 'Rp 520 Juta' },
        { label: '2024', val: 780, isForecast: false, desc: 'Rp 780 Juta' },
        { label: '2025', val: 1150, isForecast: false, desc: 'Rp 1.15 Miliar' },
        { label: '2026 (YTD)', val: ytdM, isForecast: false, desc: `Rp ${ytdM} Juta (Aktif)` },
        { label: '2027 (Est)', val: Math.round(ytdM * 1.45), isForecast: true, desc: 'Target Pertumbuhan AI' },
      ];
      const maxVal = Math.max(...yItems.map((y) => y.val), 200);
      calculatedChartData = {
        items: yItems.map((it) => ({ ...it, heightPct: Math.min(100, Math.max(20, Math.round((it.val / maxVal) * 100))) })),
        legend: 'Historis & Proyeksi Tahunan',
      };
    }

    return {
      metrics: dynamicMetrics,
      accounts: dynamicAccounts,
      categoryBreakdown: dynamicBreakdown,
      chartData: calculatedChartData,
    };
  }, [transactions, chartPeriod]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(query);
        const matchCat = tx.category.toLowerCase().includes(query);
        const matchEntity = tx.entityName?.toLowerCase().includes(query);
        if (!matchDesc && !matchCat && !matchEntity) return false;
      }

      if (categoryFilter !== 'Semua Kategori') {
        if (categoryFilter === 'Pendapatan' && tx.type !== 'inflow') return false;
        if (categoryFilter === 'Pengeluaran' && tx.type !== 'outflow') return false;
        if (categoryFilter !== 'Pendapatan' && categoryFilter !== 'Pengeluaran' && tx.category !== categoryFilter) return false;
      }

      if (timeFilter === 'Bulan Ini' && !tx.date.includes('Aug')) return false;
      if (timeFilter === 'Bulan Lalu' && !tx.date.includes('Jul')) return false;

      if (statusFilter === 'unreviewed' && tx.status !== 'Perlu Review') return false;
      if (statusFilter === 'anomaly' && !tx.anomaly) return false;

      return true;
    });
  }, [transactions, searchQuery, categoryFilter, timeFilter, statusFilter]);

  // Paginated Slicing
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  }, [filteredTransactions.length, pageSize]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleAddTransaction = (newTx: TransactionItem) => {
    setTransactions((prev) => [newTx, ...prev]);
    showToast('Transaksi baru berhasil ditambahkan!', 'success');
  };

  const handleApproveTransaction = (id: string | number) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Selesai', anomaly: false } : t))
    );
    showToast('Transaksi disetujui & diverifikasi.', 'success');
  };

  const handleDeleteTransaction = (id: string | number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setTxToDelete(null);
    showToast('Transaksi berhasil dihapus dari mutasi kas.', 'danger');
  };

  const handleVoidTransaction = (id: string | number) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'Dibatalkan (Void)',
              amount: 0,
              description: `[VOID] ${t.description}`,
              anomaly: false,
            }
          : t
      )
    );
    setTxToDelete(null);
    showToast('Transaksi ditandai sebagai Dibatalkan (Voided).', 'info');
  };

  const handleReload1000 = () => {
    const new1000 = generate1000Transactions();
    setTransactions(new1000);
    try {
      localStorage.setItem('finai_cashflow_txs_v2', JSON.stringify(new1000));
      localStorage.removeItem('finai_cashflow_txs');
    } catch {
      // ignore
    }
    showToast('Berhasil memuat ulang 1.000 transaksi mutasi baru!', 'success');
  };

  const handleResetToInitial = () => {
    localStorage.removeItem('finai_cashflow_txs_v2');
    localStorage.removeItem('finai_cashflow_txs');
    setTransactions(INITIAL_TRANSACTIONS);
    setShowResetModal(false);
    showToast('Data berhasil direset ke 1.000 transaksi default.', 'info');
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });

      if (!response.ok) throw new Error('Gagal mengekspor data');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Arus_Kas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert('Gagal mengekspor: ' + err.message);
    }
  };

  const renderDashboard = () => (
    <>
      <header className="h-20 flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Tinjauan Arus Kas</h1>
          <p className="text-sm text-muted-foreground mt-1">Pantau, prediksi, dan optimalkan keuangan perusahaan Anda.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 glass-panel rounded-xl text-sm font-semibold hover:bg-white/80 transition-all cursor-pointer shadow-sm"
          >
            <IconDownload />
            <span>Export Laporan</span>
          </button>
          <button 
            onClick={() => setShowSmartUpload(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-all shadow-md cursor-pointer"
          >
            <IconSparkles />
            <span>Smart Upload Bukti</span>
          </button>
          <div className="h-6 w-px bg-border mx-1"></div>
          <button 
            onClick={() => {
              setActiveTab('transactions');
              setStatusFilter('unreviewed');
            }}
            className="p-2.5 text-muted-foreground hover:text-primary glass-panel rounded-full hover:bg-white/80 transition-all relative cursor-pointer"
            title="Notifikasi & Antrean Review"
          >
            <IconBell />
            {metrics.unverifiedCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-8 pt-4 space-y-6">
        {/* Anomaly & Automation Banners Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl text-primary shadow-sm">
                <IconSparkles />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">AI Automation Aktif</h4>
                <p className="text-xs text-muted-foreground mt-1">12 invoice diproses otomatis ke dalam jurnal hari ini.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveTab('transactions');
                setStatusFilter('all');
              }}
              className="text-sm font-semibold text-primary hover:underline px-3 py-1.5 bg-white/60 rounded-lg cursor-pointer transition-all hover:bg-white"
            >
              Lihat Antrean
            </button>
          </div>

          <div className="bg-gradient-to-r from-danger/10 to-warning/10 border border-danger/20 rounded-2xl p-5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl text-danger shadow-sm">
                <IconAlertTriangle />
              </div>
              <div>
                <h4 className="text-sm font-bold text-danger">Anomali Pengeluaran Terdeteksi</h4>
                <p className="text-xs text-muted-foreground mt-1">Pengeluaran Meta Ads naik 45% dari rata-rata bulanan.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveTab('transactions');
                setStatusFilter('anomaly');
              }}
              className="text-sm font-semibold text-danger hover:underline px-3 py-1.5 bg-white/60 rounded-lg cursor-pointer transition-all hover:bg-white"
            >
              Review
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs xl:text-sm font-semibold text-muted-foreground">Total Saldo Kas</p>
                <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                  <IconWallet />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-foreground whitespace-nowrap overflow-hidden text-ellipsis" title={formatCurrency(metrics.totalLiquidBalance)}>
                {formatCurrency(metrics.totalLiquidBalance)}
              </h2>
            </div>
            <div className="mt-3 flex items-center text-xs xl:text-sm font-medium">
              <span className="text-success flex items-center bg-success/10 px-2 py-0.5 rounded-md font-bold text-xs">
                <IconArrowUpRight /> 2.5%
              </span>
              <span className="text-muted-foreground ml-2 text-xs truncate">dari bulan lalu</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs xl:text-sm font-semibold text-muted-foreground">Runway / Nafas Bisnis</p>
                <div className="p-2 bg-accent/10 rounded-xl text-accent flex-shrink-0">
                  <IconActivity />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-foreground whitespace-nowrap">
                {metrics.runwayMonths} Bulan
              </h2>
            </div>
            <div className="mt-3 flex items-center text-xs xl:text-sm font-medium">
              <div className="w-full bg-border h-2 rounded-full overflow-hidden mr-3">
                <div className="bg-gradient-to-r from-accent to-primary h-full w-[70%]"></div>
              </div>
              <span className="text-muted-foreground whitespace-nowrap font-bold text-xs">Aman</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs xl:text-sm font-semibold text-muted-foreground">Uang Masuk (Inflow)</p>
                <div className="p-2 bg-success/10 rounded-xl text-success flex-shrink-0">
                  <IconArrowDownLeft />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-foreground whitespace-nowrap overflow-hidden text-ellipsis" title={formatCurrency(metrics.totalInflowThisMonth)}>
                {formatCurrency(metrics.totalInflowThisMonth)}
              </h2>
            </div>
            <div className="mt-3 flex items-center text-xs xl:text-sm font-medium">
              <span className="text-success flex items-center bg-success/10 px-2 py-0.5 rounded-md font-bold text-xs">
                <IconArrowUpRight /> 12.5%
              </span>
              <span className="text-muted-foreground ml-2 text-xs truncate">vs rata-rata</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-accent text-white p-5 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-15 transform scale-150 rotate-12 pointer-events-none">
              <IconTrendingUp />
            </div>
            <div>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <p className="text-xs xl:text-sm font-semibold text-white/85">Prediksi Akhir Bulan</p>
                <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-sm flex-shrink-0">
                  <IconSparkles />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight relative z-10 whitespace-nowrap overflow-hidden text-ellipsis" title={formatCurrency(metrics.forecastEndMonth)}>
                {formatCurrency(metrics.forecastEndMonth)}
              </h2>
            </div>
            <div className="mt-3 flex items-center text-xs xl:text-sm font-medium relative z-10">
              <span className="text-white flex items-center bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm font-bold text-xs">
                AI Forecast
              </span>
              <span className="text-white/80 ml-2 text-xs truncate">Akurasi 94%</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Tren & Prediksi Arus Kas</h3>
              <p className="text-sm text-muted-foreground mt-1">Data historis digabungkan dengan machine learning forecast.</p>
            </div>
            <div className="flex space-x-2 p-1 bg-muted/50 rounded-lg">
              <button 
                onClick={() => setChartPeriod('month')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${chartPeriod === 'month' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Bulan Ini
              </button>
              <button 
                onClick={() => setChartPeriod('quarter')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${chartPeriod === 'quarter' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Kuartal
              </button>
              <button 
                onClick={() => setChartPeriod('year')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${chartPeriod === 'year' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tahun
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between space-x-2 sm:space-x-3 pt-8 pb-1 relative">
            <div className="absolute bottom-1 left-0 right-0 border-b border-border/80"></div>
            {chartData.items.map((item, i) => (
              <div key={`${chartPeriod}-${i}`} className="w-full flex flex-col justify-end items-center group relative cursor-pointer h-full">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 bg-foreground text-background text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-2 shadow-xl z-20 whitespace-nowrap flex flex-col items-center">
                  <span>{item.val} Juta</span>
                  <span className="text-[10px] text-muted-foreground font-normal">{item.desc}</span>
                </div>

                {/* Animated Bar */}
                {item.isForecast ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.heightPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-white border-2 border-dashed border-secondary/60 rounded-t-lg flex flex-col justify-end overflow-hidden hover:border-secondary transition-colors"
                  >
                    <div className="w-full h-full bg-secondary/15"></div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.heightPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-primary/80 to-accent/90 hover:from-primary hover:to-accent transition-all rounded-t-lg shadow-sm"
                  ></motion.div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider overflow-x-auto">
            {chartData.items.map((item, i) => (
              <span key={`lbl-${i}`} className={`text-center px-0.5 truncate ${item.isForecast ? 'text-secondary font-bold' : item.label === 'Hari Ini' ? 'text-foreground font-bold' : ''}`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderTransactions = () => (
    <>
      <header className="h-20 flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Arus Kas & Mutasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Riwayat semua transaksi yang tercatat di sistem.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowManualForm(true)}
            className="flex items-center space-x-2 px-4 py-2.5 glass-panel rounded-xl text-sm font-semibold hover:bg-white/80 transition-all text-primary border border-primary/20 cursor-pointer shadow-sm"
          >
            <IconPlus />
            <span>Tambah Manual</span>
          </button>
          <button 
            onClick={() => setShowSmartUpload(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-all shadow-md cursor-pointer"
          >
            <IconSparkles />
            <span>Smart Upload Bukti</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-8 pt-4">
        <div className="glass-panel rounded-2xl overflow-hidden min-h-[500px]">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6 border-b border-border/50">
            <div className="flex flex-wrap gap-2 items-center">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..." 
                className="px-4 py-2 rounded-lg text-sm bg-white/70 border border-border outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]" 
              />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm bg-white/70 border border-border outline-none"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Pendapatan">Pendapatan</option>
                <option value="Pengeluaran">Pengeluaran</option>
                <option value="Pemasaran">Pemasaran</option>
                <option value="Payroll">Payroll</option>
                <option value="Operasional">Operasional</option>
                <option value="Aset">Aset</option>
              </select>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm bg-white/70 border border-border outline-none"
              >
                <option value="Bulan Ini">Bulan Ini</option>
                <option value="Bulan Lalu">Bulan Lalu</option>
                <option value="Semua Waktu">Semua Waktu</option>
              </select>

              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 cursor-pointer"
                >
                  Reset Filter ({statusFilter === 'anomaly' ? 'Anomali' : 'Perlu Review'}) ✕
                </button>
              )}
            </div>
            <p className="text-sm font-bold text-muted-foreground">{filteredTransactions.length} Transaksi Ditemukan</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Keterangan</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Kategori</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Jumlah</th>
                  <th className="px-4 py-4 font-bold tracking-wider text-center">Bukti</th>
                  <th className="px-4 py-4 font-bold tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Tidak ada transaksi yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/30 last:border-0 hover:bg-white/60 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-foreground flex items-center space-x-2 min-h-[64px]">
                        <span>{tx.description}</span>
                        {tx.anomaly && (
                          <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                            Anomali
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground whitespace-nowrap">{tx.date}</td>
                      <td className="px-6 py-4 font-medium text-muted-foreground">{tx.category}</td>
                      <td className="px-6 py-4">
                        {tx.status === 'Selesai' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-success/10 text-success border border-success/20">
                            {tx.status}
                          </span>
                        ) : tx.status === 'Dibatalkan (Void)' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-muted text-muted-foreground border border-border">
                            {tx.status}
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-warning/10 text-warning border border-warning/20">
                              {tx.status}
                            </span>
                            <button
                              onClick={() => handleApproveTransaction(tx.id)}
                              className="px-2 py-0.5 text-xs font-bold bg-success text-white rounded hover:bg-success/90 cursor-pointer shadow-sm flex items-center gap-1"
                              title="Setujui & Verifikasi"
                            >
                              <IconCheck /> Setujui
                            </button>
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.status === 'Dibatalkan (Void)' ? 'line-through text-muted-foreground opacity-60' : tx.type === 'inflow' ? 'text-success' : 'text-foreground'}`}>
                        {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {tx.receiptUrl ? (
                          <button 
                            onClick={() => setReceiptToView(tx.receiptUrl!)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            title="Lihat Foto Bukti"
                          >
                            <IconEye />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setTxToDelete(tx)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                          title="Hapus / Batalkan Transaksi"
                        >
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 bg-white/40 border-t border-border/50 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground font-medium">
                <span>
                  Menampilkan <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-foreground">{Math.min(currentPage * pageSize, filteredTransactions.length)}</strong> dari <strong className="text-foreground">{filteredTransactions.length}</strong> transaksi
                </span>
                <span className="text-border">|</span>
                <div className="flex items-center space-x-1.5">
                  <span>Per halaman:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-white border border-border rounded-md px-2 py-1 text-xs font-semibold text-foreground outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border border-border transition-all flex items-center gap-1 ${
                    currentPage === 1 
                      ? 'opacity-40 cursor-not-allowed bg-transparent text-muted-foreground' 
                      : 'bg-white hover:bg-muted/50 text-foreground cursor-pointer shadow-sm'
                  }`}
                >
                  ← Sebelumnya
                </button>

                <div className="flex items-center space-x-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const isGap = prevPage && page - prevPage > 1;
                      return (
                        <React.Fragment key={page}>
                          {isGap && <span className="px-1 text-xs text-muted-foreground">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentPage === page
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white/80 hover:bg-white text-muted-foreground hover:text-foreground border border-border/60'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border border-border transition-all flex items-center gap-1 ${
                    currentPage >= totalPages 
                      ? 'opacity-40 cursor-not-allowed bg-transparent text-muted-foreground' 
                      : 'bg-white hover:bg-muted/50 text-foreground cursor-pointer shadow-sm'
                  }`}
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderReports = () => (
    <>
      <header className="h-20 flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
          <p className="text-sm text-muted-foreground mt-1">Ringkasan performa keuangan dan export dokumen.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 glass-panel rounded-xl text-sm font-semibold hover:bg-white/80 transition-all text-primary border border-primary/20 cursor-pointer shadow-sm"
          >
            <IconDownload />
            <span>Export Excel (.csv)</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-all shadow-md cursor-pointer"
          >
            <IconDownload />
            <span>Cetak PDF Laporan</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-8 pt-4 space-y-6">
        {/* Report Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Pemasukan (Agustus)</p>
            <h2 className="text-xl xl:text-2xl font-extrabold text-success tracking-tight truncate" title={formatCurrency(metrics.totalInflowThisMonth)}>
              {formatCurrency(metrics.totalInflowThisMonth)}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Pengeluaran (Agustus)</p>
            <h2 className="text-xl xl:text-2xl font-extrabold text-danger tracking-tight truncate" title={formatCurrency(metrics.totalOutflowThisMonth)}>
              {formatCurrency(metrics.totalOutflowThisMonth)}
            </h2>
          </div>
          <div className="bg-gradient-to-br from-primary to-accent p-5 rounded-2xl shadow-md text-white">
            <p className="text-xs font-semibold text-white/85 mb-1">Laba Bersih (Net Profit)</p>
            <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight truncate" title={formatCurrency(metrics.netCashFlowThisMonth)}>
              {formatCurrency(metrics.netCashFlowThisMonth)}
            </h2>
          </div>
        </div>

        {/* Breakdown category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Beban Pengeluaran Berdasarkan Kategori</h3>
              <span className="text-xs font-semibold text-muted-foreground">Aktual Transaksi</span>
            </div>
            <div className="space-y-5">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data pengeluaran.</p>
              ) : (
                categoryBreakdown.map((item, idx) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-danger' : idx === 1 ? 'bg-warning' : idx === 2 ? 'bg-primary' : 'bg-accent'}`}></span>
                        {item.name}
                      </span>
                      <span>{formatCurrency(item.amount)} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          idx === 0 ? 'bg-danger' : idx === 1 ? 'bg-warning' : idx === 2 ? 'bg-primary' : 'bg-accent'
                        }`} 
                        style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Distribusi Kas per Rekening</h3>
              <span className="text-xs font-semibold text-muted-foreground">{accounts.length} Rekening Aktif</span>
            </div>
            <div className="space-y-5">
              {accounts.map((acc) => {
                const totalLiq = metrics.totalLiquidBalance || 1;
                const pct = Math.round((acc.balance / totalLiq) * 100);
                return (
                  <div key={acc.id}>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        {acc.name}
                        <span className="text-[10px] text-muted-foreground font-normal">({acc.badgeText})</span>
                      </span>
                      <span>{formatCurrency(acc.balance)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-500 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <header className="h-20 flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Perusahaan & Rekening</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfigurasi akun bank, ambang anomali AI, dan profil tim.</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-8 pt-4 space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-6 max-w-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Rekening Bank Terdaftar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Saldo real-time dihitung dari seluruh mutasi transaksi keluar-masuk.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-success/10 text-success rounded-lg border border-success/20">
              Sinkronisasi Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-4 bg-white rounded-xl border border-border/80 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{acc.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded font-bold">{acc.bankCode}</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground">{acc.accountNumber}</p>
                <p className="text-base font-extrabold text-foreground">{formatCurrency(acc.balance)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <h4 className="font-bold text-sm">Ambang Deteksi Anomali AI</h4>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Beri peringatan jika pengeluaran per transaksi melebihi:</span>
              <span className="font-bold text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">Rp 20.000.000</span>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-danger">Kelola Data Transaksi ({transactions.length} Data)</h4>
              <p className="text-xs text-muted-foreground">Muat ulang 1.000 data arus kas sintetis berkinerja tinggi atau reset ke awal.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReload1000}
                className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <IconRefreshCw />
                <span>Muat Ulang 1.000 Data</span>
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 text-xs font-bold text-danger bg-danger/10 hover:bg-danger hover:text-white rounded-xl transition-all cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-transparent text-foreground relative z-10">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-semibold border backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-success/95 text-white border-success/30 shadow-success/20'
                : toastMessage.type === 'danger'
                ? 'bg-danger/95 text-white border-danger/30 shadow-danger/20'
                : 'bg-foreground/95 text-background border-border/30'
            }`}
          >
            <IconCheckCircle />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <IconX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Copilot Button */}
      <button 
        onClick={() => setShowFinAI(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 hover:scale-105 transition-transform z-50 group cursor-pointer"
        title="Tanya FinAI"
      >
        <IconMessageCircle />
        <span className="absolute right-full mr-4 bg-foreground text-background text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Tanya FinAI
        </span>
      </button>

      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r-0 border-l-0 border-t-0 flex flex-col m-4 rounded-2xl mr-0">
        <div className="h-20 flex items-center px-6 border-b border-border/50">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary/20 text-white">
            <IconWallet />
          </div>
          <span className="font-bold text-xl tracking-tight gradient-text">Cash Flow</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => {
              setActiveTab('dashboard');
              setStatusFilter('all');
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <IconLayoutGrid />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('transactions');
              setStatusFilter('all');
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'transactions' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <IconArrowUpRight />
            <span>Arus Kas</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('reports');
              setStatusFilter('all');
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <IconFileText />
            <span>Laporan Keuangan</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('settings');
              setStatusFilter('all');
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <IconSettings />
            <span>Pengaturan</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-border flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" 
                alt="User profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Budi Santoso</p>
              <p className="text-xs text-muted-foreground truncate">Direktur Keuangan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden px-4">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      <SmartUploadModal
        isOpen={showSmartUpload}
        onClose={() => setShowSmartUpload(false)}
        onTransactionExtracted={handleAddTransaction}
      />

      <ManualTransactionModal
        isOpen={showManualForm}
        onClose={() => setShowManualForm(false)}
        onAddTransaction={handleAddTransaction}
      />

      <ReceiptViewModal
        receiptUrl={receiptToView}
        onClose={() => setReceiptToView(null)}
      />

      <FinAIChatModal
        isOpen={showFinAI}
        onClose={() => setShowFinAI(false)}
        metrics={metrics}
      />

      {/* Modal Konfirmasi Hapus Transaksi */}
      <AnimatePresence>
        {txToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border space-y-5"
            >
              <div className="flex items-center space-x-3 text-danger">
                <div className="p-3 bg-danger/10 rounded-xl">
                  <IconTrash />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Kelola / Hapus Transaksi</h3>
                  <p className="text-xs text-muted-foreground">ID: #{txToDelete.id} • {txToDelete.date}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-2 text-sm">
                <p className="font-semibold text-foreground">{txToDelete.description}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Kategori: <strong>{txToDelete.category}</strong></span>
                  <span className={`font-bold ${txToDelete.type === 'inflow' ? 'text-success' : 'text-danger'}`}>
                    {txToDelete.type === 'inflow' ? '+' : '-'}{formatCurrency(txToDelete.amount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Rekening: {txToDelete.accountName}</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Pilih <strong>Tandai Dibatalkan (Void)</strong> untuk mempertahankan jejak audit akuntansi dengan nominal Rp 0, atau <strong>Hapus Permanen</strong> untuk membuang mutasi ini dari pembukuan.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => handleVoidTransaction(txToDelete.id)}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl transition-all cursor-pointer border border-border text-center"
                >
                  Tandai Void
                </button>
                <button
                  onClick={() => handleDeleteTransaction(txToDelete.id)}
                  className="flex-1 px-4 py-2.5 bg-danger text-white hover:bg-danger/90 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md text-center"
                >
                  Hapus Permanen
                </button>
                <button
                  onClick={() => setTxToDelete(null)}
                  className="px-4 py-2.5 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Reset Data */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border space-y-5"
            >
              <div className="flex items-center space-x-3 text-danger">
                <div className="p-3 bg-danger/10 rounded-xl">
                  <IconAlertTriangle />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Reset ke 1.000 Data Default?</h3>
                  <p className="text-xs text-muted-foreground">Tindakan ini akan mengembalikan data ke setelan awal pabrik.</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Semua transaksi kustom yang Anda tambahkan manual atau via upload AI akan direset kembali ke 1.000 transaksi mutasi demo tahun 2026.
              </p>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetToInitial}
                  className="px-5 py-2.5 text-xs font-bold bg-danger text-white hover:bg-danger/90 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Ya, Reset Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
