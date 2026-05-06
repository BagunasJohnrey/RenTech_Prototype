import { Sparkles, ShoppingBag, Clock, BarChart3, Activity, Plus, User, Settings } from 'lucide-react';
import ItemCard from './ItemCard';
import StatCard from './StatCard';

export default function DashboardView({ role, transactions, inventory, onOpenNewRental, onNavigate }) {
  // Customer view remains unchanged
  if (role === 'Customer') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100/50 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3 relative z-10">
            Find your <span className="text-[#bf4a53]">perfect fit.</span>
          </h2>
          <p className="text-gray-600 text-sm mb-8 max-w-sm relative z-10 leading-relaxed font-medium">
            Describe your event theme or style preference, and let our AI stylist curate the ideal outfit.
          </p>
          <button className="bg-[#bf4a53] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md shadow-red-500/20 flex items-center gap-2 hover:bg-red-700 transition-colors relative z-10">
            <Sparkles size={16} /> Consult AI Stylist
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
            <button className="text-sm font-semibold text-gray-500 hover:text-[#bf4a53] transition-colors">View All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {inventory.slice(0, 4).map((item) => (
              <ItemCard key={item.id} item={item} role={role} onBook={() => {}} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeRentalsCount = transactions.filter((tx) => tx.status === 'Active').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-gray-500 font-medium mt-1">Here's what's happening at the boutique today.</p>
        </div>

        {/* Right side action buttons */}
        <div className="flex items-center gap-3">
          {/* Admin: AI Insights chip */}
          {role === 'Admin' && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-full px-4 py-2 flex items-center gap-3">
              <Sparkles size={16} className="text-[#bf4a53]" />
              <span className="text-xs font-semibold text-gray-700">Insights Ready</span>
              <button className="ml-1 text-xs text-[#bf4a53] font-bold hover:underline">View</button>
            </div>
          )}

          {/* Staff: New Rental button (hidden on mobile) */}
          {role === 'Staff' && (
            <button
              onClick={onOpenNewRental}
              className="hidden md:flex bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm shadow-gray-900/20 items-center gap-2 hover:bg-gray-800 transition-all"
            >
              <Plus size={18} /> New Rental
            </button>
          )}

          {/* Admin: Settings button (hidden on mobile) */}
          {role === 'Admin' && (
            <button
              onClick={() => onNavigate('Settings')}
              className="hidden md:flex bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm shadow-gray-900/20 items-center gap-2 hover:bg-gray-800 transition-all"
            >
              <Settings size={18} /> Settings
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatCard title="Active Rentals" value={activeRentalsCount.toString()} trend="+12%" icon={ShoppingBag} />
        <StatCard title="Pending Returns" value="8" trend="-2%" icon={Clock} isWarning />
        {role === 'Admin' && (
          <>
            <StatCard title="Monthly Revenue" value="₱45,200" trend="+24%" icon={BarChart3} />
            <StatCard
              title="Damaged Items"
              value={inventory.filter((i) => i.status === 'Damaged').length.toString()}
              trend="Action Needed"
              icon={Activity}
              isAlert
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart mockup (Admin only) */}
        {role === 'Admin' && (
          <div className="bg-white rounded-3xl p-7 border border-gray-100/80 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Demand Forecast</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Simple Moving Average projection</p>
              </div>
              <select className="text-sm font-semibold text-gray-600 bg-gray-50/80 hover:bg-gray-100 border-0 rounded-xl py-2 px-4 transition-colors outline-none cursor-pointer">
                <option>Next 3 Months</option>
                <option>Next 6 Months</option>
              </select>
            </div>

            <div className="h-56 flex items-end justify-between gap-3 mt-4">
              {[40, 55, 30, 80, 100, 45].map((val, i) => (
                <div key={i} className="w-full flex flex-col justify-end group">
                  {i >= 3 && (
                    <div
                      className="w-full bg-red-50 rounded-t-lg mb-1.5 transition-all duration-500 relative"
                      style={{ height: `${val * 0.2}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#bf4a53] hidden group-hover:block bg-red-50 px-2 py-1 rounded-md">
                        Est.
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ${i >= 3 ? 'bg-[#bf4a53]/40' : 'bg-gray-900'}`}
                    style={{ height: `${val}%` }}
                  />
                  <span className="text-[11px] text-gray-400 font-semibold text-center mt-3 hidden sm:block">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights (Admin) or Activity (Staff) */}
        {role === 'Admin' ? (
          <div className="bg-white rounded-3xl p-7 border border-gray-100/80 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-50/50 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-6 relative z-10">
              <div className="p-2 bg-red-50 text-[#bf4a53] rounded-xl">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">AI Insights</h3>
            </div>
            <div className="flex-1 space-y-4 relative z-10">
              <div className="p-4 bg-gray-50/80 rounded-2xl text-[13px] text-gray-700 leading-relaxed border border-gray-100/50">
                <span className="font-bold text-gray-900 block mb-1">Trend Alert</span>
                Prom season peaks in 3 weeks. Reservation data shows a 40% spike in inquiries for "Sequin Dresses".
              </div>
              <div className="p-4 bg-gray-50/80 rounded-2xl text-[13px] text-gray-700 leading-relaxed border border-gray-100/50">
                <span className="font-bold text-gray-900 block mb-1">Action Suggested</span>
                Promote underperforming "Classic Navy Suits" with a bundle discount.
              </div>
            </div>
            <button className="w-full mt-6 bg-white border border-gray-200 text-gray-800 font-semibold text-sm py-2.5 rounded-full hover:bg-gray-50 transition-colors relative z-10 shadow-sm">
              Full Report
            </button>
          </div>
        ) : (
          // Staff: Recent Activity
          <div className="bg-white rounded-3xl p-7 border border-gray-100/80 shadow-sm lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
              <span className="text-xs text-[#bf4a53] font-semibold cursor-pointer">View All</span>
            </div>
            <div className="space-y-5">
              {transactions.slice(0, 4).map((tx, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{tx.customer}</p>
                    <p className="text-xs text-gray-500 truncate">{tx.item}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        tx.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}