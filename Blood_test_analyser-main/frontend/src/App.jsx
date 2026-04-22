import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import History from './pages/History';
import { Activity, Clock, LogOut, User, Sparkles } from 'lucide-react';

function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-purple-950 to-pink-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative w-16 h-16"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full blur-lg opacity-75" />
            <div className="relative w-16 h-16 rounded-full border-[3px] border-transparent border-t-violet-400 border-r-fuchsia-400" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/60 text-sm font-medium"
          >
            Loading your bloodwork…
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onModeChange={() => setAuthMode('signup')} />
    ) : (
      <Signup onModeChange={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/20 backdrop-blur-2xl">
        <div className="w-full px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo (Back on the Left) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition" />
              <Activity className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-sm font-black bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                BloodTest AI
              </span>
              <span className="text-[10px] text-white/40 leading-none">Powered by AI</span>
            </div>
          </motion.div>

          {/* Nav tabs (Stay in the Middle) */}
          <nav className="flex items-center gap-1 bg-white/[0.05] rounded-2xl p-1.5 border border-white/[0.08] backdrop-blur-sm">
            {[
              { id: 'home', label: 'Analyze', Icon: Activity },
              { id: 'history', label: 'History', Icon: Clock },
            ].map(({ id, label, Icon }) => {
              const active = currentPage === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setCurrentPage(id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 ${
                    active ? 'text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl shadow-lg shadow-violet-500/30 -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* User section (Back on the Right) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/20 flex items-center justify-center flex-shrink-0"
              >
                <User className="w-4 h-4 text-violet-300" />
              </motion.div>
              <span className="text-xs text-white/70 font-medium truncate max-w-40 hidden sm:inline">
                {user.full_name || user.email}
              </span>
            </div>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 text-white/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === 'home' && <Home />}
            {currentPage === 'history' && <History />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
