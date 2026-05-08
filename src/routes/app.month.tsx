import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import {
  currentProgramDay,
  dateForDay,
  ensureMonthlyPlan,
  setActiveVariant,
} from "@/lib/plan";
import type { MonthlyPlan, UserProfile, Variant } from "@/lib/types";
import { WorkoutView } from "@/components/elv8/WorkoutView";
import { MealView } from "@/components/elv8/MealView";
import { VariantSwitcher } from "@/components/elv8/VariantSwitcher";

export const Route = createFileRoute("/app/month")({
  head: () => ({
    meta: [
      { title: "30-Day Program — ELV8" },
      { name: "description", content: "Your full 30-day workout and clean-eating nutrition program." },
    ],
  }),
  component: MonthPage,
});

const WEEK_LABELS = ["Foundation", "Build", "Peak", "Deload"];

function MonthPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [selected, setSelected] = useState<number>(1);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    setUser(u);
    const p = ensureMonthlyPlan(u);
    setPlan(p);
    setSelected(currentProgramDay(p));
  }, [navigate]);

  const day = useMemo(() => (plan ? plan.days[selected - 1] : null), [plan, selected]);

  if (!user || !plan || !day) return null;

  const switchVariant = (v: Variant) => {
    const next = setActiveVariant(user, v);
    setPlan(next);
  };

  const todayN = currentProgramDay(plan);

  return (
    <main className="mx-auto max-w-4xl px-5 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
            30-day program · started {new Date(plan.startDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
          <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
            Your <span className="italic text-accent-lime">monthly</span> blueprint.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Week 1 Foundation · Week 2 Build · Week 3 Peak · Week 4 Deload — calibrated to {plan.targetKcal} kcal/day.
          </p>
        </div>
        <VariantSwitcher value={plan.variant} onChange={switchVariant} />
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to="/app/grocery"
          className="inline-flex items-center gap-2 rounded-full border border-accent-lime/50 bg-accent-lime/10 px-4 py-2 font-sans text-[11px] font-700 uppercase tracking-[0.18em] text-accent-lime transition hover:bg-accent-lime/20"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
            <path d="M3 4h2l2.5 11h11l2-7H7" />
          </svg>
          Shopping list
        </Link>
        <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Aggregated from this month's plan
        </span>
      </div>

      {/* 30-day grid: 4 week rows */}
      <section className="mt-8 space-y-4">
        {[1, 2, 3, 4].map((wk) => {
          const days = plan.days.filter((d) => d.weekIndex === wk);
          return (
            <div key={wk} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Week {wk} · {WEEK_LABELS[wk - 1]}
                </div>
                <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Days {days[0].dayInProgram}–{days[days.length - 1].dayInProgram}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {days.map((d) => {
                  const isSel = d.dayInProgram === selected;
                  const isToday = d.dayInProgram === todayN;
                  return (
                    <button
                      key={d.dayInProgram}
                      type="button"
                      onClick={() => setSelected(d.dayInProgram)}
                      className={[
                        "flex flex-col items-center rounded-xl border px-2 py-2 transition",
                        isSel
                          ? "border-accent-lime bg-accent-lime/15"
                          : isToday
                          ? "border-accent-lime/50 bg-surface-2"
                          : "border-border bg-surface-2 hover:border-accent-lime/60",
                      ].join(" ")}
                    >
                      <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {d.weekdayLabel}
                      </span>
                      <span
                        className={
                          "mt-1 font-display text-base font-700 " +
                          (isSel ? "text-accent-lime" : "text-foreground")
                        }
                      >
                        {d.dayInProgram}
                      </span>
                      <span
                        className="mt-1 h-1 w-1 rounded-full bg-accent-lime/80"
                        style={{ opacity: d.workout.restDay ? 0.2 : 1 }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-700 text-foreground">
            Day {day.dayInProgram} · {new Date(dateForDay(plan, day.dayInProgram) + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </h2>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Week {day.weekIndex} · {WEEK_LABELS[day.weekIndex - 1]}
          </span>
        </div>
        <div className="mt-4">
          <WorkoutView workout={day.workout} discipline={plan.discipline} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-700 text-foreground">Meals</h2>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {day.meals.reduce((a, s) => a + s.options[0].kcal, 0)} kcal total
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {day.meals.map((slot) => (
            <MealView key={slot.slot} slot={slot} />
          ))}
        </div>
      </section>
    </main>
  );
}
