export default function MealCard({ meal, index }) {
  return (
    <div 
      className="glass p-7 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-2 group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Decorative gradient orb background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--cta-gradient)] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <span className="text-sm font-black text-[var(--accent-primary)] uppercase tracking-widest bg-[var(--accent-primary)]/5 px-4 py-1.5 rounded-md border border-[var(--accent-primary)]/20">
          {meal.meal}
        </span>
        <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50">
          <svg className="w-3.5 h-3.5 mr-1 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          {meal.calories} kcal
        </div>
      </div>
      
      <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed z-10 relative">
        {meal.description}
      </p>
    </div>
  );
}
