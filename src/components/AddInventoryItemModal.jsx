import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function AddInventoryItemModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gown');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('Available');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const newItem = {
      id: Date.now(),
      name,
      category,
      price: parseFloat(price),
      image: imageUrl || 'https://images.unsplash.com/photo-1566162200445-98319fdb5515?auto=format&fit=crop&q=80&w=400', // fallback
      status,
    };
    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100/80">
          <h3 className="font-bold text-xl text-gray-900">Add New Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
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
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="e.g. Golden Sequin Gown"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all cursor-pointer"
              >
                <option>Gown</option>
                <option>Suit</option>
                <option>Formal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Price (₱)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
                placeholder="1500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="https://images.unsplash.com/... (optional)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-[#bf4a53] hover:bg-red-700 rounded-full shadow-sm shadow-red-500/20 transition-all flex items-center gap-2">
              <Plus size={16} /> Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}