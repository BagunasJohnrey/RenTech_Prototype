import { useState } from 'react';

const MOCK_USERS = {
  admin: { password: 'admin', role: 'Admin' },
  staff: { password: 'staff', role: 'Staff' },
  customer: { password: 'customer', role: 'Customer' },
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = MOCK_USERS[username];
    if (user && user.password === password) {
      onLogin(user.role);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-100/80">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#bf4a53] to-red-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm shadow-red-500/20">
            RT
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in to your RENTECH account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm shadow-gray-900/20"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Demo credentials: <br />
          admin / admin &nbsp;|&nbsp; staff / staff &nbsp;|&nbsp; customer / customer
        </p>
      </div>
    </div>
  );
}