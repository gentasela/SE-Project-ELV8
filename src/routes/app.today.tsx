import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import {
  ensureMonthlyPlan,
  setActiveVariant,
  currentProgramDay,
} from "@/lib/plan";
import type { MonthlyPlan, ProgressLog, UserProfile, Variant } from "@/lib/types";
import { getLog, streak, toggleMeal, toggleWorkout } from "@/lib/progress";
import { WorkoutView } from "@/components/elv8/WorkoutView";
import { MealView } from "@/components/elv8/MealView";
import { DISCIPLINES } from "@/lib/types";
import { VariantSwitcher } from "@/components/elv8/VariantSwitcher";
import { MacroBudget } from "@/components/elv8/MacroBudget";
import { consumedForDay, macroBudget } from "@/lib/macros";
import { deductMealFromInventory } from "@/lib/fridge";

export const Route = createFileRoute("/app/today")({
  head: () => ({
    meta: [
      { title: "Today — ELV8" },
      { name: "description", content: "Today's workout and meal plan from your 30-day program." },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [log, setLog] = useState<ProgressLog | null>(null);
  const [s, setS] = useState(0);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    setUser(u);
    setPlan(ensureMonthlyPlan(u));
    setLog(getLog(u.id));
    setS(streak(u.id));
  }, [navigate]);

  const dayNum = useMemo(() => (plan ? currentProgramDay(plan) : 1), [plan]);
  const today = useMemo(() => (plan ? plan.days[dayNum - 1] : null), [plan, dayNum]);
  const disciplineLabel = useMemo(
    () => (user ? DISCIPLINES.find((d) => d.id === user.discipline)?.label ?? "" : ""),
    [user],
  );

  if (!user || !plan || !today || !log) return null;

  const budget = macroBudget(today.targetKcal);
  const consumed = consumedForDay(today, log);

  const handleToggleWorkout = () => {
    const next = toggleWorkout(user.id);
    setLog(next);
    setS(streak(user.id));
  };
  const handleToggleMeal = (slot: keyof ProgressLog["meals"]) => {
    const wasDone = log?.meals[slot] ?? false;
    const next = toggleMeal(user.id, slot);
    setLog(next);
    setS(streak(user.id));
    // If we just marked the meal complete, deduct its ingredients from
    // the user's "in fridge" inventory so the pantry stays in sync.
    if (!wasDone && next.meals[slot]) {
      const slotEntry = today.meals.find((m) => m.slot === slot);
      if (slotEntry) {
        const optionIdx = log?.workoutDone ? 0 : 1;
        deductMealFromInventory(user.id, slotEntry.options[optionIdx]);
      }
    }
  };
  const switchVariant = (v: Variant) => setPlan(setActiveVariant(user, v));

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
            Hey, <span className="italic text-accent-lime">{user.name}</span>.
          </h1>
          <p className="mt-1 text-muted-foreground">
            {disciplineLabel} · {user.level} · {user.goal === "lose" ? "Lose weight" : "Gain weight"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-center">
          <div className="font-display text-2xl font-900 text-accent-lime">{s}</div>
          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            day streak
          </div>
        </div>
      </header>

      {/* Program progress strip */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              30-day program · Plan {plan.variant} · Week {today.weekIndex}
            </div>
            <div className="mt-1 font-display text-2xl font-700">
              Day <span className="text-accent-lime">{dayNum}</span> of 30
            </div>
          </div>
          <VariantSwitcher value={plan.variant} onChange={switchVariant} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-accent-lime transition-all"
            style={{ width: `${(dayNum / 30) * 100}%` }}
          />
        </div>
      </section>

      {/* Daily macro budget — auto-fills as meals are checked off */}
      <div className="mt-6">
        <MacroBudget consumed={consumed} budget={budget} />
      </div>

      {/* Workout */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-700 text-foreground">Today's workout</h2>
          <button
            type="button"
            onClick={handleToggleWorkout}
            aria-pressed={log.workoutDone}
            className={[
              "rounded-full border px-4 py-2 font-sans text-[11px] font-600 uppercase tracking-[0.18em] transition",
              log.workoutDone
                ? "border-accent-lime bg-accent-lime text-accent-lime-foreground"
                : "border-border bg-surface text-foreground hover:border-accent-lime/60",
            ].join(" ")}
          >
            {log.workoutDone ? "Done ✓" : "Mark done"}
          </button>
        </div>
        <div className="mt-4">
          <WorkoutView workout={today.workout} discipline={plan.discipline} />
        </div>
      </section>

      {/* Meals */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-700 text-foreground">Nutrition</h2>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Target {today.targetKcal} kcal · {log.workoutDone ? "Recovery mode" : "Lean mode"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {log.workoutDone
            ? "Workout complete — meals default to higher-calorie recovery picks. Swap any meal anytime."
            : "No workout logged yet — meals default to lighter picks to balance the day. Swap any meal anytime."}
        </p>
        <div className="mt-4 grid gap-3">
          {today.meals.map((slot) => (
            <MealView
              key={slot.slot}
              slot={slot}
              done={log.meals[slot.slot]}
              onToggle={() => handleToggleMeal(slot.slot)}
              initialOption={log.workoutDone ? 0 : 1}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
