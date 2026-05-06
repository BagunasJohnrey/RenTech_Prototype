import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

export default function ProfileSettingsView({ role }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Account & Settings</h2>
        <p className="text-gray-500 font-medium mt-1">Manage your preferences and security.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center shrink-0 text-gray-400">
          <User size={40} />
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{role === 'Customer' ? 'Maria Santos' : 'Admin User'}</h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#bf4a53] bg-red-50 px-2 py-1 rounded-md mt-1 inline-block">
              {role} Role
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100/80">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
              <p className="text-sm font-medium text-gray-900">user@rentech.com</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Phone (Semaphore Linked)</label>
              <p className="text-sm font-medium text-gray-900">+63 917 123 4567</p>
            </div>
          </div>
        </div>
      </div>

      {role !== 'Customer' && (
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={20} /> System Integrations
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-sm text-gray-900">Semaphore SMS Gateway</p>
                <p className="text-xs text-gray-500 mt-0.5">Automated return reminders & booking confirmations.</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-sm text-gray-900">PayMongo Payments</p>
                <p className="text-xs text-gray-500 mt-0.5">Secure GCash & Credit Card downpayments.</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}