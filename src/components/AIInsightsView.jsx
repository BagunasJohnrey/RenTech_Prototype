import { useState } from 'react';
import {
  BarChart3, Sparkles, TrendingUp, Package, DollarSign,
  AlertTriangle, Lightbulb, FileText
} from 'lucide-react';
import AIReportModal from './AIReportModal';

export default function AIInsightsView({ transactions, inventory }) {
  const [showReportModal, setShowReportModal] = useState(false);

  // ---------- DATA COMPUTATION ----------
  const currentMonth = 4; // May (0-indexed)
  const currentYear = 2026;

  const getMonthData = (month, year) => {
    const txs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    return {
      count: txs.length,
      revenue: txs.reduce((sum, tx) => sum + tx.amount, 0),
    };
  };

  // Simulated historical Jan–Apr (mock)
  const historical = [
    { label: 'Jan', count: 3, revenue: 3600 },
    { label: 'Feb', count: 5, revenue: 6000 },
    { label: 'Mar', count: 4, revenue: 5000 },
    { label: 'Apr', count: 6, revenue: 7200 },
  ];
  const mayData = getMonthData(currentMonth, currentYear);
  const allRevenue = transactions.reduce((s, tx) => s + tx.amount, 0);
  const thisMonthRevenue = mayData.revenue;

  // SMA forecast (window 3)
  const last3Counts = [
    ...historical.slice(-3).map(m => m.count),
    mayData.count,
  ];
  const forecastCount = last3Counts.length === 3
    ? Math.round(last3Counts.reduce((a, b) => a + b, 0) / 3)
    : 0;
  const avgPrice = mayData.count > 0 ? mayData.revenue / mayData.count : 1500;
  const forecastRevenue = forecastCount * avgPrice;

  // ----- Popular items & utilisation -----
  const itemCounts = {};
  transactions.forEach(tx => {
    itemCounts[tx.item] = (itemCounts[tx.item] || 0) + 1;
  });
  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const categoryStats = {};
  inventory.forEach(item => {
    if (!categoryStats[item.category])
      categoryStats[item.category] = { total: 0, rented: 0 };
    categoryStats[item.category].total += 1;
    if (item.status === 'Rented' || item.status === 'Reserved')
      categoryStats[item.category].rented += 1;
  });
  const utilization = Object.entries(categoryStats).map(([cat, s]) => ({
    category: cat,
    rate: Math.round((s.rented / s.total) * 100),
    total: s.total,
  }));

  // Underperforming (never rented, Available)
  const underperforming = inventory.filter(
    item => item.status === 'Available' && !itemCounts[item.name]
  );

  // ----- Insights -----
  const insights = [];
  if (popularItems.length)
    insights.push(`"${popularItems[0][0]}" is the most rented item (${popularItems[0][1]}x).`);
  const highUtilCat = utilization.find(u => u.rate >= 80);
  if (highUtilCat)
    insights.push(`High utilisation in ${highUtilCat.category} (${highUtilCat.rate}%).`);
  if (underperforming.length)
    insights.push(`${underperforming.length} item(s) have never been rented – consider promotions.`);
  if (forecastCount > mayData.count)
    insights.push(`Next month’s demand is forecast to rise by ${forecastCount - mayData.count} rental(s).`);

  // ----- Chart: Demand line chart (SMA) -----
  const months = [...historical, { label: 'May', count: mayData.count, revenue: mayData.revenue }];
  const maxCount = Math.max(...months.map(m => m.count), forecastCount);
  const maxRevenue = Math.max(...months.map(m => m.revenue), forecastRevenue);
  const lineChartWidth = 400;
  const lineChartHeight = 150;
  const padding = 20;
  const xStep = (lineChartWidth - padding * 2) / (months.length);
  const points = months.map((m, i) => {
    const x = padding + i * xStep + xStep / 2;
    const y = lineChartHeight - padding - (m.count / maxCount) * (lineChartHeight - padding * 2);
    return `${x},${y}`;
  });
  const forecastX = padding + months.length * xStep + xStep / 2;
  const forecastY = lineChartHeight - padding - (forecastCount / maxCount) * (lineChartHeight - padding * 2);
  const polylinePoints = points.join(' ') + ` ${forecastX},${forecastY}`;

  // Revenue bar chart months
  const revenueMonths = [...months, { label: 'Jun', revenue: forecastRevenue, forecast: true }];

  // Data packed for the report modal
  const reportData = {
    metrics: {
      allRevenue,
      thisMonthRevenue,
      forecastCount,
      forecastRevenue,
      avgPrice,
      rentedCount: inventory.filter(i => i.status === 'Rented' || i.status === 'Reserved').length,
    },
    popularItems,
    utilization,
    underperforming,
    historical: months,
    forecastCount,
    forecastRevenue,
    avgPrice,
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Sparkles className="text-[#bf4a53]" size={28} />
            <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
          </div>
          <p className="text-gray-400 font-medium max-w-xl relative z-10 leading-relaxed">
            Real‑time analytics powered by your transaction & inventory data. SMA demand forecasting,
            inventory optimisation, and revenue projections updated instantly.
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-2xl inline-block text-emerald-500 mb-4">
              <DollarSign size={20} />
            </div>
            <p className="text-[13px] text-gray-500 font-medium">Total Revenue</p>
            <h4 className="text-2xl font-bold text-gray-900">₱{allRevenue.toLocaleString()}</h4>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-sm">
            <div className="p-2.5 bg-blue-50 rounded-2xl inline-block text-blue-500 mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-[13px] text-gray-500 font-medium">This Month</p>
            <h4 className="text-2xl font-bold text-gray-900">₱{thisMonthRevenue.toLocaleString()}</h4>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-sm">
            <div className="p-2.5 bg-orange-50 rounded-2xl inline-block text-orange-500 mb-4">
              <Package size={20} />
            </div>
            <p className="text-[13px] text-gray-500 font-medium">Items Rented</p>
            <h4 className="text-2xl font-bold text-gray-900">{reportData.metrics.rentedCount}</h4>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-sm">
            <div className="p-2.5 bg-purple-50 rounded-2xl inline-block text-purple-500 mb-4">
              <BarChart3 size={20} />
            </div>
            <p className="text-[13px] text-gray-500 font-medium">Forecast Rentals</p>
            <h4 className="text-2xl font-bold text-gray-900">{forecastCount}</h4>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-sm">
            <div className="p-2.5 bg-cyan-50 rounded-2xl inline-block text-cyan-500 mb-4">
              <DollarSign size={20} />
            </div>
            <p className="text-[13px] text-gray-500 font-medium">Est. Revenue (Jun)</p>
            <h4 className="text-2xl font-bold text-gray-900">
              ₱{forecastRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h4>
          </div>
        </div>

        {/* Charts + optimisation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demand line chart */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100/80 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Demand Forecast (SMA)</h3>
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`}
                className="w-full max-w-md mx-auto"
                style={{ height: 'auto' }}
              >
                {/* Grid */}
                {[0, 25, 50, 75, 100].map(pct => (
                  <line
                    key={pct}
                    x1={padding}
                    y1={lineChartHeight - padding - (pct / 100) * (lineChartHeight - padding * 2)}
                    x2={lineChartWidth - padding}
                    y2={lineChartHeight - padding - (pct / 100) * (lineChartHeight - padding * 2)}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#bf4a53"
                  strokeWidth="2"
                  strokeDasharray="0 4 4"   // solid for past, dashed for forecast? We'll keep one style
                />
                {months.map((m, i) => {
                  const [x, y] = points[i].split(',').map(Number);
                  return <circle key={i} cx={x} cy={y} r="3" fill="#bf4a53" />;
                })}
                <circle cx={forecastX} cy={forecastY} r="4" fill="#bf4a53" stroke="white" strokeWidth="2" />
                {months.map((m, i) => {
                  const [x] = points[i].split(',').map(Number);
                  return (
                    <text key={i} x={x} y={lineChartHeight - 5} textAnchor="middle" fill="#9ca3af" fontSize="10">
                      {m.label}
                    </text>
                  );
                })}
                <text x={forecastX} y={lineChartHeight - 5} textAnchor="middle" fill="#bf4a53" fontSize="10" fontWeight="bold">
                  Jun*
                </text>
              </svg>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">* SMA (3‑month) forecast</p>
          </div>

          {/* Utilisation */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Utilisation Rate</h3>
            {utilization.map(u => (
              <div key={u.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{u.category}</span>
                  <span className="font-bold text-gray-900">{u.rate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#bf4a53]" style={{ width: `${u.rate}%` }} />
                </div>
              </div>
            ))}
            {utilization.length === 0 && <p className="text-sm text-gray-500">No data.</p>}
          </div>
        </div>

        {/* Revenue bar chart + Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100/80 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Monthly Revenue</h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {revenueMonths.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[10px] font-medium text-gray-500 mb-1">
                    ₱{(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      m.forecast
                        ? 'bg-[#bf4a53]/30 border-2 border-dashed border-[#bf4a53]'
                        : 'bg-gray-900'
                    }`}
                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className={`text-[11px] font-semibold mt-2 ${m.forecast ? 'text-[#bf4a53]' : 'text-gray-500'}`}>
                    {m.label}{m.forecast ? ' (est.)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimisation tips */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} className="text-[#bf4a53]" />
              <h3 className="font-bold text-gray-900 text-lg">Optimisation Tips</h3>
            </div>
            {underperforming.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-2xl text-sm">
                <p className="font-semibold text-gray-900 mb-1">Promote these items:</p>
                {underperforming.slice(0, 3).map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600 py-1">
                    <span>{item.name}</span>
                    <span className="font-medium text-orange-500">0 rentals</span>
                  </div>
                ))}
              </div>
            )}
            {popularItems.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-2xl text-sm">
                <p className="font-semibold text-gray-900 mb-1">Most popular:</p>
                {popularItems.map(([name, count]) => (
                  <div key={name} className="flex justify-between text-xs text-gray-600 py-1">
                    <span>{name}</span>
                    <span className="font-medium text-blue-500">{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic AI Insights */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-7 border border-red-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-[#bf4a53]" />
              <h3 className="font-bold text-gray-900 text-lg">AI‑Generated Insights</h3>
            </div>
            <ul className="space-y-2">
              {insights.map((text, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#bf4a53] shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Report button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#bf4a53] text-white font-semibold rounded-full shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors"
          >
            <FileText size={18} />
            Generate AI Report
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <AIReportModal data={reportData} onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}