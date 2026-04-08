import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import History from './pages/History';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Blood Test Analyzer</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded ${currentPage === 'home' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
            >
              Analyze
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`px-4 py-2 rounded ${currentPage === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
            >
              History
            </button>
            <div className="text-sm text-gray-600">{user.email}</div>
            <button
              onClick={() => {
                const { logout } = require('./context/AuthContext').useAuth;
                logout?.();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && <Home />}
        {currentPage === 'history' && <History />}
      </main>
    </div>
  );
}

export default App;
