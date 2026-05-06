import { useState, useRef, useCallback, useEffect } from 'react';
import { Bell, Smartphone, AlertTriangle, X, Loader2 } from 'lucide-react';

const initialNotifications = [
  { id: 1, type: 'sms', text: 'Booking confirmation sent to 0917XXX1234.', time: '2 min ago' },
  { id: 2, type: 'alert', text: 'Return deadline: TX-1041 is due today at 5:00 PM.', time: '1 hour ago' },
  { id: 3, type: 'sms', text: 'Reminder sent to Juan Dela Cruz for Classic Navy Suit.', time: '3 hours ago' },
  { id: 4, type: 'sms', text: 'Payment received for TX-1042 (₱2,000).', time: '5 hours ago' },
  { id: 5, type: 'alert', text: 'Item "Emerald Velvet Evening Gown" needs cleaning.', time: '1 day ago' },
  { id: 6, type: 'sms', text: 'Booking cancellation: TX-1050 refunded.', time: '2 days ago' },
  { id: 7, type: 'alert', text: 'Damaged item report: Charcoal Grey Tuxedo.', time: '3 days ago' },
  { id: 8, type: 'sms', text: 'Staff account created: staff2', time: '4 days ago' },
  { id: 9, type: 'alert', text: 'New reservation: TX-1046 for Vintage Gatsby Dress.', time: '5 days ago' },
  { id: 10, type: 'sms', text: 'SMS failed to send to 0987XXX4321.', time: '6 days ago' },
];

export default function NotificationsDropdown({ role, showNotifications, toggle }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cleared, setCleared] = useState(false);
  const listRef = useRef(null);

  // Reset when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      setCleared(false);
      setVisibleCount(5);
      setLoadingMore(false);
    }
  }, [showNotifications]);

  // Cap visibleCount to current length when items are removed
  useEffect(() => {
    if (visibleCount > notifications.length) {
      setVisibleCount(notifications.length);
    }
  }, [notifications.length, visibleCount]);

  const allLoaded = visibleCount >= notifications.length;

  const handleClearAll = () => {
    setCleared(true);
    setNotifications([]);   // also clear the underlying list
  };

  const handleRemoveOne = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // If the last item is removed while cleared=false, it will automatically show “No new notifications”
  };

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || cleared || allLoaded) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + 5, notifications.length));
        setLoadingMore(false);
      }, 400);
    }
  }, [loadingMore, cleared, allLoaded, notifications.length]);

  const displayedNotifications = cleared
    ? []
    : notifications.slice(0, visibleCount);
  const hasNew = notifications.length > 0;

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`p-2.5 rounded-full relative transition-colors ${
          showNotifications
            ? 'bg-red-50 text-[#bf4a53]'
            : 'bg-gray-50/80 text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Bell size={18} />
        {hasNew && (
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#bf4a53] rounded-full" />
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-top-2 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#bf4a53] bg-red-50 px-2 py-1 rounded-md">
                {notifications.length} new
              </span>
              <button
                onClick={handleClearAll}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-64 overflow-y-auto hide-scrollbar p-4 space-y-2"
          >
            {cleared || notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                {cleared ? 'All notifications cleared' : 'No new notifications'}
              </p>
            ) : displayedNotifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No new notifications</p>
            ) : (
              <>
                {displayedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group p-3 rounded-2xl flex gap-3 relative ${
                      n.type === 'alert' ? 'bg-red-50/50' : 'bg-blue-50/50'
                    }`}
                  >
                    {n.type === 'sms' ? (
                      <Smartphone size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="text-[#bf4a53] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-gray-900">{n.text}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{n.time}</p>
                    </div>
                    {/* Individual remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOne(n.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {loadingMore && (
                  <div className="flex justify-center py-2">
                    <Loader2 size={16} className="text-gray-400 animate-spin" />
                  </div>
                )}
                {allLoaded && !cleared && notifications.length > 0 && (
                  <p className="text-center text-xs text-gray-400 py-2">
                    🎉 You're all caught up!
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}