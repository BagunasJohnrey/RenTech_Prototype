import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function EditItemModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [status, setStatus] = useState(item.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, name, price: parseFloat(price), status });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100/80 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Edit Inventory Item</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">ID: {item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Garment Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-[13px] font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Price (₱)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-[13px] font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Current Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-[13px] font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Reserved">Reserved</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#bf4a53] hover:bg-red-700 rounded-full shadow-sm shadow-red-500/20 transition-all flex items-center gap-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}