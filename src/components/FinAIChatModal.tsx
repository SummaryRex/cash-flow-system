import React, { useState, useRef, useEffect } from 'react';
import { CashFlowMetrics } from '../types';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconMessageCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

interface FinAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: CashFlowMetrics;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const FinAIChatModal: React.FC<FinAIChatModalProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Halo Pak Budi, saya FinAI Copilot keuangan Anda. Ada yang ingin dianalisis mengenai cash runway, anomali ads, atau mitigasi arus kas bulan ini?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/finai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            totalBalance: metrics.totalLiquidBalance,
            totalInflow: metrics.totalInflowThisMonth,
            totalOutflow: metrics.totalOutflowThisMonth,
            netCashFlow: metrics.netCashFlowThisMonth,
            runwayMonths: metrics.runwayMonths,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal merespons');

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Maaf, terjadi gangguan koneksi AI: ${err.message}. Runway perusahaan saat ini masih berada di kisaran aman ${metrics.runwayMonths} bulan.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] bg-white rounded-3xl shadow-2xl border border-border/80 flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary to-accent text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <IconSparkles />
          </div>
          <div>
            <h3 className="font-bold text-sm">FinAI Financial Copilot</h3>
            <p className="text-[11px] text-white/80">AI Advisor Finansial Perusahaan</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
        >
          <IconX />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                m.role === 'user'
                  ? 'bg-primary text-white rounded-br-none shadow-sm'
                  : 'bg-white text-foreground rounded-bl-none shadow-sm border border-border/60'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 bg-white rounded-2xl rounded-bl-none border border-border/60 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-[11px] text-muted-foreground font-semibold">FinAI sedang menganalisis data...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-border/50 flex gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendMessage('Bagaimana status runway & burn rate kita?')}
          className="px-2.5 py-1 bg-muted/60 hover:bg-primary/10 hover:text-primary rounded-lg whitespace-nowrap transition-colors"
        >
          💡 Status Runway
        </button>
        <button
          onClick={() => handleSendMessage('Jelaskan anomali Meta Ads yang terdeteksi.')}
          className="px-2.5 py-1 bg-muted/60 hover:bg-primary/10 hover:text-primary rounded-lg whitespace-nowrap transition-colors"
        >
          ⚠️ Bahas Anomali Ads
        </button>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-border/60 flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Tanya saran keuangan atau proyeksi..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputMessage.trim()}
          className="p-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <IconSend />
        </button>
      </div>
    </div>
  );
};
