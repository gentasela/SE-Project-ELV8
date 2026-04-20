import WorkoutCard from '../components/WorkoutCard';
import MealCard from '../components/MealCard';
import ProgressTracker from '../components/ProgressTracker';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Navigate } from 'react-router-dom';

export default function Dashboard({ planData }) {
  if (!planData) return <Navigate to="/wizard" />;

  const { targetCalories, workouts, meals, macros } = planData;
  const PIE_COLORS = ['var(--accent-primary)', '#10b981', '#f59e0b']; // Theme, Green, Amber

  return (
    <div className="max-w-6xl mx-auto px-6 mt-12 z-10 relative space-y-16 fade-in-up pb-10">
      {/* Premium Plan Header - The Blueprint Readout */}
      <div className="relative overflow-hidden glass rounded-[40px] p-10 md:p-14 text-center border-white/20 group">
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--cta-gradient)]"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-[80px] group-hover:bg-[var(--accent-primary)]/10 transition-all duration-1000"></div>
        
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--accent-primary)] mb-4 opacity-70">Analysis Output / ID-7718</p>
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">Your Custom Blueprint</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Target Engine Load</span>
            <span className="text-4xl font-black text-[var(--accent-primary)] tracking-tight">{targetCalories || 2000} <span className="text-sm font-bold opacity-50 uppercase">kcal</span></span>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Macro Balance</span>
            <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Optimal</span>
          </div>
        </div>
      </div>

      {/* Workouts Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="text-3xl font-bold tracking-tight">Active Schedule</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workouts?.map((w, i) => <WorkoutCard key={i} workout={w} index={i} />)}
        </div>
      </section>

      {/* Nutrition Engine Output with Recharts */}
      <section>
         <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 className="text-3xl font-bold tracking-tight">Nutrition Sequence</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pie Chart Card */}
          <div className="lg:col-span-1 glass p-8 rounded-3xl flex flex-col justify-center items-center border border-white/40 dark:border-slate-800 overflow-hidden group">
            <h4 className="font-bold text-xl mb-2 tracking-tight">Macro Split</h4>
            <p className="text-sm text-slate-500 mb-6 text-center">Precise nutrient targeting.</p>
            <div className="w-full h-48 mb-6 group-hover:scale-105 transition-transform duration-500">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macros} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                    {macros?.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', color: '#fff', border: 'none', padding: '12px' }} 
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value) => [`${value}g`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-5 text-sm font-semibold">
               <span className="text-[var(--accent-primary)] flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]"></span> Protein</span>
               <span className="text-[#10b981] flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Carbs</span>
               <span className="text-[#f59e0b] flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> Fats</span>
            </div>
          </div>
          {/* Meals */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {meals?.slice(0, 2).map((m, i) => <MealCard key={i} meal={m} index={i} />)}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 className="text-3xl font-bold tracking-tight">System Telemetry</h3>
        </div>
        <ProgressTracker />
      </section>
    </div>
  );
}
