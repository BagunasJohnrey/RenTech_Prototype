import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Smartphone, CreditCard, Search, Loader2 } from 'lucide-react';

const ITEMS_PER_LOAD = 6;

const generateQRPattern = (data) => {
  let pattern = '';
  for (let i = 0; i < 25; i++) {
    pattern += Math.random() > 0.5 ? '1' : '0';
  }
  return pattern;
};

export default function CustomerRentalFlow({
  item: preselectedItem,
  selectedDate: preselectedDate,
  inventory,
  onClose,
  onConfirm,
}) {
  const [step, setStep] = useState(preselectedItem ? 1 : 0);
  const [selectedItem, setSelectedItem] = useState(preselectedItem || null);
  const [selectedDate] = useState(preselectedDate || new Date().toISOString().split('T')[0]);
  const [useAccountDetails, setUseAccountDetails] = useState(true);
  const [customer, setCustomer] = useState({
    name: 'Maria Santos',
    contact: '0917 123 4567',
    address: '123 Rizal St, Makati',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [selectedSize, setSelectedSize] = useState('');
  const minDownpayment = selectedItem ? Math.round(selectedItem.price * 0.5) : 0;
  const [downpaymentAmount, setDownpaymentAmount] = useState(minDownpayment);
  const [confirmedTx, setConfirmedTx] = useState(null);

  // Catalog state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [loadingMore, setLoadingMore] = useState(false);
  const catalogRef = useRef(null);

  const filteredCatalog = useMemo(() => {
    const cats = {
      all: () => true,
      gown: (i) => i.category?.toLowerCase() === 'gown',
      suit: (i) => i.category?.toLowerCase() === 'suit',
      formal: (i) => i.category?.toLowerCase() === 'formal',
    };
    return inventory.filter((item) => {
      if (item.status !== 'Available') return false;
      const matchesCat = cats[activeCategory] ? cats[activeCategory](item) : true;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [inventory, activeCategory, searchQuery]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD);
    setLoadingMore(false);
  }, [activeCategory, searchQuery]);

  const displayedItems = filteredCatalog.slice(0, visibleCount);
  const allLoaded = visibleCount >= filteredCatalog.length;

  const handleCatalogScroll = useCallback(() => {
    const el = catalogRef.current;
    if (!el || loadingMore || allLoaded) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_LOAD, filteredCatalog.length));
        setLoadingMore(false);
      }, 400);
    }
  }, [loadingMore, allLoaded, filteredCatalog.length]);

  const handleNext = () => {
    if (step === 0) {
      if (!selectedItem) return alert('Please select an item.');
      setDownpaymentAmount(Math.round(selectedItem.price * 0.5));
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!customer.name || !customer.contact || !customer.address)
        return alert('Please fill in all required details.');
      if (!selectedSize) return alert('Please select a size.');
      if (downpaymentAmount < minDownpayment)
        return alert(`Downpayment must be at least ₱${minDownpayment.toLocaleString()}.`);
      setStep(2);
      return;
    }
    if (step === 2) {
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: customer.name,
        item: selectedItem.name,
        size: selectedSize,
        date: new Date(selectedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        status: 'Reserved',
        amount: selectedItem.price,
        downpayment: Number(downpaymentAmount),
        notes: customer.notes,
        paymentMethod,
        contact: customer.contact,
        address: customer.address,
      };
      setConfirmedTx(newTx);
      setStep(3);
      return;
    }
  };

  const handleConfirm = () => onConfirm(confirmedTx);

  // Step 0: Catalog (only when no preselected item)
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
            <h2 className="text-xl font-bold text-gray-900">Select Item</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
          </div>
          <div className="p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium focus:outline-none focus:border-[#bf4a53]" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto mb-4">
              {['all','gown','suit','formal'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${activeCategory === cat ? 'bg-[#bf4a53] text-white border-[#bf4a53]' : 'bg-white border-gray-200 text-gray-600'}`}>{cat}</button>
              ))}
            </div>
            <div ref={catalogRef} onScroll={handleCatalogScroll} className="flex-1 overflow-y-auto pr-1 hide-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedItems.map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className={`bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer border-2 transition-all ${selectedItem?.id === item.id ? 'border-[#bf4a53] shadow-md' : 'border-transparent hover:border-gray-200'}`}>
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
              <div className="py-3 flex justify-center">
                {loadingMore && <Loader2 size={18} className="text-gray-400 animate-spin" />}
                {!loadingMore && allLoaded && filteredCatalog.length > 0 && <p className="text-xs text-gray-400">All items loaded</p>}
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50/50 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50">Cancel</button>
            <button onClick={handleNext} className="flex-[2] py-2.5 rounded-full font-bold text-sm bg-[#bf4a53] text-white hover:bg-red-700 shadow">Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-3
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
          <h2 className="text-xl font-bold text-gray-900">Complete Booking</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="flex items-center justify-center py-4 px-6 bg-gray-50/50">
          {['Details', 'Payment', 'Receipt'].map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= idx+1 ? 'bg-[#bf4a53] border-[#bf4a53] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                {step > idx+1 ? '✓' : idx+1}
              </div>
              <span className={`text-[10px] font-bold mt-1 ${step >= idx+1 ? 'text-[#bf4a53]' : 'text-gray-400'}`}>{label}</span>
              {idx < 2 && <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step > idx+1 ? 'bg-[#bf4a53]' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                <img src={selectedItem.image} className="w-16 h-16 rounded-xl object-cover bg-gray-200" alt="" />
                <div>
                  <p className="font-bold text-gray-900">{selectedItem.name}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(selectedDate).toLocaleDateString()}</p>
                  <p className="text-lg font-bold text-[#bf4a53] mt-1">₱{selectedItem.price.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Who is this booking for?</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => setUseAccountDetails(true)} className={`py-3 px-4 rounded-xl text-sm font-bold border ${useAccountDetails ? 'bg-[#bf4a53] text-white border-[#bf4a53]' : 'bg-white border-gray-200 text-gray-700'}`}>Me (Maria)</button>
                  <button onClick={() => { setUseAccountDetails(false); setCustomer({ name: '', contact: '', address: '', notes: '' }); }} className={`py-3 px-4 rounded-xl text-sm font-bold border ${!useAccountDetails ? 'bg-[#bf4a53] text-white border-[#bf4a53]' : 'bg-white border-gray-200 text-gray-700'}`}>Someone else</button>
                </div>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Full Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} disabled={useAccountDetails} className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Contact No." value={customer.contact} onChange={e => setCustomer({ ...customer, contact: e.target.value })} disabled={useAccountDetails} className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                  <input type="text" placeholder="Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} disabled={useAccountDetails} className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" />
                </div>
                <textarea placeholder="Special notes (e.g. size preference, theme)" value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border text-sm min-h-[80px] focus:outline-none focus:border-[#bf4a53]" />

                {/* SIZE SELECTION */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Size</label>
                  <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]" required>
                    <option value="">-- Select Size --</option>
                    {['XS','S','M','L','XL','XXL','Custom / Measurements'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase">Required Downpayment</p>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₱</span>
                  <input type="number" value={downpaymentAmount} onChange={e => setDownpaymentAmount(Math.max(minDownpayment, Number(e.target.value) || 0))} className="w-full pl-8 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#bf4a53]" min={minDownpayment} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Minimum 50% (₱{minDownpayment.toLocaleString()}) required to secure booking.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Payment Method</h3>
                <p className="text-sm text-gray-500">Select how you'd like to pay the downpayment.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaymentMethod('gcash')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'gcash' ? 'border-[#bf4a53] bg-red-50' : 'border-gray-200 bg-white'}`}>
                  <Smartphone size={28} className={paymentMethod === 'gcash' ? 'text-[#bf4a53]' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-900">GCash</span>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-[#bf4a53] bg-red-50' : 'border-gray-200 bg-white'}`}>
                  <CreditCard size={28} className={paymentMethod === 'card' ? 'text-[#bf4a53]' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-900">Card</span>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl text-sm">
                <p className="font-semibold">Downpayment: ₱{downpaymentAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Remaining balance: ₱{(selectedItem.price - downpaymentAmount).toLocaleString()} (payable at pickup).</p>
              </div>
              <button onClick={handleNext} className="w-full py-3.5 bg-[#bf4a53] text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow">Confirm Payment & Get QR</button>
            </div>
          )}

          {step === 3 && confirmedTx && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
                <p className="text-gray-500 text-sm">Present this QR code at the boutique when you pick up your item.</p>
              </div>
              <div className="bg-white border rounded-2xl p-5 space-y-2 text-sm">
                <p className="font-bold text-gray-900">{selectedItem.name}</p>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(selectedDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{confirmedTx.customer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Size</span><span>{confirmedTx.size}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Downpayment</span><span className="text-[#bf4a53] font-bold">₱{confirmedTx.downpayment.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Balance</span><span>₱{(confirmedTx.amount - confirmedTx.downpayment).toLocaleString()}</span></div>
              </div>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl border shadow-inner">
                  <QrCodeDisplay pattern={generateQRPattern(confirmedTx.id)} />
                </div>
              </div>
              <p className="text-xs text-center text-gray-400">Transaction ID: {confirmedTx.id}</p>
              <button onClick={handleConfirm} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors">Done</button>
            </div>
          )}
        </div>
        {step < 2 && (
          <div className="p-4 border-t bg-gray-50/50 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50">Cancel</button>
            <button onClick={handleNext} className="flex-[2] py-2.5 rounded-full font-bold text-sm bg-[#bf4a53] text-white hover:bg-red-700 shadow">Continue to Payment</button>
          </div>
        )}
      </div>
    </div>
  );
}

function QrCodeDisplay({ pattern }) {
  return (
    <div className="grid grid-cols-5 gap-1 w-32 h-32">
      {Array.from({ length: 25 }, (_, i) => (
        <div key={i} className={`w-full aspect-square ${pattern.charAt(i) === '1' ? 'bg-gray-900' : 'bg-white'}`} />
      ))}
    </div>
  );
}