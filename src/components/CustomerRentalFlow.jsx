import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Smartphone, CreditCard, Search, Loader2, CheckCircle2, ScanLine } from 'lucide-react';

const ITEMS_PER_LOAD = 6;
const PAYMENT_PROCESSING_DELAY = 2000; // 2 second simulation

const generateQRPattern = (data) => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  let pattern = '';
  for (let i = 0; i < 25; i++) {
    pattern += ((hash >> (i % 32)) & 1) ? '1' : '0';
  }
  return pattern;
};

export default function CustomerRentalFlow({
  item: preselectedItem,
  selectedDate: preselectedDate,
  inventory,
  customerInfo,   // { name, contact, address }
  onClose,
  onConfirm,
}) {
  // Determine starting step: 0 (catalog) if no preselected item, else 1 (details)
  const [step, setStep] = useState(() => (preselectedItem ? 1 : 0));
  const [selectedItem, setSelectedItem] = useState(preselectedItem || null);
  const [selectedDate] = useState(preselectedDate || new Date().toISOString().split('T')[0]);
  const [useAccountDetails, setUseAccountDetails] = useState(true);
  const [customer, setCustomer] = useState({
    name: customerInfo?.name || 'Maria Santos',
    contact: customerInfo?.contact || '0917 123 4567',
    address: customerInfo?.address || '123 Rizal St, Makati',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [selectedSize, setSelectedSize] = useState('');
  const minDownpayment = selectedItem ? Math.round(selectedItem.price * 0.5) : 0;
  const [downpaymentAmount, setDownpaymentAmount] = useState(minDownpayment);
  const [confirmedTx, setConfirmedTx] = useState(null);

  // Payment processing states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // QR details modal
  const [showQRDetails, setShowQRDetails] = useState(false);

  // Catalog state (step 0)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [loadingMore, setLoadingMore] = useState(false);
  const catalogRef = useRef(null);

  // Filtered catalog – only AVAILABLE items for customers
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

  // Reset visibility when filters change
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

  // Toggle between account details and custom details
  const toggleAccountDetails = (useAccount) => {
    setUseAccountDetails(useAccount);
    if (useAccount) {
      setCustomer({
        name: customerInfo?.name || 'Maria Santos',
        contact: customerInfo?.contact || '',
        address: customerInfo?.address || '',
        notes: customer.notes, // keep notes
      });
    } else {
      setCustomer({ name: '', contact: '', address: '', notes: customer.notes });
    }
  };

  const buildTransaction = () => ({
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
  });

  // Navigation
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
      // Simulate payment processing
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        const tx = buildTransaction();
        setConfirmedTx(tx);
        setTimeout(() => {
          setPaymentSuccess(false);
          setStep(3);
        }, 1500);
      }, PAYMENT_PROCESSING_DELAY);
      return;
    }
  };

  const handleConfirm = () => onConfirm(confirmedTx);

  // QR tap handler – open details modal
  const handleQRTap = () => {
    if (confirmedTx) setShowQRDetails(true);
  };

  const qrData = confirmedTx ? JSON.stringify(confirmedTx) : 'booking_info';

  // ---- Step 0: Catalog (shown only when no item preselected) ----
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
            <h2 className="text-xl font-bold text-gray-900">Select Item</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
          </div>
          <div className="p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium focus:outline-none focus:border-[#bf4a53]"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto mb-4">
              {['all', 'gown', 'suit', 'formal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${
                    activeCategory === cat
                      ? 'bg-[#bf4a53] text-white border-[#bf4a53]'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div
              ref={catalogRef}
              onScroll={handleCatalogScroll}
              className="flex-1 overflow-y-auto pr-1 hide-scrollbar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer border-2 transition-all ${
                      selectedItem?.id === item.id
                        ? 'border-[#bf4a53] shadow-md'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt="" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-500">₱{item.price.toLocaleString()}</p>
                    </div>
                    {selectedItem?.id === item.id && (
                      <svg className="w-5 h-5 text-[#bf4a53]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <div className="py-3 flex justify-center">
                {loadingMore && <Loader2 size={18} className="text-gray-400 animate-spin" />}
                {!loadingMore && allLoaded && filteredCatalog.length > 0 && (
                  <p className="text-xs text-gray-400">All items loaded</p>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50/50 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleNext} className="flex-[2] py-2.5 rounded-full font-bold text-sm bg-[#bf4a53] text-white hover:bg-red-700 shadow">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Steps 1–3 (Details, Payment, Receipt) ----
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Payment processing overlay */}
        {isProcessingPayment && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
            <Loader2 size={48} className="text-[#bf4a53] animate-spin" />
            <p className="font-bold text-gray-900">Processing Payment…</p>
            <p className="text-sm text-gray-500">Please do not close this window</p>
          </div>
        )}

        {paymentSuccess && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
            <p className="font-bold text-gray-900 text-xl">Payment Confirmed!</p>
            <p className="text-sm text-gray-500">Redirecting to your receipt…</p>
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
          <h2 className="text-xl font-bold text-gray-900">Complete Booking</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center py-4 px-6 bg-gray-50/50">
          {['Details', 'Payment', 'Receipt'].map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  step >= idx + 1
                    ? 'bg-[#bf4a53] border-[#bf4a53] text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className={`text-[10px] font-bold mt-1 ${step >= idx + 1 ? 'text-[#bf4a53]' : 'text-gray-400'}`}>
                {label}
              </span>
              {idx < 2 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step > idx + 1 ? 'bg-[#bf4a53]' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Details */}
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
                  <button
                    onClick={() => toggleAccountDetails(true)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border ${
                      useAccountDetails ? 'bg-[#bf4a53] text-white border-[#bf4a53]' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    Me ({customerInfo?.name?.split(' ')[0] || 'Maria'})
                  </button>
                  <button
                    onClick={() => toggleAccountDetails(false)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border ${
                      !useAccountDetails ? 'bg-[#bf4a53] text-white border-[#bf4a53]' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    Someone else
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text" placeholder="Full Name" value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                  disabled={useAccountDetails}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="tel" placeholder="Contact No." value={customer.contact}
                    onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                    className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                    disabled={useAccountDetails}
                  />
                  <input
                    type="text" placeholder="Address" value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                    disabled={useAccountDetails}
                  />
                </div>
                <textarea
                  placeholder="Special notes (e.g. size preference, theme)" value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full p-3 bg-gray-50 rounded-xl border text-sm min-h-[80px] focus:outline-none focus:border-[#bf4a53]"
                />

                {/* Size selection */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                    required
                  >
                    <option value="">-- Select Size --</option>
                    {['XS','S','M','L','XL','XXL','Custom / Measurements'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase">Required Downpayment</p>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₱</span>
                  <input
                    type="number"
                    value={downpaymentAmount}
                    onChange={(e) => setDownpaymentAmount(Math.max(minDownpayment, Number(e.target.value) || 0))}
                    className="w-full pl-8 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#bf4a53]"
                    min={minDownpayment}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Minimum 50% (₱{minDownpayment.toLocaleString()}) required to secure booking.</p>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Payment Method</h3>
                <p className="text-sm text-gray-500">Select how you'd like to pay the downpayment.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('gcash')}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'gcash' ? 'border-[#bf4a53] bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Smartphone size={28} className={paymentMethod === 'gcash' ? 'text-[#bf4a53]' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-900">GCash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card' ? 'border-[#bf4a53] bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <CreditCard size={28} className={paymentMethod === 'card' ? 'text-[#bf4a53]' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-900">Card</span>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl text-sm">
                <p className="font-semibold">Downpayment: ₱{downpaymentAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Remaining balance: ₱{(selectedItem.price - downpaymentAmount).toLocaleString()} (payable at pickup).</p>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-[#bf4a53] text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow"
              >
                Confirm Payment
              </button>
            </div>
          )}

          {/* Step 3: Receipt with QR */}
          {step === 3 && confirmedTx && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
                <p className="text-gray-500 text-sm">Tap the QR code to view your booking details (staff scan simulation).</p>
              </div>
              <div className="bg-white border rounded-2xl p-5 space-y-2 text-sm">
                <p className="font-bold text-gray-900">{selectedItem.name}</p>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(selectedDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{confirmedTx.customer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Size</span><span>{confirmedTx.size}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Downpayment</span><span className="text-[#bf4a53] font-bold">₱{confirmedTx.downpayment.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Balance</span><span>₱{(confirmedTx.amount - confirmedTx.downpayment).toLocaleString()}</span></div>
              </div>

              {/* Interactive QR */}
              <div className="flex justify-center">
                <button
                  onClick={handleQRTap}
                  className="relative bg-white p-4 rounded-2xl border shadow-inner group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                  title="Tap to simulate QR scan"
                >
                  <QrCodeDisplay pattern={generateQRPattern(qrData)} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-2xl">
                    <div className="flex items-center gap-2 text-[#bf4a53] font-bold">
                      <ScanLine size={20} />
                      Tap to view
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-center text-gray-400">Transaction ID: {confirmedTx.id}</p>
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {step < 2 && (
          <div className="p-4 border-t bg-gray-50/50 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleNext} className="flex-[2] py-2.5 rounded-full font-bold text-sm bg-[#bf4a53] text-white hover:bg-red-700 shadow">
              Continue to Payment
            </button>
          </div>
        )}
      </div>

      {/* QR Details Modal (staff scan simulation) */}
      {showQRDetails && confirmedTx && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm"
          onClick={() => setShowQRDetails(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">Booking Info (QR Scan)</h3>
              <button onClick={() => setShowQRDetails(false)} className="text-gray-400 hover:bg-gray-100 rounded-full p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono font-bold">{confirmedTx.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-bold">{confirmedTx.customer}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Item</span><span>{confirmedTx.item}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Size</span><span>{confirmedTx.size}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{confirmedTx.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-emerald-600 font-bold">{confirmedTx.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Downpayment</span><span>₱{confirmedTx.downpayment.toLocaleString()}</span></div>
            </div>
            <button
              onClick={() => setShowQRDetails(false)}
              className="w-full mt-6 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
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