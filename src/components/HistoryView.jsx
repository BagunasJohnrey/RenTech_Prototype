import { useState } from 'react';
import { Undo2, Search, X, Filter } from 'lucide-react';

export default function HistoryView({ role, transactions, onReturn }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]); // e.g. ['Active', 'Reserved', 'Returned']

  // Toggle a status filter
  const toggleFilter = (status) => {
    setActiveFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Apply role filter + search + status filters
  const displayedTransactions = transactions
    .filter((tx) => (role === 'Customer' ? tx.customer === 'Maria Santos' : true))
    .filter((tx) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.customer.toLowerCase().includes(q) ||
        tx.item.toLowerCase().includes(q)
      );
    })
    .filter((tx) => {
      if (activeFilters.length === 0) return true;
      return activeFilters.includes(tx.status);
    });

  // Available statuses from all transactions (for the filter dropdown)
  const allStatuses = [...new Set(transactions.map((tx) => tx.status))].sort();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {role === 'Customer' ? 'My Rentals' : 'Records'}
        </h2>
        <p className="text-gray-500 font-medium mt-1">
          {role === 'Customer'
            ? 'Track your active and past reservations.'
            : 'Digital logbook of all rental transactions.'}
        </p>
      </div>

      {/* Search bar + filter button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, customer, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200/80 rounded-full text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter button */}
        <div className="relative">
          <button
            onClick={() => setFilterDropdown(!filterDropdown)}
            className={`p-2.5 bg-white border border-gray-200/80 shadow-sm rounded-full transition-colors ${
              activeFilters.length > 0
                ? 'text-[#bf4a53] border-[#bf4a53] bg-red-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
          </button>

          {/* Filter dropdown */}
          {filterDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Status</p>
              {allStatuses.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(status)}
                    onChange={() => toggleFilter(status)}
                    className="w-4 h-4 accent-[#bf4a53]"
                  />
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                </label>
              ))}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    setFilterDropdown(false);
                  }}
                  className="w-full mt-2 text-xs font-bold text-[#bf4a53] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP TABLE (hidden on mobile) */}
      <div className="hidden md:block bg-white border border-gray-100/80 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100/80 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-5">ID</th>
                {role !== 'Customer' && <th className="px-6 py-5">Customer</th>}
                <th className="px-6 py-5">Item</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Amount</th>
                {role !== 'Customer' && <th className="px-6 py-5 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={role !== 'Customer' ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                    No transactions match your search/filters.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900">{tx.id}</td>
                    {role !== 'Customer' && (
                      <td className="px-6 py-4 text-gray-700 font-medium">{tx.customer}</td>
                    )}
                    <td className="px-6 py-4 text-gray-500">{tx.item}</td>
                    <td className="px-6 py-4 text-gray-500 text-[13px]">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${
                          tx.status === 'Reserved'
                            ? 'bg-blue-50 text-blue-600'
                            : tx.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      ₱{tx.amount.toLocaleString()}
                    </td>
                    {role !== 'Customer' && (
                      <td className="px-6 py-4 text-center">
                        {tx.status === 'Active' ? (
                          <button
                            onClick={() => onReturn(tx)}
                            className="p-1.5 text-[#bf4a53] bg-red-50 hover:bg-[#bf4a53] hover:text-white rounded-full transition-colors"
                            title="Process Return"
                          >
                            <Undo2 size={16} />
                            <span className="sr-only">Process Return</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW (visible only on small screens) */}
      <div className="md:hidden space-y-4">
        {displayedTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 text-center text-gray-500">
            No transactions match your search/filters.
          </div>
        ) : (
          displayedTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-5 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-900">{tx.id}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${
                    tx.status === 'Reserved'
                      ? 'bg-blue-50 text-blue-600'
                      : tx.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              {role !== 'Customer' && (
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs">Customer:</span>{' '}
                  <span className="font-medium">{tx.customer}</span>
                </p>
              )}

              <p className="text-sm text-gray-700">
                <span className="text-gray-400 text-xs">Item:</span>{' '}
                <span className="font-medium">{tx.item}</span>
              </p>

              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">
                  ₱{tx.amount.toLocaleString()}
                </p>
                {role !== 'Customer' && tx.status === 'Active' && (
                  <button
                    onClick={() => onReturn(tx)}
                    className="p-2 text-[#bf4a53] bg-red-50 hover:bg-[#bf4a53] hover:text-white rounded-full transition-colors"
                    title="Process Return"
                  >
                    <Undo2 size={16} />
                    <span className="sr-only">Process Return</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}