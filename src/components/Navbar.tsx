import React from 'react';
import {
  Building2,
  Download,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  unverifiedCount: number;
  onOpenManualModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  isExporting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  unverifiedCount,
  onOpenManualModal,
  onExportCsv,
  onResetData,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-slate-100">
                ArusKas<span className="text-emerald-400">.Corporate</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistem Otomatisasi Jurnal & Proyeksi Kas Perusahaan
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {unverifiedCount > 0 && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{unverifiedCount} Transaksi Perlu Review AI</span>
            </div>
          )}

          <button
            onClick={onResetData}
            title="Reset Data ke Default"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onExportCsv}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isExporting ? 'Mengespor...' : 'Ekspor CSV'}</span>
          </button>

          <button
            onClick={onOpenManualModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs shadow-sm shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Catat Manual</span>
          </button>

          <div className="pl-2 border-l border-slate-800 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center">
              TM
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                Tim Keuangan
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
