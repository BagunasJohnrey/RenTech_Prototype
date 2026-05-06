export default function StaffTasksView({ transactions, inventory }) {
  const cleaningItems = inventory.filter(item => item.status === 'Cleaning');
  const activeRentals = transactions.filter(tx => tx.status === 'Active');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Tasks</h2>
        <p className="text-gray-500 font-medium mt-1">Today's priorities: cleaning, returns & inspections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cleaning Queue */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Cleaning Queue</h3>
          </div>

          {cleaningItems.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">All clean! No items in cleaning.</p>
          ) : (
            <div className="space-y-3">
              {cleaningItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-[11px] text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-orange-100 text-orange-600">
                    Cleaning
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Rentals */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-red-50 rounded-xl text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Active Returns</h3>
          </div>

          {activeRentals.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">No active rentals right now.</p>
          ) : (
            <div className="space-y-3">
              {activeRentals.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tx.customer}</p>
                    <p className="text-xs text-gray-500">{tx.item} – Due: {tx.date}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-600">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}