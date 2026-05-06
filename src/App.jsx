import { useState } from 'react';
import {
  LayoutGrid, ShoppingBag, Clock, Sparkles, Settings, User,
  ClipboardList, X
} from 'lucide-react';

import { INITIAL_INVENTORY } from './data/inventory';
import { INITIAL_TRANSACTIONS } from './data/transactions';

import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import NotificationsDropdown from './components/NotificationsDropdown';
import DashboardView from './components/DashboardView';
import CatalogView from './components/CatalogView';
import HistoryView from './components/HistoryView';
import AIInsightsView from './components/AIInsightsView';
import ProfileSettingsView from './components/ProfileSettingsView';
import StaffTasksView from './components/StaffTasksView';
import StaffNewRental from './components/StaffNewRental';
import CustomerRentalFlow from './components/CustomerRentalFlow';
import ProcessReturnModal from './components/ProcessReturnModal';
import EditItemModal from './components/EditItemModal';
import AddInventoryItemModal from './components/AddInventoryItemModal';
import ChatbotModal from './components/ChatbotModal';

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  body { font-family: 'Plus Jakarta Sans', sans-serif; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #f3f4f6; border-radius: 20px; }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #e5e7eb; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const navItems = {
  Admin: [
    { id: 'Dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'Catalog', icon: ShoppingBag, label: 'Inventory' },
    { id: 'History', icon: Clock, label: 'Transactions' },
    { id: 'AI Insights', icon: Sparkles, label: 'AI Intelligence', special: true },
    { id: 'Settings', icon: Settings, label: 'System Settings' },
  ],
  Staff: [
    { id: 'Dashboard', icon: LayoutGrid, label: 'Operations' },
    { id: 'Tasks', icon: ClipboardList, label: 'Tasks' },
    { id: 'Catalog', icon: ShoppingBag, label: 'Catalog' },
    { id: 'History', icon: Clock, label: 'Logs & Returns' },
    { id: 'Settings', icon: Settings, label: 'Preferences' },
  ],
  Customer: [
    { id: 'Home', icon: LayoutGrid, label: 'Home' },
    { id: 'Catalog', icon: ShoppingBag, label: 'Collection' },
    { id: 'History', icon: Clock, label: 'My Rentals' },
    { id: 'Profile', icon: User, label: 'Profile' },
  ],
};

export default function RentechApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('Admin');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [staffAccounts, setStaffAccounts] = useState([
    { username: 'staff', password: 'staff' }
  ]);

  // Customer profile (editable in settings)
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Maria Santos',
    contact: '0917 123 4567',
    address: '123 Rizal St, Makati',
  });

  // Modal / page states
  const [showStaffRental, setShowStaffRental] = useState(false);
  const [returnTransaction, setReturnTransaction] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [customerRental, setCustomerRental] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogin = (userRole) => {
    setRole(userRole);
    setIsLoggedIn(true);
    setActiveTab(userRole === 'Customer' ? 'Home' : 'Dashboard');
  };

  // Centralized logout + redirect
  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginPage(false);
    setShowLogoutModal(false);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'Customer') {
      setActiveTab('Catalog');
    } else {
      setActiveTab('Dashboard');
    }
  };

  // Staff rental handler
  const handleStaffNewRental = (complexTx) => {
    const simpleTx = {
      id: complexTx.id,
      customer: complexTx.customer,
      item: complexTx.item,
      date: complexTx.rentalDate || complexTx.date,
      status: 'Active',
      amount: complexTx.balance || complexTx.amount,
    };
    setTransactions([simpleTx, ...transactions]);
    if (complexTx.items && complexTx.items.length > 0) {
      const rentedItemNames = complexTx.items.map(i => i.name);
      setInventory(inventory.map(item =>
        rentedItemNames.includes(item.name) ? { ...item, status: 'Rented' } : item
      ));
    }
    setShowStaffRental(false);
  };

  // Process return
  const handleProcessReturn = (txId) => {
    const tx = transactions.find(t => t.id === txId);
    setTransactions(transactions.map(t => t.id === txId ? { ...t, status: 'Returned' } : t));
    setInventory(inventory.map(item => item.name === tx.item ? { ...item, status: 'Cleaning' } : item));
    setReturnTransaction(null);
  };

  // Customer booking handler
  const handleCustomerBooking = (newTx) => {
    setTransactions([newTx, ...transactions]);
    setInventory(inventory.map(item => item.name === newTx.item ? { ...item, status: 'Reserved' } : item));
    setCustomerRental(null);
    setActiveTab('History');
  };

  const handleAddStaff = (newStaff) => {
    setStaffAccounts([...staffAccounts, newStaff]);
  };

  const handleRemoveStaff = (index) => {
    setStaffAccounts(staffAccounts.filter((_, i) => i !== index));
  };

  const handleAddInventoryItem = (newItem) => {
    setInventory([...inventory, newItem]);
  };

  const currentNav = navItems[role];

  // Render: Landing → Login → Main App
  if (!isLoggedIn) {
    if (showLoginPage) {
      return <Login onLogin={handleLogin} onBack={() => setShowLoginPage(false)} />;
    }
    return (
      <LandingPage onLogin={() => setShowLoginPage(true)} />
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="w-full h-screen bg-[#fcfcfd] flex flex-col md:flex-row overflow-hidden relative text-gray-800">
        
        <Sidebar
          role={role}
          setRole={handleRoleChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navItems={currentNav}
          onRequestLogout={() => setShowLogoutModal(true)} // Opens the global modal
        />

        <main className="grow flex flex-col h-screen overflow-y-auto relative custom-scrollbar pb-24 md:pb-0">
          <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 px-5 md:px-10 py-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-[#bf4a53] to-red-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shadow-red-500/20">RT</div>
              {role === 'Admin' ? (
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="text-sm font-bold text-gray-800 bg-transparent border-0 py-0 pl-1 pr-6 focus:ring-0 outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              ) : (
                <span className="text-sm font-bold text-gray-800">{role} Portal</span>
              )}
            </div>

            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-gray-800">{role} Portal</h2>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {role !== 'Customer' && (
                <>
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    + Add Item
                  </button>
                  {/* Settings gear for mobile (Admin/Staff) */}
                  <button
                    onClick={() => setActiveTab('Settings')}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </button>
                </>
              )}
              <NotificationsDropdown
                role={role}
                showNotifications={showNotifications}
                toggle={() => setShowNotifications(!showNotifications)}
              />
            </div>
          </header>

          <div className="p-5 md:p-10 max-w-7xl mx-auto w-full">
            {(activeTab === 'Dashboard' || activeTab === 'Home') && (
              <DashboardView
                role={role}
                transactions={transactions}
                inventory={inventory}
                onOpenNewRental={() => setShowStaffRental(true)}
                onNavigate={setActiveTab}
                onOpenChatbot={() => setShowChatbot(true)}
              />
            )}
            {activeTab === 'Tasks' && (
              <StaffTasksView transactions={transactions} inventory={inventory} />
            )}
            {activeTab === 'Catalog' && (
              <CatalogView
                role={role}
                inventory={inventory}
                transactions={transactions}
                onBook={(item, date) => setCustomerRental({ item, date })}
                onCustomerBook={(item) => setCustomerRental({ item, date: new Date().toISOString().split('T')[0] })}
                onEdit={setEditingItem}
              />
            )}
            {activeTab === 'History' && (
              <HistoryView role={role} transactions={transactions} onReturn={setReturnTransaction} />
            )}
            {activeTab === 'AI Insights' && (
              <AIInsightsView transactions={transactions} inventory={inventory} />
            )}
            {(activeTab === 'Profile' || activeTab === 'Settings') && (
              <ProfileSettingsView
                role={role}
                staffList={staffAccounts}
                onAddStaff={handleAddStaff}
                onRemoveStaff={handleRemoveStaff}
                customerInfo={customerInfo}
                onUpdateCustomer={setCustomerInfo}
                onRequestLogout={() => setShowLogoutModal(true)} // Opens the global modal
              />
            )}
          </div>
        </main>

        <MobileBottomNav
          role={role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentNav={currentNav}
          onFabClick={() => {
            if (role === 'Admin') setActiveTab('AI Insights');
            else if (role === 'Staff') setShowStaffRental(true);
            else setCustomerRental({ item: null, date: new Date().toISOString().split('T')[0] });
          }}
        />

        {/* Modals */}
        {returnTransaction && (
          <ProcessReturnModal transaction={returnTransaction} onClose={() => setReturnTransaction(null)} onComplete={handleProcessReturn} />
        )}
        {editingItem && (
          <EditItemModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={(updatedItem) => {
              setInventory(inventory.map(i => i.id === updatedItem.id ? updatedItem : i));
              setEditingItem(null);
            }}
          />
        )}
        {showAddItemModal && (
          <AddInventoryItemModal
            onClose={() => setShowAddItemModal(false)}
            onAdd={handleAddInventoryItem}
          />
        )}

        {showStaffRental && (
          <StaffNewRental
            inventory={inventory}
            onAddTransaction={handleStaffNewRental}
            onClose={() => setShowStaffRental(false)}
          />
        )}

        {customerRental && (
          <CustomerRentalFlow
            item={customerRental.item}
            selectedDate={customerRental.date}
            inventory={inventory}
            customerInfo={customerInfo}
            onClose={() => setCustomerRental(null)}
            onConfirm={handleCustomerBooking}
          />
        )}

        {showChatbot && <ChatbotModal onClose={() => setShowChatbot(false)} />}

        {/* Global Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">Confirm Sign Out</h3>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:bg-gray-100 rounded-full p-1"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to sign out? You will be returned to the landing page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-full font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-full font-bold text-sm bg-[#bf4a53] text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}