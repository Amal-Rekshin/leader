import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Activity, ArrowLeft } from 'lucide-react';
import { ledgerApi } from '../api/ledgerApi';
import { useToast } from '../context/ToastContext';

const Signup = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const cleanName = displayName.trim();

      const response = await ledgerApi.signup(cleanEmail, cleanPassword, cleanName);
      
      if (response.data && response.data.success) {
        let successMessage = response.data.message || 'Account successfully created!';
        showToast(successMessage, 'success', 6000);
        onBackToLogin(); // Go back to login so they can log in
      } else {
        showToast('Signup failed: ' + (response.data?.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.response) {
        showToast(error.response.data?.message || 'Invalid registration details provided', 'error');
      } else if (error.request) {
        showToast('Network Error: Could not connect to the backend server (Is it running on port 8080?)', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4 sm:p-6">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card w-full max-w-md p-6 sm:p-10 relative z-10">
        <button 
          onClick={onBackToLogin}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </button>

        <div className="flex justify-center mb-6 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 relative">
             <Activity className="text-white" size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Register your unified bilateral vendor & client profiles.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Business / Display Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Acme Corp" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. billing@company.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
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

          <button 
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Generate Dual Profile'}</span>
            {!isLoading && <ArrowRight size={20} className={`transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} />}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-8 font-medium">
          Already have an account? <button onClick={onBackToLogin} className="text-white hover:text-primary transition-colors font-bold">Sign In</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
