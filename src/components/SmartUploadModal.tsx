import React, { useState, useRef } from 'react';
import { TransactionItem } from '../types';
import { formatCurrency } from '../data';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const IconCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const IconZap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

interface SmartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionExtracted: (transaction: TransactionItem) => void;
}

const PRESETS = [
  {
    label: 'Transfer BCA 18.5jt (Sewa Office)',
    text: 'Transfer m-BCA Berhasil. Tanggal: 14 Aug 2024. Ke: Wework Coworking Space. Jumlah: Rp 18.500.000. Catatan: Sewa Private Office dedicated 8 pax.',
  },
  {
    label: 'Struk Resto Meeting Klien 850rb (Cash)',
    text: 'Struk Resto Bunga Rampai. Total: Rp 850.000. Metode: Cash. Tanggal: 13 Aug 2024. Untuk: Makan siang closing project klien perbankan.',
  },
  {
    label: 'Invoicing Klien Masuk 95jt (Mandiri)',
    text: 'Kredit Masuk Mandiri e-Banking. Rp 95.000.000 dari PT Bank Digital Nusantara. Keterangan: Pelunasan Invoicing Project Core Engine Cloud.',
  },
];

export const SmartUploadModal: React.FC<SmartUploadModalProps> = ({
  isOpen,
  onClose,
  onTransactionExtracted,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleProcessAI = async (overrideText?: string) => {
    const textToUse = overrideText ?? inputText;
    if (!textToUse.trim() && !selectedFile) {
      setErrorMessage('Silakan upload screenshot bukti transfer atau ketik teks keterangan.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      let imageBase64: string | undefined = undefined;

      if (selectedFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(selectedFile);
        });
      }

      const response = await fetch('/api/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          textInput: textToUse,
          mimeType: selectedFile ? selectedFile.type : 'image/png',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        let errStr = result.error || 'Gagal memproses dengan Gemini AI.';
        try {
          // If error is raw Google JSON error
          if (errStr.includes('{') && errStr.includes('error')) {
            const parsedErr = JSON.parse(errStr);
            if (parsedErr?.error?.code === 503 || parsedErr?.error?.status === 'UNAVAILABLE') {
              errStr = 'Server Google Gemini sedang mengalami antrian trafik global tinggi sesaat (503 High Demand). Silakan klik tombol "Ekstrak & Catat Otomatis" sekali lagi.';
            } else {
              errStr = parsedErr?.error?.message || errStr;
            }
          }
        } catch {
          // keep original errStr
        }
        throw new Error(errStr);
      }

      const extracted = result.data;
      const newTx: TransactionItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: extracted.description || 'Ekstraksi AI: ' + (extracted.entityName || 'Transaksi'),
        category: extracted.category || 'Operasional',
        amount: Number(extracted.amount) || 0,
        type: extracted.type || 'outflow',
        status: 'Selesai',
        anomaly: (extracted.amount > 50000000 && extracted.type === 'outflow'),
        receiptUrl: previewUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
        accountName: extracted.accountName || 'BCA Bisnis',
        entityName: extracted.entityName,
        referenceNumber: extracted.referenceNumber,
        aiConfidence: extracted.confidence || 96,
        rawSourceType: selectedFile ? 'screenshot' : 'text',
      };

      onTransactionExtracted(newTx);
      setSuccessNotice(`Berhasil diekstrak oleh Gemini AI: ${newTx.description} (${formatCurrency(newTx.amount)})`);

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        setInputText('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setSuccessNotice(null);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menghubungi Gemini AI.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-panel bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <IconSparkles />
            </div>
            <div>
              <h2 className="text-xl font-bold">Smart Upload Bukti AI</h2>
              <p className="text-xs text-muted-foreground">Didukung Multimodal Gemini 3.6 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <IconX />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Presets */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
              <IconZap /> Contoh Cepat (Klik untuk Uji Ekstraksi):
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(p.text);
                    handleProcessAI(p.text);
                  }}
                  disabled={isProcessing}
                  className="text-xs px-3 py-1.5 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-lg transition-all font-medium cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Upload Screenshot M-Banking / Foto Struk
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
            >
              {previewUrl ? (
                <div className="flex items-center space-x-3 w-full p-2 bg-white rounded-xl shadow-sm border border-border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {((selectedFile?.size || 0) / 1024).toFixed(0)} KB • Siap diproses
                    </p>
                    <span className="text-xs text-primary font-semibold">Klik untuk ganti gambar</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-full shadow-sm text-primary mb-3 group-hover:scale-110 transition-transform">
                    <IconCamera />
                  </div>
                  <p className="text-sm font-bold text-primary">Klik untuk upload atau drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-1">BCA, Mandiri, BRI, GoPay, OVO, Struk Fisik (JPG, PNG)</p>
                </>
              )}
            </div>
          </div>

          {/* Text Input Option */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Atau Tulis Catatan Transaksi Bebas
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Contoh: Keluar 12.5jt dari BCA buat sewa server AWS dan domain bulan Agustus..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-white outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-danger/10 text-danger border border-danger/20 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-success/10 text-success border border-success/20 text-xs font-semibold flex items-center space-x-2">
              <IconCheckCircle />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/30 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => handleProcessAI()}
            disabled={isProcessing || (!inputText.trim() && !selectedFile)}
            className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/30 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses AI...</span>
              </>
            ) : (
              <>
                <IconSparkles />
                <span>Ekstrak & Catat Otomatis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
