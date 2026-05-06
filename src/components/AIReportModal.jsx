import { X, Sparkles, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AIReportModal({ data, onClose }) {
  const [loading, setLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState(null);

  // ---------- MOCK REPORT (used if Gemini is not called) ----------
  const mockReport = () => {
    return `
**RENTECH AI Business Report**
*Generated: ${new Date().toLocaleDateString()}*

---

### 1. Rule-Based Demand Forecasting

- Historical rental demand (Jan–May): ${data.historical.map(m => `${m.label}: ${m.count} rentals`).join(', ')}.
- **Simple Moving Average forecast (3‑month window):** Next month (June) is expected to have **${data.forecastCount} rentals**.
- This represents a ${data.forecastCount > data.historical[data.historical.length-1].count ? 'growth' : 'decline'} compared to May.

---

### 2. Smart Inventory & Sales Optimization

- **Most popular item:** ${data.popularItems[0][0]} (${data.popularItems[0][1]} bookings).
- **Category utilisation:** ${data.utilization.map(c => `${c.category}: ${c.rate}%`).join(', ')}.
- **Underperforming items:** ${data.underperforming.length} items have never been rented (${data.underperforming.map(i => i.name).join(', ')}). Recommendation: launch a promotional bundle for these.

---

### 3. Revenue Monitoring & Forecast-Based Projections

- **Total revenue (all time):** ₱${data.metrics.allRevenue.toLocaleString()}.
- **Current month revenue (May):** ₱${data.metrics.thisMonthRevenue.toLocaleString()}.
- **Average revenue per rental:** ₱${data.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}.
- **Projected June revenue:** ₱${data.forecastRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} (based on forecast rentals × average price).

---

*This report was generated automatically by RENTECH AI.*
`;
  };

  // ---------- REAL GEMINI CALL (optional) ----------
  const callGemini = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // or process.env.REACT_APP_GEMINI_API_KEY
      if (!apiKey) throw new Error('Missing API key');

      const prompt = `You are a business analyst for a rental boutique. Generate a concise report covering:
      1. Demand forecasting (SMA, next month prediction).
      2. Inventory optimization (popular items, utilization, underperforming).
      3. Revenue monitoring and projection.
      Use the following real data: ${JSON.stringify(data)}. Be professional and use bullet points.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      setGeminiResponse(text);
    } catch (error) {
      console.error('Gemini error:', error);
      // Fallback to mock report
      setGeminiResponse(mockReport());
    } finally {
      setLoading(false);
    }
  };

  // Decide which report to display
  const displayReport = geminiResponse || mockReport();

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100/80 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#bf4a53]" size={24} />
            <div>
              <h3 className="font-bold text-xl text-gray-900">AI Business Report</h3>
              <p className="text-xs text-gray-500">Real‑time analytics & recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Report content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 size={32} className="text-[#bf4a53] animate-spin" />
              <p className="text-sm text-gray-500">Generating report with Gemini…</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">{displayReport}</pre>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100/80 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {geminiResponse ? 'Generated by Gemini' : 'Mock report (prototype)'}
          </p>
          <div className="flex gap-2">
            {/* Optional: Connect to Gemini button */}
            {!import.meta.env.VITE_GEMINI_API_KEY && (
              <button
                onClick={callGemini}
                className="px-4 py-2 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                Try Gemini (needs key)
              </button>
            )}
            <button
              onClick={() => {
                // Simple download as text file
                const blob = new Blob([displayReport], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'RENTECH_AI_Report.txt';
                a.click();
              }}
              className="px-5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}