import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Activity, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function Signup({ onModeChange }) {
  const { signup, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signup(email, password, fullName);
    setLoading(false);
  };

  const inputClass =
    'w-full pl-12 pr-6 py-4 text-sm bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all duration-300 backdrop-blur-md shadow-inner';

  return (
    <div className="min-h-screen flex flex-col items-center justify-start lg:justify-center px-6 py-12 sm:py-20 relative overflow-y-auto overflow-x-hidden selection:bg-violet-500/30 bg-[#081021]">
      {/* Dynamic background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Header Branding */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center mb-8 sm:mb-12 relative z-10"
      >
        <div className="relative group mb-4 sm:mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(139,92,246,0.3)] border border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 drop-shadow-lg" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-2 sm:mb-3 leading-tight text-center">
          BloodTest <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">AI</span>
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span className="text-[10px] font-black text-violet-300 uppercase tracking-widest">Join the Wellness Revolution</span>
        </div>
      </motion.div>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full max-w-[420px] bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl p-10 sm:p-12 relative z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-white/40 text-sm font-medium">Start tracking your health today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused === 'name' ? 'text-violet-400' : 'text-white/20'}`}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  className={inputClass}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused === 'email' ? 'text-violet-400' : 'text-white/20'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className={inputClass}
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused === 'password' ? 'text-violet-400' : 'text-white/20'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className={inputClass}
                  placeholder="Password (min. 6 chars)"
                  minLength="6"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3 items-start"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300 font-semibold leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white text-base font-black rounded-2xl shadow-[0_15px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.4)] transition-all duration-300 disabled:opacity-50 overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="tracking-wide">Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Join Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-col items-center gap-4 relative z-10"
      >
        <p className="text-white/30 text-sm font-medium">
          Already part of the crew?{' '}
          <button
            onClick={onModeChange}
            className="text-white hover:text-violet-400 font-black transition-colors"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}
