import React from 'react';
import { Smartphone, AlertTriangle, Bell } from 'lucide-react';

export default function NotificationsDropdown({ role, showNotifications, toggle }) {
  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`p-2.5 rounded-full relative transition-colors ${
          showNotifications ? 'bg-red-50 text-[#bf4a53]' : 'bg-gray-50/80 text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Bell size={18} />
        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#bf4a53] rounded-full"></span>
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 z-50">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="font-bold text-gray-900 text-sm">Notifications</span>
            <span className="text-[10px] font-bold text-[#bf4a53] bg-red-50 px-2 py-1 rounded-md">2 New</span>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50/50 rounded-2xl flex gap-3">
              <Smartphone size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-gray-900">Semaphore SMS Sent</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Booking confirmation sent to 0917XXX1234.</p>
              </div>
            </div>
            {role !== 'Customer' && (
              <div className="p-3 bg-red-50/50 rounded-2xl flex gap-3">
                <AlertTriangle size={16} className="text-[#bf4a53] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">Return Deadline Alert</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">TX-1041 is due for return today by 5:00 PM.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}