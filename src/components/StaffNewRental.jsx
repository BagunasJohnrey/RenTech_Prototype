import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';

const ITEMS_PER_LOAD = 6; // initial and subsequent batch size

export default function StaffNewRental({ inventory, onAddTransaction, onClose }) {
  // Steps & toast
  const [step, setStep] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // Catalog search & filter
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [loadingMore, setLoadingMore] = useState(false);
  const catalogRef = useRef(null);

  // Selected item (only one at a time)
  const [selectedItem, setSelectedItem] = useState(null);

  // Customer details
  const [customer, setCustomer] = useState(() => {
    const now = new Date();
    const returnDate = new Date(now.getTime() + 3 * 86400000);
    return {
      name: '', contact: '', address: '',
      rentalDate: now.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      notes: '',
      photoUrl: null,
    };
  });

  // Downpayment
  const [includeDownpayment, setIncludeDownpayment] = useState(false);
  const [downpaymentAmount, setDownpaymentAmount] = useState('');

  // Size & measurements
  const [size, setSize] = useState('');
  const [measurementsExpanded, setMeasurementsExpanded] = useState(false);
  const [measurements, setMeasurements] = useState({});

  // Derived totals
  const totals = useMemo(() => {
    const base = selectedItem?.price || 0;
    const dp = includeDownpayment ? (Number(downpaymentAmount) || 0) : 0;
    return { baseRate: base, downpayment: dp, balance: base - dp };
  }, [selectedItem, includeDownpayment, downpaymentAmount]);

  // Filtered catalog (all available items)
  const filteredCatalog = useMemo(() => {
    const cats = {
      all: () => true,
      gown: i => i.category?.toLowerCase() === 'gown',
      suit: i => i.category?.toLowerCase() === 'suit',
      formal: i => i.category?.toLowerCase() === 'formal',
    };
    return inventory.filter(item => {
      if (item.status !== 'Available') return false;
      const matchesCat = cats[activeCategory] ? cats[activeCategory](item) : true;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [inventory, activeCategory, searchQuery]);

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD);
    setLoadingMore(false);
  }, [activeCategory, searchQuery]);

  // Slice the items for display
  const displayedItems = filteredCatalog.slice(0, visibleCount);
  const allLoaded = visibleCount >= filteredCatalog.length;

  // Infinite scroll handler
  const handleCatalogScroll = useCallback(() => {
    const el = catalogRef.current;
    if (!el || loadingMore || allLoaded) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setLoadingMore(true);
      // Simulate network
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredCatalog.length));
        setLoadingMore(false);
      }, 400);
    }
  }, [loadingMore, allLoaded, filteredCatalog.length]);

  // Navigation helpers
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else onClose();
  };

  const handleNext = () => {
    if (step === 1 && !selectedItem) return alert('Please select an item.');
    if (step === 2) {
      if (!customer.name || !customer.contact || !customer.address) return alert('Required customer details are missing.');
      if (!size) return alert('Please select a size.');
    }
    if (step === 3) {
      const transactionData = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        customer: customer.name,
        item: selectedItem.name,
        date: customer.rentalDate,
        status: 'Active',
        amount: totals.baseRate,
        downpayment: totals.downpayment,
        balance: totals.balance,
        size,
        measurements,
        notes: customer.notes,
        photoUrl: customer.photoUrl,
        rentalDate: customer.rentalDate,
        returnDate: customer.returnDate,
      };
      onAddTransaction(transactionData);
      setShowToast(true);
      setTimeout(() => onClose(), 1200);
      return;
    }
    setStep(s => s + 1);
  };

  // Measurement fields (based on category)
  const measurementFields = useMemo(() => {
    const isFemale = selectedItem?.category?.toLowerCase().includes('gown');
    return isFemale
      ? ['bust', 'waist', 'hips', 'shoulderToFloor', 'shoulderWidth']
      : ['shoulder', 'chest', 'waist', 'sleeveLength', 'pantsLength', 'neck'];
  }, [selectedItem]);

  // Progress labels for step indicator
  const progressSteps = ['Items', 'Details', 'Confirm'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
      {/* Toast */}
      {showToast && (
        <div className="fixed left-1/2 -translate-x-1/2 top-10 bg-emerald-500 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-xl z-[210] animate-bounce">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          <span className="font-bold text-sm uppercase tracking-wider">Rental Created</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
          <h2 className="text-xl font-bold text-gray-900">New Rental</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center py-4 px-6 bg-gray-50/50">
          {progressSteps.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                step >= idx + 1 ? 'bg-[#bf4a53] border-[#bf4a53] text-white' : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className={`text-[10px] font-bold mt-1 ${step >= idx + 1 ? 'text-[#bf4a53]' : 'text-gray-400'}`}>{label}</span>
              {idx < 2 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step > idx + 1 ? 'bg-[#bf4a53]' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Content area with scrollable catalog */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* STEP 1: Catalog with infinite scroll */}
          {step === 1 && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Select Item</h3>
                  <p className="text-sm text-gray-500">Choose an available garment.</p>
                </div>
                <div className="relative w-full sm:w-48">
                  <input
                    type="text" placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium focus:outline-none focus:border-[#bf4a53]"
                  />
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto mb-4">
                {['all','gown','suit','formal'].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${
                      activeCategory === cat ? 'bg-[#bf4a53] text-white border-[#bf4a53]' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Scrollable catalog grid */}
              <div
                ref={catalogRef}
                onScroll={handleCatalogScroll}
                className="flex-1 overflow-y-auto pr-1 hide-scrollbar"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayedItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedItem(prev => prev?.id === item.id ? null : item); setSize(''); }}
                      className={`bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer border-2 transition-all ${
                        selectedItem?.id === item.id ? 'border-[#bf4a53] shadow-md' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt="" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-500">₱{item.price.toLocaleString()}</p>
                      </div>
                      {selectedItem?.id === item.id && (
                        <svg className="w-5 h-5 text-[#bf4a53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                  ))}
                </div>

                {/* Loader / end indicator */}
                <div className="py-3 flex justify-center">
                  {loadingMore && <Loader2 size={18} className="text-gray-400 animate-spin" />}
                  {!loadingMore && allLoaded && filteredCatalog.length > 0 && (
                    <p className="text-xs text-gray-400">All items loaded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div className="overflow-y-auto pr-1 space-y-6">
              <h3 className="font-bold text-lg text-gray-900">Booking Details</h3>

              {/* Customer info */}
              <div className="bg-white border rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Customer</h4>
                <input type="text" placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#bf4a53]" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="tel" placeholder="Contact No." value={customer.contact} onChange={e => setCustomer({...customer, contact: e.target.value})} className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                  <input type="text" placeholder="Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Rental Date</label>
                    <input type="date" value={customer.rentalDate} onChange={e => setCustomer({...customer, rentalDate: e.target.value})} className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Return Date</label>
                    <input type="date" value={customer.returnDate} onChange={e => setCustomer({...customer, returnDate: e.target.value})} className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                  </div>
                </div>
              </div>

              {/* Item config */}
              <div className="bg-white border rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Item: {selectedItem?.name}</h4>
                <select value={size} onChange={e => setSize(e.target.value)} className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" required>
                  <option value="">-- Select Size --</option>
                  {['XS','S','M','L','XL','XXL','Custom / Measurements'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {size === 'Custom / Measurements' && (
                  <div className="pt-4 border-t">
                    <button onClick={() => setMeasurementsExpanded(!measurementsExpanded)} className="flex items-center justify-between w-full text-xs font-bold text-gray-500 hover:text-[#bf4a53]">
                      <span>Custom Measurements</span>
                      <svg className={`w-4 h-4 transition-transform ${measurementsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className={`grid grid-cols-2 gap-3 mt-2 overflow-hidden transition-all ${measurementsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      {measurementFields.map(field => (
                        <div key={field}>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">{field.replace(/([A-Z])/g, ' $1')}</label>
                          <input
                            type="number" placeholder="cm"
                            value={measurements[field] || ''}
                            onChange={e => setMeasurements({...measurements, [field]: e.target.value})}
                            className="w-full p-2 bg-gray-50 rounded-xl border text-xs focus:outline-none focus:border-[#bf4a53]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Downpayment */}
              <div className="bg-white border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">Downpayment</p>
                    <p className="text-xs text-gray-500">Optional partial payment</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={includeDownpayment} onChange={e => setIncludeDownpayment(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bf4a53]"></div>
                  </label>
                </div>
                {includeDownpayment && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₱</span>
                    <input type="number" placeholder="Amount" value={downpaymentAmount} onChange={e => setDownpaymentAmount(e.target.value)} className="w-full pl-8 p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                  </div>
                )}
              </div>

              {/* Notes & Photo */}
              <div className="bg-white border rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Documentation</h4>
                <textarea placeholder="Remarks / Notes" value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})} className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm min-h-[80px] focus:outline-none focus:border-[#bf4a53]" />
                <div className="relative h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden">
                  {customer.photoUrl ? (
                    <>
                      <img src={customer.photoUrl} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setCustomer({...customer, photoUrl: null})} className="absolute top-2 right-2 p-1.5 bg-[#bf4a53] text-white rounded-full shadow">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center p-4">
                      <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files[0];
                        if (file) setCustomer({...customer, photoUrl: URL.createObjectURL(file)});
                      }} className="hidden" />
                      <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Upload Photo</p>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Receipt */}
          {step === 3 && (
            <div className="overflow-y-auto pr-1 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Review Transaction</h3>
                <p className="text-sm text-gray-500">Finalize rental details</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="bg-[#bf4a53] text-white p-5 text-center">
                  <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="font-bold">{selectedItem?.name}</p>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-semibold">{customer.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Due Date</span><span className="font-semibold">{new Date(customer.returnDate).toLocaleDateString()}</span></div>
                  <div className="flex justify-between font-bold"><span>{selectedItem?.name}</span><span>₱{totals.baseRate.toLocaleString()}</span></div>
                  {includeDownpayment && totals.downpayment > 0 && (
                    <div className="flex justify-between text-[#bf4a53]"><span>Downpayment</span><span>-₱{totals.downpayment.toLocaleString()}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-3 mt-2"><span>Balance</span><span className="text-[#bf4a53]">₱{totals.balance.toLocaleString()}</span></div>
                  {customer.notes && <p className="text-xs text-gray-500 italic mt-2">Notes: {customer.notes}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="p-4 border-t bg-gray-50/50 flex gap-3">
          <button onClick={handleBack} className="flex-1 py-2.5 rounded-full font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            Back
          </button>
          <button onClick={handleNext} className="flex-[2] py-2.5 rounded-full font-bold text-sm bg-[#bf4a53] text-white hover:bg-red-700 transition-colors shadow">
            {step === 3 ? 'Confirm & Process' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}