import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const MOCK_USERS = {
  admin: { password: 'admin', role: 'Admin' },
  staff: { password: 'staff', role: 'Staff' },
  customer: { password: 'customer', role: 'Customer' },
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [extraUsers, setExtraUsers] = useState({});
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const allUsers = { ...MOCK_USERS, ...extraUsers };
    const user = allUsers[username];
    if (user && user.password === password) {
      onLogin(user.role);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword || !signupConfirm) {
      setError('Please fill in all fields');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (MOCK_USERS[signupUsername] || extraUsers[signupUsername]) {
      setError('Username already exists');
      return;
    }
    setExtraUsers((prev) => ({
      ...prev,
      [signupUsername]: { password: signupPassword, role: 'Customer' },
    }));
    setUsername(signupUsername);
    setPassword(signupPassword);
    setIsSignup(false);
    setError('');
    setSignupUsername('');
    setSignupPassword('');
    setSignupConfirm('');
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#fcfcfd]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}  // explicit font guarantee
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-100/80">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#bf4a53] to-red-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm shadow-red-500/20">
            RT
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          {isSignup
            ? 'Sign up for a RENTECH account'
            : 'Sign in to your RENTECH account'}
        </p>

        {/* LOGIN FORM */}
        {!isSignup && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Username
              </label>
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
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm shadow-gray-900/20"
            >
              Sign In
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {isSignup && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                required
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
                placeholder="yourname"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#bf4a53] text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-sm shadow-red-500/20"
            >
              Create Account
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-xs mt-4">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-[#bf4a53] font-bold hover:underline"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {!isSignup && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Demo credentials: <br />
            admin / admin &nbsp;|&nbsp; staff / staff &nbsp;|&nbsp; customer / customer
          </p>
        )}
      </div>
    </div>
  );
}