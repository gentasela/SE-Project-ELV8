import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import type { MonthlyPlan, UserProfile } from "@/lib/types";
import { completionRate, getAllLogs, streak } from "@/lib/progress";
import { currentProgramDay, dateForDay, ensureMonthlyPlan } from "@/lib/plan";
import type { ProgressLog } from "@/lib/types";

export const Route = createFileRoute("/app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — ELV8" },
      { name: "description", content: "Track your 30-day program completion." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [logs, setLogs] = useState<Record<string, ProgressLog>>({});
  const [s, setS] = useState(0);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate({ to: "/login" });
        return;
      }
      setUser(u);
      
      const [p, allLogs, currentStreak] = await Promise.all([
        ensureMonthlyPlan(u),
        getAllLogs(u.id),
        streak(u.id),
      ]);
      
      setPlan(p);
      setLogs(allLogs);
      setS(currentStreak);
    };
    load();
  }, [navigate]);

  const programDays = useMemo(() => {
    if (!user || !plan) return [] as { day: number; date: string; rate: number; workoutDone: boolean; mealsDone: number; isFuture: boolean }[];
    const todayN = currentProgramDay(plan);
    const emptyLog: ProgressLog = {
      workoutDone: false,
      meals: { breakfast: false, lunch: false, dinner: false, snack: false },
    };
    return plan.days.map((d) => {
      const date = dateForDay(plan, d.dayInProgram);
      const log = logs[date] ?? emptyLog;
      return {
        day: d.dayInProgram,
        date,
        rate: completionRate(log),
        workoutDone: log.workoutDone,
        mealsDone: Object.values(log.meals).filter(Boolean).length,
        isFuture: d.dayInProgram > todayN,
      };
    });
  }, [user, plan, logs]);

  const todayN = plan ? currentProgramDay(plan) : 0;
  const completedSoFar = programDays.slice(0, todayN);
  const avgPct = completedSoFar.length
    ? Math.round((completedSoFar.reduce((a, d) => a + d.rate, 0) / completedSoFar.length) * 100)
    : 0;
  const fullDays = completedSoFar.filter((d) => d.rate >= 0.6).length;

  if (!user || !plan) return null;

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header>
        <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Progress · Plan {plan.variant}
        </div>
        <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
          Day <span className="italic text-accent-lime">{todayN}</span> of 30.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Progress is tracked per program day, so it persists across all three plans.
        </p>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Streak" value={`${s}`} unit="days" />
        <Stat label="Average completion" value={`${avgPct}%`} />
        <Stat label="Full days hit" value={`${fullDays}`} unit={`of ${todayN}`} />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-700 text-foreground">30-day map</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each square = one program day. Lime intensity = % of workout + 4 meals completed.
        </p>

        <div className="mt-5 grid grid-cols-10 gap-1.5 sm:grid-cols-15">
          {programDays.map((d) => {
            const pct = Math.round(d.rate * 100);
            return (
              <div
                key={d.day}
                title={`Day ${d.day} (${new Date(d.date + "T00:00:00").toLocaleDateString()}) — ${pct}%`}
                className="relative aspect-square rounded-md border border-border bg-surface"
                style={{
                  background: d.isFuture
                    ? "transparent"
                    : `color-mix(in oklab, var(--accent-lime) ${Math.max(8, pct)}%, transparent)`,
                  opacity: d.isFuture ? 0.35 : 1,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center font-sans text-[10px] font-700 text-foreground/80">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-700 text-foreground">Daily log</h2>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {[...completedSoFar].reverse().map((d) => (
            <li key={d.day} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-600 text-foreground">
                  Day {d.day} · {new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-muted-foreground">
                  Workout {d.workoutDone ? "✓" : "—"} · Meals {d.mealsDone}/4
                </div>
              </div>
              <div className="font-display text-xl font-700 text-accent-lime">
                {Math.round(d.rate * 100)}%
              </div>
            </li>
          ))}
          {!completedSoFar.length && (
            <li className="px-5 py-6 text-sm text-muted-foreground">
              No days logged yet — log today's workout and meals on the Today tab.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="font-display text-4xl font-900 text-foreground">{value}</div>
        {unit && <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{unit}</div>}
      </div>
    </div>
  );
}
