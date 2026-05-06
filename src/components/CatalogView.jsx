import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import ItemCard from './ItemCard';

export default function CatalogView({ role, inventory, transactions, onBook, onEdit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToCheck, setItemToCheck] = useState(null);
  const [checkDate, setCheckDate] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckAvailability = (item) => {
    setItemToCheck(item);
    setCheckDate('');
    setAvailabilityMessage('');
  };

  const handleDateCheck = () => {
    if (!checkDate || !itemToCheck) return;
    // Mock availability check: see if any Active/Reserved transaction for same item on that date
    const conflict = transactions.some(
      tx =>
        tx.item === itemToCheck.name &&
        (tx.status === 'Active' || tx.status === 'Reserved') &&
        tx.date === new Date(checkDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    );
    if (conflict) {
      setAvailabilityMessage(`Unavailable on ${checkDate}. Already booked.`);
    } else {
      // Available – open reservation modal
      onBook(itemToCheck);
      setItemToCheck(null);
      setAvailabilityMessage('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Collection</h2>
          <p className="text-gray-500 font-medium mt-1">Browse our premium formal wear.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search (e.g. Gatsby, Suit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200/80 rounded-full text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 shadow-sm transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200/80 shadow-sm rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Date availability check modal (inline) */}
      {itemToCheck && (
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-lg p-6 max-w-md mx-auto">
          <h3 className="font-bold text-lg mb-4">Check Availability for {itemToCheck.name}</h3>
          <input
            type="date"
            value={checkDate}
            onChange={(e) => setCheckDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium mb-4"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setItemToCheck(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-full">
              Cancel
            </button>
            <button onClick={handleDateCheck} className="px-4 py-2 text-sm font-bold text-white bg-[#bf4a53] rounded-full hover:bg-red-700">
              Check
            </button>
          </div>
          {availabilityMessage && (
            <p className={`mt-3 text-sm font-semibold ${availabilityMessage.startsWith('Unavailable') ? 'text-red-500' : 'text-emerald-600'}`}>
              {availabilityMessage}
            </p>
          )}
        </div>
      )}

      {filteredInventory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-3 pb-20">
          <Search size={40} className="text-gray-300" />
          <p className="font-semibold text-sm">No items found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-6">
          {filteredInventory.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              role={role}
              onBook={() => handleCheckAvailability(item)}
              onEdit={() => onEdit(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}