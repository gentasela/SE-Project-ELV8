import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Wizard({ setPlanData }) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [discipline, setDiscipline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [synthesisLogs, setSynthesisLogs] = useState([]);
  const navigate = useNavigate();

  const TELEMETRY_MESSAGES = [
    "INITIATING CORE SEQUENCE...",
    "CALIBRATING MACRO SEQUENCE...",
    "MAPPING WORKOUT TOPOLOGY...",
    "OPTIMIZING ANALYTICAL LOAD...",
    "SYNCING BLUEPRINT ARCHIVE...",
    "FINALIZING ENGINE STATE..."
  ];

  const disciplines = ['Yoga', 'Pilates', 'Bodyweight Training', 'Home Exercises (No Equipment)', 'Beginner Strength Training', 'Fat-Loss Programs'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleGenerate = async () => {
    setIsLoading(true);
    setSynthesisLogs([TELEMETRY_MESSAGES[0]]);

    // Cycle through telemetry logs
    for (let i = 1; i < TELEMETRY_MESSAGES.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setSynthesisLogs(prev => [...prev, TELEMETRY_MESSAGES[i]]);
    }

    try {
      const response = await fetch('http://localhost:5001/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline,
          experienceLevel,
          formData: { goal: 'lose weight', age, height, heightUnit, weight, weightUnit }
        })
      });
      const data = await response.json();
      setPlanData(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to connect to engine.');
      setIsLoading(false);
      setSynthesisLogs([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 fade-in-up">
      <div className="text-center mb-12">
        {/* Step-indexed Blueprint Title */}
        <h2 className="elv8-brand-text text-4xl md:text-6xl font-black mb-6 tracking-tight dark:text-white">
          Configure Blueprint
        </h2>
        <div className="flex justify-center gap-4">
          <div className={`progress-line ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0E2A] p-8 md:p-12 rounded-3xl min-h-[500px] flex flex-col justify-center border border-slate-200 dark:border-slate-700/50 relative overflow-hidden shadow-xl">

        {step === 1 && (
          <div className="fade-in-up">
            {/* 'Physical Profile' -> 'Tell us about yourself' */}
            <h3 className="elv8-brand-text text-2xl md:text-3xl font-bold mb-8 text-center tracking-tight dark:text-white">Tell us about yourself</h3>
            <div className="space-y-6 max-w-sm mx-auto">
              <div>
                <label className="block text-sm font-black mb-2 text-slate-900 dark:text-white uppercase tracking-wider">Age</label>
                <input type="number" required value={age} onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-black text-black dark:text-white uppercase tracking-wider">Height</label>
                  <div className="flex gap-1 rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
                    <button onClick={() => setHeightUnit('cm')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${heightUnit === 'cm'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white'
                        : 'bg-white dark:bg-transparent text-slate-900 dark:text-slate-400'
                      }`}>cm</button>
                    <button onClick={() => setHeightUnit('ft')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${heightUnit === 'ft'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white'
                        : 'bg-white dark:bg-transparent text-slate-900 dark:text-slate-400'
                      }`}>ft</button>
                  </div>
                </div>
                <input type="number" required value={height} onChange={(e) => setHeight(e.target.value)}
                  placeholder={heightUnit === 'cm' ? "180" : "5.9"} />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-black text-black dark:text-white uppercase tracking-wider">Weight</label>
                  <div className="flex gap-1 rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
                    <button onClick={() => setWeightUnit('kg')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${weightUnit === 'kg'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white'
                        : 'bg-white dark:bg-transparent text-slate-900 dark:text-slate-400'
                      }`}>kg</button>
                    <button onClick={() => setWeightUnit('lbs')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${weightUnit === 'lbs'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white'
                        : 'bg-white dark:bg-transparent text-slate-900 dark:text-slate-400'
                      }`}>lbs</button>
                  </div>
                </div>
                <input type="number" required value={weight} onChange={(e) => setWeight(e.target.value)}
                  placeholder={weightUnit === 'kg' ? "75" : "165"} />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!age || !height || !weight}
              className="w-full max-w-sm mx-auto block mt-10 py-5 font-bold text-lg btn-primary disabled:opacity-40 disabled:pointer-events-none"
            >
              Choose Your Focus
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in-up">
            {/* 'Select Primary Discipline' -> 'Pick Your Workout Type' */}
            <h3 className="elv8-brand-text text-2xl md:text-3xl font-bold mb-8 text-center tracking-tight dark:text-white">Pick Your Workout Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {disciplines.map(d => (
                <button key={d} onClick={() => setDiscipline(d)}
                  className={`selectable-card ${discipline === d ? 'selected' : ''}`}>
                  <span className="text-lg font-black">{d}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-10 max-w-3xl mx-auto">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-5 rounded-2xl flex-1 font-bold btn-primary"
              >Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!discipline}
                className="flex-1 btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >Pick Your Pace</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in-up">
            {/* 'Calibrate Experience Level' -> 'Pick your fitness level' */}
            <h3 className="elv8-brand-text text-2xl md:text-3xl font-bold mb-8 text-center tracking-tight dark:text-white">Pick your fitness level</h3>
            <div className="flex flex-col w-full gap-4 max-w-sm mx-auto">
              {levels.map(l => (
                <button key={l} onClick={() => setExperienceLevel(l)}
                  className={`selectable-card w-full ${experienceLevel === l ? 'selected' : ''}`}>
                  <span className="text-xl block font-black">{l}</span>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${experienceLevel === l ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {l === 'Beginner' ? "I'm just starting out." : l === 'Intermediate' ? 'I work out regularly.' : 'I want a serious challenge.'}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-10 max-w-2xl mx-auto">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-5 rounded-2xl font-bold btn-primary"
              >Back</button>
              <button
                onClick={handleGenerate}
                disabled={!experienceLevel || isLoading}
                className="flex-1 flex justify-center items-center gap-3 btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="animate-pulse">Synthesizing Blueprint...</span>
                  </>
                ) : 'Create My Plan'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cinematic Engine Synthesis Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 fade-in">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"></div>
          <div className="relative glass p-10 md:p-16 rounded-[40px] max-w-lg w-full text-center border-white/20">
            <div className="logo-container mx-auto mb-10 scale-150 synthesis-pulse">
              <div className="logo-base">
                <span className="logo-text text-2xl">E8</span>
                <div className="logo-overlay"></div>
              </div>
            </div>

            <h3 className="text-2xl font-black mb-8 text-white tracking-widest uppercase">Engine Synthesis</h3>

            <div className="space-y-3 text-left max-w-xs mx-auto mb-8 h-40 overflow-hidden">
              {synthesisLogs.map((log, i) => (
                <div key={i} className="telemetry-log flex gap-3">
                  <span className="opacity-50">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                  <span className="font-bold tracking-tight">{log}</span>
                </div>
              ))}
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[var(--cta-gradient)] transition-all duration-500 ease-out"
                style={{ width: `${(synthesisLogs.length / TELEMETRY_MESSAGES.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 animate-pulse">Syncing Engine Core</p>
          </div>
        </div>
      )}
    </div>
  );
}
