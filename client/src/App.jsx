import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Wizard from './pages/Wizard';
import Dashboard from './pages/Dashboard';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('elv8_token') || null);
  const [planData, setPlanData] = useState(null);

  // Global Mouse Tracking for Interactive Background
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const logout = () => {
    localStorage.removeItem('elv8_token');
    setAuthToken(null);
    setPlanData(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen pb-20 relative">
        <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-800 transition-colors duration-500">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-default group">
              <div className="logo-container">
                <div className="logo-base">
                  <span className="logo-text">E8</span>
                  <div className="logo-overlay"></div>
                </div>
              </div>
              <h1 className="elv8-brand-text text-2xl font-black dark:text-white tracking-tight">
                ELV8
              </h1>
            </div>

            <div className="flex gap-4 items-center">
              {authToken && (
                <button onClick={logout} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  Disconnect
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-full glass hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group"
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.32a1 1 0 011.415 0l.707.707a1 1 0 01-1.414 1.415l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-4.22 4.22a1 1 0 010 1.415l-.707.707a1 1 0 01-1.414-1.415l.707-.708a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-2.32a1 1 0 01-1.415 0l-.707-.707a1 1 0 011.414-1.415l.708.708a1 1 0 010 1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm4.22-4.22a1 1 0 010-1.415l.707-.707a1 1 0 011.414 1.415l-.707.708a1 1 0 01-1.414 0zM10 4a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-600 group-hover:-rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={!authToken ? <LandingPage setAuthToken={setAuthToken} /> : <Navigate to="/wizard" />} />
          <Route path="/wizard" element={authToken ? <Wizard setPlanData={setPlanData} /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={authToken ? <Dashboard planData={planData} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
