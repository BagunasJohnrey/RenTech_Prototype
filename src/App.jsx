import { useState } from 'react';
import {
  LayoutGrid, ShoppingBag, Clock, Sparkles, Settings, User,
  ClipboardList, Users
} from 'lucide-react';

import { INITIAL_INVENTORY } from './data/inventory';
import { INITIAL_TRANSACTIONS } from './data/transactions';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import NotificationsDropdown from './components/NotificationsDropdown';
import DashboardView from './components/DashboardView';
import CatalogView from './components/CatalogView';
import HistoryView from './components/HistoryView';
import AIInsightsView from './components/AIInsightsView';
import ProfileSettingsView from './components/ProfileSettingsView';
import StaffTasksView from './components/StaffTasksView';
import StaffManagement from './components/StaffManagement';
import NewRentalModal from './components/NewRentalModal';
import CustomerReservationModal from './components/CustomerReservationModal';
import ProcessReturnModal from './components/ProcessReturnModal';
import EditItemModal from './components/EditItemModal';
import AddInventoryItemModal from './components/AddInventoryItemModal';

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
    { id: 'Staff', icon: Users, label: 'Staff' },       // new
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

  // Modal states
  const [isNewRentalModalOpen, setIsNewRentalModalOpen] = useState(false);
  const [reservationItem, setReservationItem] = useState(null);
  const [returnTransaction, setReturnTransaction] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const handleLogin = (userRole) => {
    setRole(userRole);
    setIsLoggedIn(true);
    setActiveTab(userRole === 'Customer' ? 'Catalog' : 'Dashboard');
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'Customer') {
      setActiveTab('Catalog');
    } else {
      setActiveTab('Dashboard');
    }
  };

  const handleProcessRental = (newTx) => {
    setTransactions([newTx, ...transactions]);
    setInventory(inventory.map(item => item.name === newTx.item ? { ...item, status: 'Rented' } : item));
    setIsNewRentalModalOpen(false);
  };

  const handleProcessReturn = (txId) => {
    const tx = transactions.find(t => t.id === txId);
    setTransactions(transactions.map(t => t.id === txId ? { ...t, status: 'Returned' } : t));
    setInventory(inventory.map(item => item.name === tx.item ? { ...item, status: 'Cleaning' } : item));
    setReturnTransaction(null);
  };

  const handleCustomerBooking = (newTx) => {
    setTransactions([newTx, ...transactions]);
    setInventory(inventory.map(item => item.name === newTx.item ? { ...item, status: 'Reserved' } : item));
    setReservationItem(null);
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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
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
        />

        <main className="grow flex flex-col h-screen overflow-y-auto relative custom-scrollbar pb-24 md:pb-0">
          <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 px-5 md:px-10 py-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-[#bf4a53] to-red-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shadow-red-500/20">RT</div>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="text-sm font-bold text-gray-800 bg-transparent border-0 py-0 pl-1 pr-6 focus:ring-0 outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-gray-800">{role} Portal</h2>
            </div>

            {role !== 'Customer' && (
              <button
                onClick={() => setShowAddItemModal(true)}
                className="mr-2 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
              >
                + Add Item
              </button>
            )}
            <NotificationsDropdown
              role={role}
              showNotifications={showNotifications}
              toggle={() => setShowNotifications(!showNotifications)}
            />
          </header>

          <div className="p-5 md:p-10 max-w-7xl mx-auto w-full">
            {(activeTab === 'Dashboard' || activeTab === 'Home') && (
              <DashboardView role={role} transactions={transactions} inventory={inventory} onOpenNewRental={() => setIsNewRentalModalOpen(true)} />
            )}
            {activeTab === 'Tasks' && (
              <StaffTasksView transactions={transactions} inventory={inventory} />
            )}
            {activeTab === 'Catalog' && (
              <CatalogView
                role={role}
                inventory={inventory}
                transactions={transactions}
                onBook={setReservationItem}
                onEdit={setEditingItem}
              />
            )}
            {activeTab === 'History' && (
              <HistoryView role={role} transactions={transactions} onReturn={setReturnTransaction} />
            )}
            {activeTab === 'AI Insights' && <AIInsightsView />}
            {activeTab === 'Staff' && role === 'Admin' && (
              <StaffManagement
                staffList={staffAccounts}
                onAddStaff={handleAddStaff}
                onRemoveStaff={handleRemoveStaff}
              />
            )}
            {(activeTab === 'Profile' || activeTab === 'Settings') && <ProfileSettingsView role={role} />}
          </div>
        </main>

        <MobileBottomNav
          role={role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentNav={currentNav}
          onFabClick={() => (role !== 'Customer' ? setIsNewRentalModalOpen(true) : setActiveTab('Catalog'))}
        />

        {/* Modals */}
        {isNewRentalModalOpen && (
          <NewRentalModal inventory={inventory} onClose={() => setIsNewRentalModalOpen(false)} onAdd={handleProcessRental} />
        )}
        {reservationItem && (
          <CustomerReservationModal item={reservationItem} onClose={() => setReservationItem(null)} onConfirm={handleCustomerBooking} />
        )}
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
      </div>
    </>
  );
}