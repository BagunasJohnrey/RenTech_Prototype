import { useState } from 'react';
import { X } from 'lucide-react';

export default function ProcessReturnModal({ transaction, onClose, onComplete }) {
  const [isLate, setIsLate] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');

  const basePenalty = isLate ? 500 : 0;
  const damageFee = isDamaged ? 1000 : 0;
  const totalFees = basePenalty + damageFee;

  const handleComplete = () => {
    // Optionally you could pass returnPhotoUrl to the parent if needed,
    // here we just close and complete the return.
    onComplete(transaction.id);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100/80">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Process Return</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              ID: {transaction.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-gray-50 rounded-2xl text-sm">
            <p>
              <span className="text-gray-500 font-medium">Customer:</span>{' '}
              <strong className="text-gray-900 ml-1">
                {transaction.customer}
              </strong>
            </p>
            <p className="mt-1">
              <span className="text-gray-500 font-medium">Item:</span>{' '}
              <strong className="text-gray-900 ml-1">
                {transaction.item}
              </strong>
            </p>
          </div>

          {/* Fee toggles */}
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200/80 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Late Return Penalty
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Automated rule: +₱500 per day
                </p>
              </div>
              <input
                type="checkbox"
                checked={isLate}
                onChange={(e) => setIsLate(e.target.checked)}
                className="w-5 h-5 accent-[#bf4a53]"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200/80 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Damage Fee Assessment
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Deducted from deposit
                </p>
              </div>
              <input
                type="checkbox"
                checked={isDamaged}
                onChange={(e) => setIsDamaged(e.target.checked)}
                className="w-5 h-5 accent-[#bf4a53]"
              />
            </label>
          </div>

          {/* Return Condition Photo URL (shown only when damaged) */}
          {isDamaged && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Return Condition Photo URL (Mock)
              </label>
              <input
                type="url"
                value={returnPhotoUrl}
                onChange={(e) => setReturnPhotoUrl(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-[13px] font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
                placeholder="https://... (damage evidence)"
              />
            </div>
          )}

          {/* Total fees */}
          <div className="bg-gray-900 p-4 rounded-2xl flex justify-between items-center text-white">
            <span className="text-sm font-medium">Additional Fees</span>
            <span className="text-lg font-bold">
              ₱{totalFees.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#bf4a53] hover:bg-red-700 rounded-full shadow-sm shadow-red-500/20 transition-all flex items-center gap-2"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}