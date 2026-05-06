import { useState, useRef, useCallback, useMemo } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import ItemCard from './ItemCard';

const ITEMS_PER_LOAD = 10;

export default function CatalogView({ role, inventory, transactions, onBook, onCustomerBook, onEdit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToCheck, setItemToCheck] = useState(null);
  const [checkDate, setCheckDate] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Filter state
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [loadingMore, setLoadingMore] = useState(false);
  const catalogRef = useRef(null);

  // All possible statuses (unique, sorted)
  const allStatuses = useMemo(() => {
    const set = new Set(inventory.map(item => item.status));
    return ['All', ...Array.from(set).sort()];
  }, [inventory]);

  // Filtered inventory (search + status)
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeStatusFilter === 'All') return true;
      return item.status === activeStatusFilter;
    });
  }, [inventory, searchQuery, activeStatusFilter]);

  // Reset pagination helper (called when filters change)
  const resetPagination = () => {
    setVisibleCount(ITEMS_PER_LOAD);
    setLoadingMore(false);
  };

  // Handlers that trigger a reset
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    resetPagination();
  };

  const handleStatusFilter = (status) => {
    setActiveStatusFilter(status);
    setFilterDropdown(false);
    resetPagination();
  };

  const displayedItems = filteredInventory.slice(0, visibleCount);
  const allLoaded = visibleCount >= filteredInventory.length;

  // Infinite scroll
  const handleCatalogScroll = useCallback(() => {
    const el = catalogRef.current;
    if (!el || loadingMore || allLoaded) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredInventory.length));
        setLoadingMore(false);
      }, 300);
    }
  }, [loadingMore, allLoaded, filteredInventory.length]);

  const handleItemAction = (item) => {
    if (role === 'Customer') {
      onCustomerBook(item);
    } else {
      setItemToCheck(item);
      setCheckDate('');
      setAvailabilityMessage('');
    }
  };

  const handleDateCheck = () => {
    if (!checkDate || !itemToCheck) return;
    const conflict = transactions.some(
      tx =>
        tx.item === itemToCheck.name &&
        (tx.status === 'Active' || tx.status === 'Reserved') &&
        tx.date === new Date(checkDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    );
    if (conflict) {
      setAvailabilityMessage(`Unavailable on ${checkDate}.`);
    } else {
      onBook(itemToCheck, checkDate);
      setItemToCheck(null);
      setAvailabilityMessage('');
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 160px)' }} className="h-full flex flex-col">
      <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shrink-0">
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
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200/80 rounded-full text-sm font-medium focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 shadow-sm transition-all"
              />
            </div>
            {/* Filter button with dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterDropdown(!filterDropdown)}
                className={`p-2.5 bg-white border border-gray-200/80 shadow-sm rounded-full transition-colors ${
                  activeStatusFilter !== 'All'
                    ? 'text-[#bf4a53] border-[#bf4a53] bg-red-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
              </button>

              {filterDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Status</p>
                  {allStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        activeStatusFilter === status
                          ? 'bg-[#bf4a53] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  {activeStatusFilter !== 'All' && (
                    <button
                      onClick={() => handleStatusFilter('All')}
                      className="w-full mt-2 text-[10px] font-bold text-[#bf4a53] hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date availability check (staff/admin only) */}
        {itemToCheck && role !== 'Customer' && (
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-lg p-6 max-w-md mx-auto shrink-0">
            <h3 className="font-bold text-lg mb-4">Check Availability for {itemToCheck.name}</h3>
            <input
              type="date"
              value={checkDate}
              onChange={e => setCheckDate(e.target.value)}
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

        {/* Scrollable grid with infinite load */}
        <div
          ref={catalogRef}
          onScroll={handleCatalogScroll}
          className="flex-1 overflow-y-auto pr-1 hide-scrollbar min-h-0"
        >
          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
              <Search size={40} className="text-gray-300" />
              <p className="font-semibold text-sm">No items found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-6">
                {displayedItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    role={role}
                    onBook={() => handleItemAction(item)}
                    onEdit={() => onEdit(item)}
                  />
                ))}
              </div>
              <div className="py-3 flex justify-center">
                {loadingMore && <Loader2 size={18} className="text-gray-400 animate-spin" />}
                {!loadingMore && allLoaded && filteredInventory.length > 0 && (
                  <p className="text-xs text-gray-400">All items loaded</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}