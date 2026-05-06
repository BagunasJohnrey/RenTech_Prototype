import React, { useState } from 'react';
import { X, Smartphone, CreditCard, CheckCircle2 } from 'lucide-react';

export default function CustomerReservationModal({ item, onClose, onConfirm }) {
  const [date, setDate] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handlePayment = (e) => {
    e.preventDefault();
    if (!date) return;

    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Maria Santos',
      item: item.name,
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Reserved',
      amount: item.price * 0.5,
    };
    onConfirm(newTx);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100/80 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Secure Reservation</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Select date and pay downpayment.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handlePayment} className="p-6 space-y-6">
          <div className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
            <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
              <img src={item.image} alt="item" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">{item.name}</h4>
              <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{item.category}</span>
              <p className="text-sm font-black text-[#bf4a53] mt-2">Full Price: ₱{item.price.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Event Date</label>
            <input
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-[13px] font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Payment Method (Mock PayMongo)</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-[#bf4a53] bg-red-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Smartphone size={24} className="text-[#bf4a53]" />
                <span className="text-xs font-bold text-gray-900">GCash</span>
              </div>
              <div className="border border-gray-200 bg-white hover:bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                <CreditCard size={24} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500">Card</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600">Required Downpayment (50%)</span>
            <span className="text-lg font-black text-gray-900">₱{(item.price * 0.5).toLocaleString()}</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-[13px] font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-sm shadow-gray-900/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Pay & Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}