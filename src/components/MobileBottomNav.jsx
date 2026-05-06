import { Plus, Search, Sparkles } from 'lucide-react';

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
  // Determine FAB content and action based on role
  const fabContent =
    role === 'Admin' ? (
      <Sparkles size={22} strokeWidth={2.5} />
    ) : role === 'Customer' ? (
      <Search size={22} strokeWidth={2.5} />
    ) : (
      <Plus size={24} strokeWidth={2.5} />
    );

  const handleFabClick = () => {
    if (role === 'Admin') {
      setActiveTab('AI Insights');        // go to AI Insights for Admin
    } else {
      onFabClick();                       // Staff → new rental, Customer → catalog
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100/50 flex justify-around items-end pb-6 pt-3 px-2 z-40 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      {/* FAB */}
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
      <div className="w-16" /> {/* Spacer for FAB */}
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