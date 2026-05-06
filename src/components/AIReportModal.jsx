import { useState, useEffect } from 'react';
import { X, Sparkles, Download, Loader2, Clock } from 'lucide-react';
import { parseReportSections } from '../utils/formatReport';

const RATE_LIMIT_SECONDS = 60; // 1 minute between reports

export default function AIReportModal({ data, onClose }) {
  const [loading, setLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check localStorage for last report time on mount
  useEffect(() => {
    const lastTime = localStorage.getItem('lastAIReportTime');
    if (lastTime) {
      const elapsed = (Date.now() - parseInt(lastTime, 10)) / 1000;
      if (elapsed < RATE_LIMIT_SECONDS) {
        setRateLimited(true);
        setCountdown(Math.ceil(RATE_LIMIT_SECONDS - elapsed));
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!rateLimited || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimited, countdown]);

  // ---------- Mock fallback report ----------
  const mockReport = `### 1. Demand Forecasting\n- June forecast: **${data.forecastCount} rentals**\n- Based on SMA (3‑month window)\n- Trend: ${data.forecastCount > data.historical[data.historical.length - 1].count ? 'Growth' : 'Decline'} expected\n\n### 2. Inventory Optimization\n- Most popular: **${data.popularItems[0][0]}** (${data.popularItems[0][1]}x)\n- Underperforming: ${data.underperforming.length} item(s)\n- Suggestion: promote bundle for ${data.underperforming.map(i => i.name).join(', ')}\n\n### 3. Revenue Projections\n- Total revenue: ₱${data.metrics.allRevenue.toLocaleString()}\n- May revenue: ₱${data.metrics.thisMonthRevenue.toLocaleString()}\n- Projected June revenue: **₱${data.forecastRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}**`;

  // ---------- Gemini API call ----------
  const callGemini = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Missing Gemini API key');

      const prompt = `You are a senior business analyst for a formal‑wear rental boutique. Generate a professional, actionable report with these exact sections:

1. **Demand Forecasting** – using SMA (Simple Moving Average) with the provided data, forecast next month's rental count and comment on the trend.
2. **Inventory & Sales Optimization** – highlight the most rented items, flag underperforming inventory, and suggest concrete promotions.
3. **Revenue Monitoring & Projections** – present total revenue, this month's revenue, average price per rental, and project next month's revenue based on the forecast.

Data: ${JSON.stringify(data)}

Format each section as: '### 1. Section Title' followed by concise bullet points (starting with '-'). Use **bold** for key numbers.`;

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

      // Save rate limit timestamp
      localStorage.setItem('lastAIReportTime', Date.now().toString());
      setGeminiResponse(text);
      setRateLimited(true);
      setCountdown(RATE_LIMIT_SECONDS);
    } catch (error) {
      console.error('Gemini error:', error);
      // Fallback to mock report
      setGeminiResponse(mockReport);
    } finally {
      setLoading(false);
    }
  };

  // Raw text to display (Gemini or fallback)
  const rawReport = geminiResponse || mockReport;
  // Parse into beautiful sections
  const sections = parseReportSections(rawReport);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100/80 bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#bf4a53] rounded-xl text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">AI Business Report</h3>
              <p className="text-xs text-gray-500">Powered by Gemini · Real‑time analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Report content – beautifully formatted */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 size={32} className="text-[#bf4a53] animate-spin" />
              <p className="text-sm text-gray-500">Generating your report…</p>
            </div>
          ) : (
            sections.map((section, idx) => (
              <div key={idx} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/80">
                {section.title && (
                  <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bf4a53]" />
                    {section.title}
                  </h4>
                )}
                <ul className="space-y-2">
                  {section.bodyLines.map((line, i) => {
                    if (!line.trim()) return null;
                    // Parse markdown bold: **text** → <strong>
                    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>');
                    return (
                      <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^- /, '') }} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-gray-100/80 bg-gray-50/50 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {geminiResponse ? 'Generated by Gemini' : 'Mock report (prototype)'}
            {rateLimited && countdown > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-orange-500">
                <Clock size={12} /> Next report in {countdown}s
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {/* Gemini button – disabled when rate limited or loading */}
            {!geminiResponse && (
              <button
                onClick={callGemini}
                disabled={rateLimited || loading}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                  rateLimited
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {rateLimited ? `Wait ${countdown}s` : 'Generate with Gemini'}
              </button>
            )}
            <button
              onClick={() => {
                const blob = new Blob([rawReport], { type: 'text/plain' });
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