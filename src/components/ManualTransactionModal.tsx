import React, { useState } from 'react';
import { TransactionItem, TransactionType } from '../types';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: TransactionItem) => void;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('inflow');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Pendapatan');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0 || !description.trim()) return;

    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newTx: TransactionItem = {
      id: Date.now(),
      date: formattedDate,
      rawDate: date,
      description,
      category,
      amount: amountNum,
      type,
      status: 'Selesai',
      anomaly: false,
      receiptUrl: receiptImage,
      accountName: 'BCA Bisnis',
    };

    onAddTransaction(newTx);
    onClose();
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-panel bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-bold">Tambah Transaksi Manual</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div className="flex space-x-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'inflow'}
                  onChange={() => setType('inflow')}
                  className="peer sr-only"
                />
                <div className="w-full py-3 rounded-xl border-2 border-border text-center font-bold text-muted-foreground peer-checked:border-success peer-checked:text-success peer-checked:bg-success/5 transition-all">
                  Uang Masuk
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'outflow'}
                  onChange={() => setType('outflow')}
                  className="peer sr-only"
                />
                <div className="w-full py-3 rounded-xl border-2 border-border text-center font-bold text-muted-foreground peer-checked:border-danger peer-checked:text-danger peer-checked:bg-danger/5 transition-all">
                  Uang Keluar
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Nominal (Rp)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 1500000"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-white outline-none focus:ring-2 focus:ring-primary/30 transition-all font-semibold text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-white outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-white outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm font-medium"
                >
                  <option value="Pendapatan">Pendapatan</option>
                  <option value="Pemasaran">Pemasaran</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Aset">Aset</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Keterangan / Catatan
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan transaksi..."
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-white outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Upload Bukti Transaksi (Opsional)
              </label>
              <label className="w-full border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                {receiptImage ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={receiptImage}
                      alt="Uploaded Receipt"
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                    <span className="text-xs font-bold text-success">Bukti berhasil dipilih (Klik untuk ganti)</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white rounded-full shadow-sm text-primary mb-2 group-hover:scale-110 transition-transform">
                      <IconCamera />
                    </div>
                    <p className="text-sm font-bold text-primary">Klik untuk upload atau drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, atau PDF (Max. 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="p-6 border-t border-border/50 bg-muted/30 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-white transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/30 transition-all cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
