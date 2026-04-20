import { useState } from 'react';

export default function Form({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'low',
    goal: 'lose weight'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-8 sm:p-10 rounded-2xl relative overflow-hidden group">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Age</label>
          <div className="relative">
            <input required type="number" name="age" value={formData.age} onChange={handleChange} 
              className="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all duration-300" 
              placeholder="e.g. 28" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Weight</label>
            <input required type="number" name="weight" placeholder="kg/lbs" value={formData.weight} onChange={handleChange} 
              className="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all duration-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Height</label>
            <input required type="text" name="height" placeholder="cm/ft" value={formData.height} onChange={handleChange} 
               className="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all duration-300" />
          </div>
        </div>

        <div>
           <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Activity Level</label>
          <div className="relative">
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} 
              className="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all appearance-none cursor-pointer">
              <option value="low">Sedentary (Low)</option>
              <option value="medium">Moderate Activity</option>
              <option value="high">Extremely Active</option>
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Primary Goal</label>
          <div className="relative">
            <select name="goal" value={formData.goal} onChange={handleChange} 
              className="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] outline-none transition-all appearance-none cursor-pointer">
              <option value="lose weight">Burn Fat / Lose Weight</option>
              <option value="maintain">Maintain Peak Condition</option>
              <option value="gain muscle">Hypertrophy / Gain Muscle</option>
            </select>
             <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className={`w-full mt-8 py-5 text-white font-bold rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 ${isLoading ? 'opacity-80 cursor-wait scale-[0.98]' : 'hover:scale-[1.02]'}`}
          style={{ background: 'var(--accent-primary)' }}>
          {isLoading ? (
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="animate-pulse tracking-wide">Processing Biometrics...</span>
            </div>
          ) : (
            <>
              <span>Initialize Engine</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
