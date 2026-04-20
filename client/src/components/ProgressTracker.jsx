import { useState, useEffect } from 'react';

export default function ProgressTracker() {
  const [weight, setWeight] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
      
    // Add custom CSS to style the scrollbar for history
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await fetch('http://localhost:5001/api/progress');
      const data = await resp.json();
      setHistory(data);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weight) return;

    try {
      await fetch('http://localhost:5001/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: Number(weight), date: new Date().toLocaleDateString() })
      });
      setWeight('');
      fetchHistory(); // Refresh
    } catch (e) {
      console.error('Failed to log weight', e);
    }
  };

  return (
    <div className="glass p-8 sm:p-10 rounded-2xl w-full">
      <form onSubmit={handleLogWeight} className="flex flex-col sm:flex-row gap-4 mb-10 w-full lg:w-2/3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
          </div>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            placeholder="Record Weight..."
          />
        </div>
        <button type="submit" className="px-8 py-4 font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl hover:scale-105 hover:bg-slate-800 dark:hover:bg-white transition-all">
          Log Entry
        </button>
      </form>

      {history.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((entry, i) => (
            <div key={i} className="flex justify-between items-center px-6 py-5 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] group-hover:scale-150 transition-transform"></div>
                 <div className="flex items-baseline">
                   <span className="font-extrabold text-2xl tracking-tight">{entry.weight}</span>
                   <span className="ml-1.5 text-sm font-medium text-slate-500">kg/lbs</span>
                 </div>
               </div>
              <span className="text-sm font-medium text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full">{entry.date}</span>
            </div>
          )).reverse()}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500">
          <svg className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <p className="font-medium text-lg">No logs mapped yet.</p>
          <p className="text-sm">Initiate your tracking today.</p>
        </div>
      )}
    </div>
  );
}
