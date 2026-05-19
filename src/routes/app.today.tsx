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
    const loadData = async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate({ to: "/login" });
        return;
      }
      setUser(u);
      
      // Load plan, progress and streak in parallel
      const [p, l, currentStreak] = await Promise.all([
        ensureMonthlyPlan(u),
        getLog(u.id),
        streak(u.id),
      ]);
      
      setPlan(p);
      setLog(l);
      setS(currentStreak);
    };
    loadData();
  }, [navigate]);

  const dayNum = useMemo(() => (plan ? currentProgramDay(plan) : 1), [plan]);
  const today = useMemo(() => (plan ? plan.days[dayNum - 1] : null), [plan, dayNum]);
  const disciplineLabel = useMemo(
    () => (user ? DISCIPLINES.find((d) => d.id === user.discipline)?.label ?? "" : ""),
    [user],
  );

  const notifications = useMemo(() => {
    if (!user || !user.remindersEnabled || !log || !today) return [];
    const list = [];

    // Workout reminder
    if (!log.workoutDone) {
      list.push({
        id: "workout",
        type: "workout",
        title: "Workout Pending",
        message: `Your scheduled workout for today is "${today.workout.title}" (${today.workout.durationMin} mins). Make sure to check it off once completed!`,
      });
    } else {
      list.push({
        id: "workout-done",
        type: "success",
        title: "Workout Completed!",
        message: `Great job completing "${today.workout.title}" today! Keep that momentum going.`,
      });
    }

    // Meal reminders
    const missingMeals = Object.entries(log.meals).filter(([_, done]) => !done);
    if (missingMeals.length > 0) {
      const slots = missingMeals.map(([slot]) => slot.charAt(0).toUpperCase() + slot.slice(1)).join(", ");
      list.push({
        id: "meals",
        type: "meal",
        title: "Nutrition Tracker",
        message: `Keep tracking your clean eating! You have pending meal entries: ${slots}.`,
      });
    } else {
      list.push({
        id: "meals-done",
        type: "success",
        title: "Perfect Nutrition!",
        message: "You checked off all your meals for today. Outstanding discipline!",
      });
    }

    // Goal tip
    if (user.goal === "lose") {
      list.push({
        id: "tip",
        type: "tip",
        title: "Nutrition Tip",
        message: "Focus on high-volume, low-calorie foods (like leafy greens and lean proteins) to stay full while in a deficit.",
      });
    } else {
      list.push({
        id: "tip",
        type: "tip",
        title: "Nutrition Tip",
        message: "Ensure you're meeting your calorie surplus with clean carb sources like oats, sweet potatoes, and white rice.",
      });
    }

    return list;
  }, [user, log, today]);

  if (!user || !plan || !today || !log) return null;

  const budget = macroBudget(today.targetKcal);
  const consumed = consumedForDay(today, log);

  const handleToggleWorkout = async () => {
    const next = await toggleWorkout(user.id);
    setLog(next);
    const currentStreak = await streak(user.id);
    setS(currentStreak);
  };
  const handleToggleMeal = async (slot: keyof ProgressLog["meals"]) => {
    const wasDone = log?.meals[slot] ?? false;
    const next = await toggleMeal(user.id, slot);
    setLog(next);
    const currentStreak = await streak(user.id);
    setS(currentStreak);
    // If we just marked the meal complete, deduct its ingredients from
    // the user's "in fridge" inventory so the pantry stays in sync.
    if (!wasDone && next.meals[slot]) {
      const slotEntry = today.meals.find((m) => m.slot === slot);
      if (slotEntry) {
        const optionIdx = log?.workoutDone ? 0 : 1;
        await deductMealFromInventory(user.id, slotEntry.options[optionIdx]);
      }
    }
  };
  const switchVariant = async (v: Variant) => {
    const nextPlan = await setActiveVariant(user, v);
    setPlan(nextPlan);
  };

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

      {/* Reminders & Notifications */}
      {user.remindersEnabled && notifications.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-lime"></span>
            </span>
            <h2 className="font-display text-xs font-700 uppercase tracking-widest text-muted-foreground">
              Daily Reminders
            </h2>
          </div>
          <div className="mt-3 space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3 transition-all duration-300 hover:border-accent-lime/40"
              >
                <div className="mt-0.5 text-accent-lime">
                  {n.type === "success" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : n.type === "workout" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : n.type === "meal" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V17H9m3 0V17" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-display text-xs font-700 text-foreground">{n.title}</h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!user.remindersEnabled && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-border bg-surface/20 p-4 text-xs text-muted-foreground">
          <span>Daily tips and checklist reminders are muted.</span>
          <button
            onClick={() => navigate({ to: "/app/me" })}
            className="text-accent-lime hover:underline font-600 uppercase tracking-wider text-[10px]"
          >
            Enable Reminders
          </button>
        </div>
      )}

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
