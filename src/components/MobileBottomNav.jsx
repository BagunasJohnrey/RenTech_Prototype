import { Plus, Sparkles } from 'lucide-react';

function BottomNavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${
        isActive ? 'text-[#bf4a53]' : 'text-gray-400'
      }`}
    >
      <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-red-50/80' : 'bg-transparent'}`}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-semibold tracking-wide">
        {item.label.split(' ')[0]}
      </span>
    </button>
  );
}

export default function MobileBottomNav({ role, activeTab, setActiveTab, currentNav, onFabClick }) {
  // Admin: AI Insights is the central FAB, other four tabs are shown normally
  if (role === 'Admin') {
    const regularItems = currentNav.filter((item) => !item.special);   // Dashboard, Catalog, Transactions, Settings
    const specialItem = currentNav.find((item) => item.special);       // AI Insights

    return (
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100/50 flex justify-around items-end pb-6 pt-3 px-2 z-40 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        {/* Four regular tabs */}
        {regularItems.slice(0, 2).map((item) => (
          <BottomNavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        {/* Central FAB: AI Insights */}
        <button
          onClick={() => setActiveTab(specialItem?.id || 'AI Insights')}
          className={`relative -top-5 w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 text-white transform transition-transform active:scale-95 z-50 border-4 border-[#fcfcfd] ${
            activeTab === specialItem?.id
              ? 'bg-[#bf4a53]'
              : 'bg-gradient-to-br from-[#bf4a53] to-red-600'
          }`}
        >
          {specialItem ? (
            <specialItem.icon size={22} strokeWidth={2.5} />
          ) : (
            <Sparkles size={22} strokeWidth={2.5} />
          )}
        </button>

        {/* Remaining two regular tabs */}
        {regularItems.slice(2).map((item) => (
          <BottomNavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>
    );
  }

  // Staff and Customer: keep the original FAB layout
  const fabContent =
    role === 'Staff' ? (
      <Plus size={24} strokeWidth={2.5} />
    ) : (
      <Plus size={24} strokeWidth={2.5} />   // Customer FAB opens Catalog / rental flow
    );

  const handleFabClick = () => {
    onFabClick();   // Staff → new rental, Customer → open catalog
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100/50 flex justify-around items-end pb-6 pt-3 px-2 z-40 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      <button
        onClick={handleFabClick}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#bf4a53] to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 text-white transform transition-transform active:scale-95 z-50 border-4 border-[#fcfcfd]"
      >
        {fabContent}
      </button>

      {currentNav.slice(0, 2).map((item) => (
        <BottomNavItem
          key={item.id}
          item={item}
          isActive={activeTab === item.id || (item.id === 'Home' && activeTab === 'Dashboard')}
          onClick={() => setActiveTab(item.id === 'Home' ? 'Dashboard' : item.id)}
        />
      ))}
      <div className="w-16" />
      {currentNav.slice(2, 4).map((item) => (
        <BottomNavItem
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
        />
      ))}
    </nav>
  );
}