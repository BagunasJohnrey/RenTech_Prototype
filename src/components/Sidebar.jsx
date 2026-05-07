import { LogOut } from 'lucide-react';

export default function Sidebar({ role, setRole, activeTab, setActiveTab, navItems, onRequestLogout, customerName }) {
  // Determine display name
  const displayName = role === 'Customer' ? (customerName || 'Customer') : role;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100/50 sticky top-0 h-screen z-20">
      {/* Top area: profile picture + name */}
      <div className="p-8 flex items-center gap-3 border-b border-gray-100/50">
        <img
          src="public/RenTech.png"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-bold text-sm tracking-tight text-gray-900 truncate">{displayName}</h1>
          <p className="text-[10px] text-gray-500">{role}</p>
        </div>
      </div>

      {/* Role switcher – only for Admin */}
      {role === 'Admin' && (
        <div className="px-6 pb-6 mt-4 border-b border-gray-100/50 mb-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="block w-full text-sm font-semibold text-gray-700 bg-gray-50/50 hover:bg-gray-100 border-0 rounded-2xl py-3 px-4 focus:ring-0 cursor-pointer transition-all outline-none"
          >
            <option value="Admin">Owner (Admin)</option>
            <option value="Staff">Boutique Staff</option>
            <option value="Customer">Customer</option>
          </select>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto hide-scrollbar mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id || (item.id === 'Home' && activeTab === 'Dashboard');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'Home' ? 'Dashboard' : item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-red-50/80 text-[#bf4a53]'
                  : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-900'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-[#bf4a53]' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
              {item.special && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#bf4a53] animate-pulse shadow-[0_0_8px_rgba(191,74,83,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User info & actions */}
      <div className="p-6 space-y-4">
        {/* Profile area (Admin/Staff only) – duplicate of top but with online dot */}
        {role !== 'Customer' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 rounded-2xl">
            <img
              src="public/RenTech.png"
              alt={role}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div>
              <p className="text-xs font-semibold text-gray-900">{role} User</p>
              <p className="text-[10px] text-gray-500">Online</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>
        )}

        <button
          onClick={onRequestLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-gray-500 hover:bg-red-50/50 hover:text-[#bf4a53] transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}