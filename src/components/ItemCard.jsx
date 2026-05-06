import { ImageIcon, Edit3 } from 'lucide-react';

export default function ItemCard({ item, role, onBook, onEdit }) {
  const statusColors = {
    Available: 'bg-emerald-500',
    Rented: 'bg-blue-500',
    Reserved: 'bg-indigo-400',
    Cleaning: 'bg-orange-400',
    Damaged: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={32} />
          </div>
        )}

        {role !== 'Customer' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[item.status]}`} />
            <span className="text-[10px] font-bold text-gray-800 tracking-wide">{item.status}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          {item.category}
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight line-clamp-2">{item.name}</h3>
        <p className="text-gray-900 font-bold text-sm mb-5">₱{item.price.toLocaleString()}</p>

        <div className="mt-auto">
          {role === 'Customer' ? (
            <button
              onClick={onBook}
              disabled={item.status !== 'Available'}
              className={`w-full font-semibold py-2.5 rounded-full text-[13px] shadow-sm transition-colors ${
                item.status === 'Available'
                  ? 'bg-white border border-gray-200 text-gray-900 hover:border-gray-400'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {item.status === 'Available' ? 'Rent Now' : 'Unavailable'}
            </button>
          ) : (
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-1.5 bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-full text-[13px] hover:bg-gray-100 transition-colors"
            >
              <Edit3 size={14} /> Edit Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}