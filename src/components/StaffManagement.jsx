import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function StaffManagement({ staffList, onAddStaff, onRemoveStaff }) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    onAddStaff({ username: newUsername, password: newPassword });
    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Management</h2>
        <p className="text-gray-500 font-medium mt-1">Create and remove staff accounts.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Add New Staff</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
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
            className="bg-gray-900 text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Current Staff</h3>
        {staffList.length === 0 ? (
          <p className="text-sm text-gray-500">No staff accounts yet.</p>
        ) : (
          <div className="space-y-3">
            {staffList.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.username}</p>
                  <p className="text-xs text-gray-500">Password: {s.password}</p>
                </div>
                <button
                  onClick={() => onRemoveStaff(i)}
                  className="text-red-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}