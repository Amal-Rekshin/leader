import React, { useState } from 'react';
import { Shield, User, Lock, Mail, ArrowRight, Activity } from 'lucide-react';
import { ledgerApi } from '../api/ledgerApi';
import { useToast } from '../context/ToastContext';

const Login = ({ onLogin, onGoToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const { showToast } = useToast();

  // Auto fill function
  const fillDemoCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  const usersList = [
    {
      name: "Admin",
      email: "admin@admin.com",
      password: 'admin'
    },
    {
      name: "Test User",
      email: "user@user.com",
      password: 'user'
    },
    
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      const response = await ledgerApi.login(cleanEmail, cleanPassword);

      if (response.data && response.data.success) {
        localStorage.setItem('userEmail', cleanEmail);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.displayName || 'Admin');
        onLogin(response.data);
      } else {
        showToast(response.data?.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        showToast(
          error.response.data?.message || 'Invalid credentials provided',
          'error'
        );
      } else if (error.request) {
        showToast(
          'Network connection refused. Is the backend server running on port 8080?',
          'error'
        );
      } else {
        showToast(error.message, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4 sm:p-6">

      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card w-full max-w-md p-6 sm:p-10 relative z-10">

        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 relative">
            <Activity className="text-white" size={32} />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Ledger
          </h1>

          <p className="text-gray-400 text-sm">
            Sign in to manage your unified financial network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Email Address
            </label>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@acme.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Password
              </label>

              <a
                href="#"
                className="text-xs text-primary font-bold hover:underline"
              >
                Forgot?
              </a>
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Auto Fill Button */}
          <div className="flex items-center justify-center gap-2">
            {
              usersList.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => fillDemoCredentials(user.email, user.password)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-sm rounded-xl transition-all font-semibold"
                >
                  {user.name}
                </button>
              ))
            }
          </div>

          {/* <button
            type="button"
            onClick={() => fillDemoCredentials(email, password)}
            className=""
          >
          bg-white/10 hover:bg-white/20 border border-white/10 text-sm py-3 rounded-xl transition-all font-semibold
            name
          </button> */}

          {/* Login Button */}
          <button
            type="submit"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="mt-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group"
          >
            <span>Access Network</span>

            <ArrowRight
              size={20}
              className={`transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''
                }`}
            />
          </button>

        </form>

      </div>
    </div>
  );
};

export default Login;