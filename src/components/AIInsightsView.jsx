import React from 'react';
import { Sparkles, BarChart3, Calendar, ArrowUpRight } from 'lucide-react';

export default function AIInsightsView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <Sparkles className="text-[#bf4a53]" size={28} />
          <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
        </div>
        <p className="text-gray-400 font-medium max-w-xl relative z-10 leading-relaxed">
          Powered by Gemini API. Translating raw PostgreSQL database metrics and SMA demand forecasts into natural-language strategic advice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100/80 shadow-sm relative group hover:shadow-md transition-shadow">
          <div className="mb-5 p-3 bg-red-50 inline-block rounded-2xl text-[#bf4a53]">
            <BarChart3 size={22} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Inventory Optimization</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-6 font-medium">
            "Your 'Red Ballgown' category has a 90% utilization rate over the last 30 days. Recommendation: Purchase 2 more similar styles to avoid turning away customers."
          </p>
          <button className="text-[13px] font-bold text-[#bf4a53] flex items-center gap-1.5 hover:gap-2.5 transition-all">
            Review Stock <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100/80 shadow-sm relative group hover:shadow-md transition-shadow">
          <div className="mb-5 p-3 bg-red-50 inline-block rounded-2xl text-[#bf4a53]">
            <Calendar size={22} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Demand Forecasting</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-6 font-medium">
            "Based on the Simple Moving Average from 23 years of logs, anticipate a 35% surge in formal wear rentals by the 3rd week of May. Prepare cleaning logistics."
          </p>
          <button className="text-[13px] font-bold text-[#bf4a53] flex items-center gap-1.5 hover:gap-2.5 transition-all">
            View Projections <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}