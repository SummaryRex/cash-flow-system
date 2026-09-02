import React from 'react';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

interface ReceiptViewModalProps {
  receiptUrl: string | null;
  onClose: () => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
  receiptUrl,
  onClose,
}) => {
  if (!receiptUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="relative max-w-3xl w-full flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors cursor-pointer"
        >
          <IconX />
        </button>
        <div className="bg-white p-3 rounded-2xl shadow-2xl w-full flex items-center justify-center overflow-hidden">
          <img
            src={receiptUrl}
            alt="Bukti Transaksi"
            className="w-full max-h-[75vh] object-contain rounded-xl"
          />
        </div>
        <div className="mt-4 flex space-x-3">
          <a
            href={receiptUrl}
            download="Bukti_Transaksi.jpg"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md text-sm font-bold transition-colors flex items-center space-x-2"
          >
            <IconDownload />
            <span>Download Bukti</span>
          </a>
        </div>
      </div>
    </div>
  );
};
