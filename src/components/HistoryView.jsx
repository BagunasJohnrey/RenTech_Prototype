import React from 'react';

export default function HistoryView({ role, transactions, onReturn }) {
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

      <div className="bg-white border border-gray-100/80 shadow-sm rounded-3xl overflow-hidden">
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
              {transactions
                .filter((tx) => (role === 'Customer' ? tx.customer === 'Maria Santos' : true))
                .map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900">{tx.id}</td>
                    {role !== 'Customer' && <td className="px-6 py-4 text-gray-700 font-medium">{tx.customer}</td>}
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
                            className="text-[11px] font-bold text-[#bf4a53] bg-red-50 hover:bg-[#bf4a53] hover:text-white px-3 py-1.5 rounded-full transition-colors"
                          >
                            Process Return
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}