import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Server } from 'lucide-react';
import apiClient from '../../api/client';

const AdminLogin = () => {
  const [username, setUsername] = useState(''); // Changed to username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Changed: sending username instead of email
      const { data } = await apiClient.post('/auth/admin-login', { username, password });
      
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', JSON.stringify(data));
      
      window.location.href = '/admin/dashboard'; 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed. Check Console access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-[0_0_50px_-10px_rgba(34,197,94,0.2)]"
      >
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center border border-[var(--gta-green)]/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Server className="text-[var(--gta-green)] w-8 h-8" />
           </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-1 uppercase tracking-wider">
          System <span className="text-[var(--gta-green)]">Access</span>
        </h2>
        <p className="text-zinc-500 text-xs text-center mb-8 uppercase tracking-[0.2em] font-bold">
          Restricted Area • Authorized Only
        </p>

        {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded text-center font-bold uppercase">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--gta-green)] transition-colors w-5 h-5" />
            <input 
              type="text" // Changed to text
              placeholder="Username" // Changed placeholder
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[var(--gta-green)] transition-all placeholder:text-zinc-600 font-medium"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--gta-green)] transition-colors w-5 h-5" />
            <input 
              type="password" 
              placeholder="Security Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[var(--gta-green)] transition-all placeholder:text-zinc-600 font-medium"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--gta-green)] hover:bg-emerald-600 text-black font-black uppercase py-3 rounded-lg tracking-widest transition-all shadow-lg shadow-green-900/20 mt-2"
          >
            {loading ? 'Authenticating...' : 'Initialize Session'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-[10px] text-zinc-600 uppercase">
                IP Address Logged • Secure Connection
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;