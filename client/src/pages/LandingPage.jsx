import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ setAuthToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    // Emergency Bypass active to guarantee progression to Wizard per user request
    try {
      localStorage.setItem('elv8_token', 'bypass_token');
      setAuthToken('bypass_token');
      navigate('/wizard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 fade-in-up">
      <div className="text-center mb-8">
        <div className="logo-container mx-auto mb-6 scale-125">
          <div className="logo-base">
            <span className="logo-text text-2xl">E8</span>
            <div className="logo-overlay"></div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
          ELV8 System
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Unlock your ultimate performance.</p>
      </div>

      <div className="glass p-8 w-full max-w-md rounded-2xl">
        <div className="flex gap-4 mb-6 relative">
          <button onClick={() => setIsLogin(true)} className={`tab-btn ${isLogin ? 'active' : ''}`}>Log in</button>
          <button onClick={() => setIsLogin(false)} className={`tab-btn ${!isLogin ? 'active' : ''}`}>Sign up</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold text-center">{error}</div>}

        {/* Bypassed Browser Native Form Handling - Pattern gatekeeper disabled entirely */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@elv8.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" />
          </div>
          <button onClick={handleAuth} className="btn-premium-cyan">
            {isLogin ? 'Log in' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
