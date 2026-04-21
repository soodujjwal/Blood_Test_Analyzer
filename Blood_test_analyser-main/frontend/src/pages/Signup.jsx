import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Activity } from 'lucide-react';

export default function Signup({ onModeChange }) {
  const { signup, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signup(email, password, fullName);
    setLoading(false);
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 text-sm bg-zinc-800/60 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Branding above card */}
      <div className="flex flex-col items-center gap-3 mb-8 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          BloodTest AI
        </h1>
        <p className="text-zinc-500 text-sm max-w-xs">
          Understand your bloodwork in seconds with AI-powered insights
        </p>
      </div>

      {/* Glass card */}
      <div className="w-full max-w-sm bg-zinc-900/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-8">
        <h2 className="text-lg font-bold text-zinc-50 mb-1">Create account</h2>
        <p className="text-zinc-500 text-xs mb-6">Get started — it's free</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="Full name"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min. 6 characters"
              minLength="6"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-violet-500/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-zinc-500 text-sm mt-6">
        Already have an account?{' '}
        <button onClick={onModeChange} className="text-violet-400 font-semibold hover:text-violet-300 transition">
          Sign in
        </button>
      </p>
    </div>
  );
}
