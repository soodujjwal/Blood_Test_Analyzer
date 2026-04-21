import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import History from './pages/History';
import { Activity, Clock, LogOut, User } from 'lucide-react';

function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-violet-800 border-t-violet-400 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading…</p>
        </div>
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
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              BloodTest AI
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 bg-white/[0.06] rounded-full p-1">
            {[
              { id: 'home', label: 'Analyze', Icon: Activity },
              { id: 'history', label: 'History', Icon: Clock },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentPage === id
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span className="text-xs text-zinc-400 truncate max-w-36">
                {user.full_name || user.email}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {currentPage === 'home' && <Home />}
        {currentPage === 'history' && <History />}
      </main>
    </div>
  );
}

export default App;
