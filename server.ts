import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Increase payload limit for base64 screenshot uploads
app.use(express.json({ limit: '20mb' }));

// Helper to initialize Gemini SDK safely on demand
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to execute Gemini requests with auto-retry and model fallbacks
async function generateWithFallback(ai: GoogleGenAI, payload: any) {
  // Use most stable available flash models with fallback order
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-2.0-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          ...payload,
          model,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        const isHighDemand = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE');
        if (isHighDemand && attempt === 0) {
          // Brief backoff before retry
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        // If still failing on this model, switch to the next fallback model
        break;
      }
    }
  }

  throw lastError;
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Parse Screenshot / Receipt / Text using Gemini AI
app.post('/api/parse-transaction', async (req, res) => {
  try {
    const { imageBase64, textInput, mimeType = 'image/png' } = req.body;

    if (!imageBase64 && !textInput) {
      return res.status(400).json({ error: 'Harap sediakan gambar screenshot/struk atau teks transaksi.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `
Anda adalah sistem AI Spesialis Akuntansi & Arus Kas Perusahaan di Indonesia.
Tugas Anda adalah mengekstrak data bukti transfer (M-Banking BCA, Mandiri, BRI, BNI), E-Wallet (GoPay, OVO, ShopeePay), struk fisik, atau teks catatan pengeluaran/pemasukan.

Kategori yang Valid:
- 'Gaji & Payroll'
- 'Vendor & Supplier'
- 'Invoicing Klien'
- 'Sewa & Operasional'
- 'Pemasaran & Ads'
- 'Pajak & Legal'
- 'Investasi / Modal'
- 'Peralatan & Tech'
- 'Lainnya'

Akun Bank/Dompet yang Valid:
- 'BCA Bisnis'
- 'Mandiri Utama'
- 'Kas Kecil (Petty Cash)'
- 'GoPay Corporate'

Aturan Ekstraksi:
1. 'type': Jika uang masuk/kredit/diterima pilih 'inflow', jika uang keluar/debit/dikirim pilih 'outflow', jika antar rekening perusahaan pilih 'transfer'.
2. 'amount': Angka murni nominal transaksi dalam Rupiah (tanpa Rp, koma, atau titik).
3. 'entityName': Nama penerima, pengirim, vendor, atau klien.
4. 'description': Rangkuman ringkas 1 kalimat tentang transaksi ini.
5. 'date': Tanggal transaksi dalam format YYYY-MM-DD (Gunakan tanggal hari ini jika tidak terdeteksi jelas).
6. 'confidence': Estimasi tingkat kepastian ekstraksi (skala 80-99).
`;

    const contentsParts: any[] = [];

    if (imageBase64) {
      // Clean base64 string if it contains data URI header
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      });
    }

    if (textInput) {
      contentsParts.push({
        text: `Teks Transaksi / Catatan: "${textInput}"`,
      });
    } else {
      contentsParts.push({
        text: `Mohon ekstrak data dari bukti gambar transaksi ini secara presisi.`,
      });
    }

    const response = await generateWithFallback(ai, {
      contents: { parts: contentsParts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: "Tipe transaksi: 'inflow', 'outflow', atau 'transfer'",
            },
            amount: {
              type: Type.NUMBER,
              description: 'Nominal transaksi dalam Rupiah',
            },
            category: {
              type: Type.STRING,
              description: 'Kategori transaksi yang sesuai',
            },
            accountName: {
              type: Type.STRING,
              description: 'Nama akun bank atau dompet digital yang digunakan',
            },
            entityName: {
              type: Type.STRING,
              description: 'Nama vendor, klien, atau pihak lawan transaksi',
            },
            description: {
              type: Type.STRING,
              description: 'Deskripsi singkat transaksi',
            },
            date: {
              type: Type.STRING,
              description: 'Tanggal YYYY-MM-DD',
            },
            referenceNumber: {
              type: Type.STRING,
              description: 'Nomor referensi atau ID transaksi jika ada',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Nilai kepercayaan 80-99',
            },
          },
          required: ['type', 'amount', 'category', 'entityName', 'description'],
        },
      },
    });

    const parsedText = response.text || '{}';
    const parsedData = JSON.parse(parsedText);

    res.json({
      success: true,
      data: {
        ...parsedData,
        referenceNumber: parsedData.referenceNumber || `TRX-AI-${Math.floor(1000 + Math.random() * 9000)}`,
        accountName: parsedData.accountName || 'BCA Bisnis',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        confidence: parsedData.confidence || 95,
      },
    });
  } catch (error: any) {
    console.error('Error parsing transaction via Gemini:', error);
    res.status(500).json({
      error: error.message || 'Gagal memproses bukti transaksi dengan AI.',
    });
  }
});

// Export CSV Endpoint
app.post('/api/export-csv', (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Format data transaksi tidak valid.' });
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Nominal (Rp)', 'Kategori', 'Akun Bank/Dompet', 'Pihak Lain / Vendor', 'Deskripsi', 'No. Referensi', 'Status'];

    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type === 'inflow' ? 'Pemasukan' : t.type === 'outflow' ? 'Pengeluaran' : 'Transfer',
      t.amount,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.accountName || '').replace(/"/g, '""')}"`,
      `"${(t.entityName || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
      t.status === 'verified' ? 'Terverifikasi' : 'Pending Approval',
    ]);

    // UTF-8 BOM for Excel opening
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Arus_Kas_Perusahaan_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengekspor CSV: ' + err.message });
  }
});

// Chat with FinAI Financial Advisor
app.post('/api/finai-chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    const ai = getGeminiClient();
    const systemPrompt = `
Anda adalah FinAI, Chief Financial Advisor & CFO AI untuk sistem Cash Flow Perusahaan.
Karakter Anda: Tajam, rasional, berbasis data, profesional, langsung ke inti (tidak berbasa-basi), dan memberikan rekomendasi taktis serta mitigasi risiko cash flow.

Konteks Finansial Perusahaan Terkini:
- Total Saldo Kas: Rp ${context?.totalBalance?.toLocaleString('id-ID') || '485.000.000'}
- Pemasukan Bulan Ini: Rp ${context?.totalInflow?.toLocaleString('id-ID') || '130.000.000'}
- Pengeluaran Bulan Ini: Rp ${context?.totalOutflow?.toLocaleString('id-ID') || '112.500.000'}
- Net Cash Flow: Rp ${context?.netCashFlow?.toLocaleString('id-ID') || '17.500.000'}
- Estimasi Runway: ${context?.runwayMonths || '14'} Bulan

Jawablah pertanyaan user dalam Bahasa Indonesia dengan format ringkas, berbobot, dan berikan actionable insights.
`;

    const response = await generateWithFallback(ai, {
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({
      reply: response.text || 'Maaf, tidak dapat menghasilkan respon saat ini.',
    });
  } catch (err: any) {
    console.error('FinAI chat error:', err);
    res.status(500).json({ error: err.message || 'Gagal berkomunikasi dengan FinAI.' });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Cash Flow Perusahaan berjalan di http://localhost:${PORT}`);
  });
}

startServer();
