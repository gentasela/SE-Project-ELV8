import React from 'react';

export default function WorkoutCard({ workout, index }) {
  return (
    <div 
      className="glass rounded-2xl p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Dynamic side accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--cta-gradient)] rounded-l-2xl transform origin-top transition-transform duration-500 scale-y-50 group-hover:scale-y-100"></div>

      <div className="flex justify-between items-center mb-5 pl-2">
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          {workout.day}
        </span>
        <span className="flex items-center text-xs font-semibold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1.5 rounded-full">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {workout.duration}
        </span>
      </div>
      
      <h4 className="text-2xl font-black mb-6 pl-2 tracking-tight">{workout.type}</h4>
      
      <ul className="space-y-4 pl-2">
        {workout.exercises.map((ex, i) => (
          <li key={i} className="flex items-start group/item">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover/item:bg-[var(--accent-primary)] transition-colors">
                 <svg className="w-3 h-3 text-slate-400 group-hover/item:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="ml-3 text-slate-600 dark:text-slate-300 font-medium">{ex}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
