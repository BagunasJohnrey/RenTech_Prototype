import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaffTasksView({ transactions }) {
  const today = new Date('2026-05-06');

  // Calendar navigation
  const [currentMonth, setCurrentMonth] = useState(4); // May
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState(null);

  // SMS
  const [smsModalTx, setSmsModalTx] = useState(null);

  // Pagination
  const [overduePage, setOverduePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const itemsPerPage = 5; // changed from 3 to 5

  // Full‑view modals
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  // --- Data ---
  const overdueItems = transactions.filter(tx => {
    if (tx.status !== 'Active') return false;
    const txDate = new Date(tx.date);
    return txDate < today;
  });

  const upcoming = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= today;
  });

  // Pagination slices (no resetting effect – button disabled prevents invalid pages)
  const totalOverduePages = Math.ceil(overdueItems.length / itemsPerPage);
  const startOverdue = (overduePage - 1) * itemsPerPage;
  const paginatedOverdue = overdueItems.slice(startOverdue, startOverdue + itemsPerPage);

  const totalUpcomingPages = Math.ceil(upcoming.length / itemsPerPage);
  const startUpcoming = (upcomingPage - 1) * itemsPerPage;
  const paginatedUpcoming = upcoming.slice(startUpcoming, startUpcoming + itemsPerPage);

  // --- Calendar helpers ---
  const getTransactionsForDate = (year, month, day) => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === year &&
        txDate.getMonth() === month &&
        txDate.getDate() === day
      );
    });
  };

  const statusMap = {};
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTx = getTransactionsForDate(currentYear, currentMonth, day);
    if (dayTx.length === 0) {
      statusMap[day] = 'none';
      continue;
    }
    const hasReturned = dayTx.some(t => t.status === 'Returned');
    const hasActiveOrReserved = dayTx.some(t => t.status === 'Active' || t.status === 'Reserved');
    if (hasReturned && hasActiveOrReserved) statusMap[day] = 'mixed';
    else if (hasReturned) statusMap[day] = 'returned';
    else statusMap[day] = 'active';
  }

  const buildCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weeks = [];
    let week = [];
    for (let i = 0; i < firstDay; i++) week.push(null);
    for (let day = 1; day <= totalDays; day++) {
      week.push({ day });
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  };
  const calendarWeeks = buildCalendar();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleSendSMS = (tx) => {
    alert(
      `📱 SMS sent to ${tx.customer}\n“Reminder: ${tx.item} is overdue. Please return immediately.”`
    );
    setSmsModalTx(null);
  };

  const selectedDateBookings = selectedDate
    ? getTransactionsForDate(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
    : null;

  // --- Month navigation helpers ---
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <>
      <style>
        {`@keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        } 
        .animate-fadeInUp { animation: fadeInUp 0.2s ease-out; }`}
      </style>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Tasks</h2>
          <p className="text-gray-500 font-medium mt-1">
            Overdue reminders & upcoming schedule.
          </p>
        </div>

        {/* Overdue Rentals */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">
              Overdue Rentals (SMS Reminder)
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({overdueItems.length} total)
              </span>
            </h3>
            {overdueItems.length > 0 && (
              <button
                onClick={() => setShowOverdueModal(true)}
                className="text-xs font-semibold text-[#bf4a53] hover:underline"
              >
                View All
              </button>
            )}
          </div>

          {overdueItems.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No overdue rentals. Everything is on time! 🎉
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedOverdue.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-2xl gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.customer}</p>
                      <p className="text-xs text-gray-600">{tx.item}</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">
                        Due: {tx.date}
                      </p>
                    </div>
                    <button
                      onClick={() => setSmsModalTx(tx)}
                      className="self-end sm:self-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#bf4a53] hover:bg-red-700 rounded-full transition-colors shadow-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      Send SMS
                    </button>
                  </div>
                ))}
              </div>

              {totalOverduePages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setOverduePage((p) => Math.max(1, p - 1))}
                    disabled={overduePage === 1}
                    className={`p-1.5 rounded-full ${
                      overduePage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-semibold text-gray-600">
                    {overduePage} / {totalOverduePages}
                  </span>
                  <button
                    onClick={() => setOverduePage((p) => Math.min(totalOverduePages, p + 1))}
                    disabled={overduePage === totalOverduePages}
                    className={`p-1.5 rounded-full ${
                      overduePage === totalOverduePages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Calendar & Bookings grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {monthNames[currentMonth]} {currentYear}
                {selectedDate && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    – {selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-3 text-xs">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" /> Returned
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#bf4a53]" /> Active/Reserved
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-400" /> Mixed
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-900" /> Selected
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-gray-400 font-semibold mb-2">
                  {d}
                </div>
              ))}
              {calendarWeeks.map((week, wi) =>
                week.map((cell, ci) => {
                  if (!cell) {
                    return <div key={`${wi}-${ci}`} className="aspect-square" />;
                  }
                  const day = cell.day;
                  const status = statusMap[day] || 'none';
                  const isSelected =
                    selectedDate &&
                    day === selectedDate.getDate() &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getFullYear() === currentYear;

                  let bgClass;
                  if (isSelected) {
                    bgClass = 'bg-gray-900 text-white';
                  } else if (status === 'returned') {
                    bgClass = 'bg-green-500 text-white';
                  } else if (status === 'active') {
                    bgClass = 'bg-[#bf4a53] text-white';
                  } else if (status === 'mixed') {
                    bgClass = 'bg-orange-400 text-white';
                  } else {
                    bgClass = 'text-gray-700 hover:bg-gray-100';
                  }

                  return (
                    <div
                      key={`${wi}-${ci}`}
                      onClick={() =>
                        setSelectedDate(new Date(currentYear, currentMonth, day))
                      }
                      className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium cursor-pointer ${bgClass}`}
                    >
                      {day}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">
                {selectedDate
                  ? `Bookings for ${selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : 'Upcoming Bookings'}
                {!selectedDate && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({upcoming.length} total)
                  </span>
                )}
              </h3>
              {!selectedDate && upcoming.length > 0 && (
                <button
                  onClick={() => setShowUpcomingModal(true)}
                  className="text-xs font-semibold text-[#bf4a53] hover:underline"
                >
                  View All
                </button>
              )}
            </div>

            {selectedDateBookings ? (
              // Date‑specific view – no pagination
              selectedDateBookings.length === 0 ? (
                <p className="text-sm text-gray-500 py-10 text-center">
                  No bookings on this date.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateBookings.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between p-3 bg-gray-50 rounded-2xl"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tx.item}</p>
                        <p className="text-xs text-gray-500">
                          {tx.customer} · {tx.date}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md self-start ${
                          tx.status === 'Reserved'
                            ? 'bg-blue-100 text-blue-600'
                            : tx.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Upcoming list with pagination
              <>
                <div className="space-y-3">
                  {paginatedUpcoming.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between p-3 bg-gray-50 rounded-2xl"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tx.item}</p>
                        <p className="text-xs text-gray-500">
                          {tx.customer} · {tx.date}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md self-start ${
                          tx.status === 'Reserved'
                            ? 'bg-blue-100 text-blue-600'
                            : tx.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  ))}
                </div>

                {totalUpcomingPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                      disabled={upcomingPage === 1}
                      className={`p-1.5 rounded-full ${
                        upcomingPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-semibold text-gray-600">
                      {upcomingPage} / {totalUpcomingPages}
                    </span>
                    <button
                      onClick={() =>
                        setUpcomingPage((p) => Math.min(totalUpcomingPages, p + 1))
                      }
                      disabled={upcomingPage === totalUpcomingPages}
                      className={`p-1.5 rounded-full ${
                        upcomingPage === totalUpcomingPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* SMS Confirmation Modal */}
      {smsModalTx && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSmsModalTx(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100/80">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Confirm SMS</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Send overdue reminder to customer?
                </p>
              </div>
              <button
                onClick={() => setSmsModalTx(null)}
                className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <p>
                  <span className="text-gray-500">Customer:</span>{' '}
                  <strong className="text-gray-900">{smsModalTx.customer}</strong>
                </p>
                <p className="mt-1">
                  <span className="text-gray-500">Item:</span>{' '}
                  <strong className="text-gray-900">{smsModalTx.item}</strong>
                </p>
                <p className="mt-1">
                  <span className="text-gray-500">Due Date:</span>{' '}
                  <strong className="text-red-500">{smsModalTx.date}</strong>
                </p>
              </div>
              <p className="text-xs text-gray-500 text-center">
                The SMS will say: “Please return your rented item immediately.”
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSmsModalTx(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendSMS(smsModalTx)}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-[#bf4a53] hover:bg-red-700 rounded-full transition-colors shadow-sm shadow-red-500/20"
                >
                  Send SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Overdue Modal */}
      {showOverdueModal && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowOverdueModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100/80 bg-red-50/30">
              <div>
                <h3 className="font-bold text-lg text-gray-900">All Overdue Rentals</h3>
                <p className="text-xs text-gray-500">
                  {overdueItems.length} item(s) overdue
                </p>
              </div>
              <button
                onClick={() => setShowOverdueModal(false)}
                className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar space-y-3">
              {overdueItems.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-2xl gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tx.customer}</p>
                    <p className="text-xs text-gray-600">{tx.item}</p>
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                      Due: {tx.date}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOverdueModal(false);
                      setSmsModalTx(tx);
                    }}
                    className="self-end sm:self-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#bf4a53] hover:bg-red-700 rounded-full transition-colors shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Send SMS
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Upcoming Modal */}
      {showUpcomingModal && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowUpcomingModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100/80 bg-blue-50/30">
              <div>
                <h3 className="font-bold text-lg text-gray-900">All Upcoming Bookings</h3>
                <p className="text-xs text-gray-500">{upcoming.length} upcoming</p>
              </div>
              <button
                onClick={() => setShowUpcomingModal(false)}
                className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500 py-10 text-center">
                  No upcoming bookings.
                </p>
              ) : (
                upcoming.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between p-3 bg-gray-50 rounded-2xl"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.item}</p>
                      <p className="text-xs text-gray-500">
                        {tx.customer} · {tx.date}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md self-start ${
                        tx.status === 'Reserved'
                          ? 'bg-blue-100 text-blue-600'
                          : tx.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}