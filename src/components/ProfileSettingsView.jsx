import { useState } from 'react';
import { User, ShieldCheck, Plus, Trash2, Users, LogOut, MessageSquare } from 'lucide-react';

const DEFAULT_TEMPLATES = {
  bookingConfirmation: `Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.`,
  returnReminder: `Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. – RENTECH`,
  overdueAlert: `URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. – RENTECH`,
  paymentConfirmation: `Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. – RENTECH`,
};

export default function ProfileSettingsView({
  role,
  staffList,
  onAddStaff,
  onRemoveStaff,
  customerInfo,
  onUpdateCustomer,
  onRequestLogout,
}) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editCustomer, setEditCustomer] = useState(false);
  const [localCustomer, setLocalCustomer] = useState(customerInfo || { name: '', contact: '', address: '' });
  const [saveMessage, setSaveMessage] = useState('');

  // SMS Templates state
  const [templates, setTemplates] = useState({ ...DEFAULT_TEMPLATES });
  const [editingTemplate, setEditingTemplate] = useState(null); // which template key is being edited
  const [templateEditValue, setTemplateEditValue] = useState('');
  const [templateSaveMsg, setTemplateSaveMsg] = useState('');

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    onAddStaff({ username: newUsername, password: newPassword });
    setNewUsername('');
    setNewPassword('');
  };

  const handleSaveCustomer = () => {
    onUpdateCustomer(localCustomer);
    setEditCustomer(false);
    setSaveMessage('Profile updated!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  // ---------- SMS Template handlers ----------
  const startEditTemplate = (key) => {
    setEditingTemplate(key);
    setTemplateEditValue(templates[key]);
    setTemplateSaveMsg('');
  };

  const cancelEditTemplate = () => {
    setEditingTemplate(null);
    setTemplateEditValue('');
  };

  const saveTemplate = (key) => {
    setTemplates({ ...templates, [key]: templateEditValue });
    setEditingTemplate(null);
    setTemplateSaveMsg(`Template '${key}' saved!`);
    setTimeout(() => setTemplateSaveMsg(''), 2500);
  };

  const resetTemplate = (key) => {
    setTemplates({ ...templates, [key]: DEFAULT_TEMPLATES[key] });
    if (editingTemplate === key) {
      setTemplateEditValue(DEFAULT_TEMPLATES[key]);
    }
    setTemplateSaveMsg(`'${key}' reset to default.`);
    setTimeout(() => setTemplateSaveMsg(''), 2500);
  };

  const resetAllTemplates = () => {
    setTemplates({ ...DEFAULT_TEMPLATES });
    setEditingTemplate(null);
    setTemplateSaveMsg('All templates reset to defaults.');
    setTimeout(() => setTemplateSaveMsg(''), 2500);
  };

  const templateLabels = {
    bookingConfirmation: 'Booking Confirmation',
    returnReminder: 'Return Reminder',
    overdueAlert: 'Overdue Alert',
    paymentConfirmation: 'Payment Confirmation',
  };

  const availablePlaceholders = `{customerName}, {itemName}, {rentalDate}, {returnDate}, {qrCode}, {downpaymentAmount}, {balanceAmount}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Account & Settings</h2>
        <p className="text-gray-500 font-medium mt-1">Manage your preferences and security.</p>
      </div>

      {/* Profile card (unchanged) */}
      <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center shrink-0 text-gray-400">
          <User size={40} />
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {role === 'Customer' ? (customerInfo?.name || 'Customer') : 'Admin User'}
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#bf4a53] bg-red-50 px-2 py-1 rounded-md mt-1 inline-block">
              {role} Role
            </span>
          </div>

          {role === 'Customer' ? (
            editCustomer ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={localCustomer.name}
                  onChange={(e) => setLocalCustomer({ ...localCustomer, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={localCustomer.contact}
                  onChange={(e) => setLocalCustomer({ ...localCustomer, contact: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                  placeholder="Contact Number"
                />
                <input
                  type="text"
                  value={localCustomer.address}
                  onChange={(e) => setLocalCustomer({ ...localCustomer, address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border text-sm focus:outline-none focus:border-[#bf4a53]"
                  placeholder="Address"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCustomer}
                    className="px-4 py-2 bg-[#bf4a53] text-white rounded-full text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditCustomer(false); setLocalCustomer(customerInfo); }}
                    className="px-4 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {saveMessage && <p className="text-xs text-emerald-600 font-bold mt-1">{saveMessage}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Name</p>
                <p className="text-sm font-medium text-gray-900">{customerInfo.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Contact</p>
                <p className="text-sm font-medium text-gray-900">{customerInfo.contact}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Address</p>
                <p className="text-sm font-medium text-gray-900">{customerInfo.address}</p>
                <button
                  onClick={() => setEditCustomer(true)}
                  className="mt-3 text-xs font-bold text-[#bf4a53] hover:underline"
                >
                  Edit Profile
                </button>
              </div>
            )
          ) : (
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
          )}
        </div>
      </div>

      {/* System Integrations (Admin & Staff) */}
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

      {/* SMS Templates – Admin only */}
      {role === 'Admin' && (
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#bf4a53]" /> SMS Templates
          </h3>
          <p className="text-sm text-gray-500">Customize the SMS messages sent to customers. Use placeholders like {`{customerName}`}, {`{itemName}`}, etc. They will be replaced automatically.</p>
          <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
            Available placeholders: {availablePlaceholders}
          </div>
          {Object.keys(templates).map((key) => (
            <div key={key} className="border border-gray-200 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-900">{templateLabels[key]}</h4>
                <div className="flex gap-2">
                  {editingTemplate === key ? (
                    <>
                      <button onClick={cancelEditTemplate} className="text-xs font-semibold text-gray-500 hover:underline">Cancel</button>
                      <button onClick={() => saveTemplate(key)} className="text-xs font-semibold text-[#bf4a53] hover:underline">Save</button>
                    </>
                  ) : (
                    <button onClick={() => startEditTemplate(key)} className="text-xs font-semibold text-[#bf4a53] hover:underline">Edit</button>
                  )}
                  <button onClick={() => resetTemplate(key)} className="text-xs font-semibold text-gray-400 hover:text-gray-600">Reset</button>
                </div>
              </div>
              {editingTemplate === key ? (
                <textarea
                  value={templateEditValue}
                  onChange={(e) => setTemplateEditValue(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border text-sm min-h-[100px] focus:outline-none focus:border-[#bf4a53]"
                />
              ) : (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl whitespace-pre-wrap">{templates[key]}</p>
              )}
            </div>
          ))}
          <button onClick={resetAllTemplates} className="text-sm font-bold text-red-500 hover:underline">Reset all templates to defaults</button>
          {templateSaveMsg && <p className="text-xs text-emerald-600 font-bold mt-2">{templateSaveMsg}</p>}
        </div>
      )}

      {/* Staff Management (Admin only) */}
      {role === 'Admin' && staffList !== undefined && (
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-[#bf4a53]" /> Staff Management
          </h3>

          <form onSubmit={handleAddStaff} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400"
              required
            />
            <button
              type="submit"
              className="bg-[#bf4a53] text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm shadow-red-500/20"
            >
              <Plus size={16} /> Add
            </button>
          </form>

          {staffList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No staff accounts yet.</p>
          ) : (
            <div className="space-y-3">
              {staffList.map((staff, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{staff.username}</p>
                    <p className="text-xs text-gray-500">Password: {staff.password}</p>
                  </div>
                  <button
                    onClick={() => onRemoveStaff(index)}
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sign Out */}
      <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 md:p-8">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Account Actions</h3>
        <p className="text-sm text-gray-500 mb-4">
          You can sign out of your account and return to the landing page.
        </p>
        <button
          onClick={onRequestLogout}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50 text-[#bf4a53] font-bold text-sm rounded-full hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}