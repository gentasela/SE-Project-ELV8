import type { MonthlyPlan, ProgramDay, UserProfile, Variant } from "./types";
import { VARIANTS } from "./types";
import { build30DayWorkouts } from "@/data/workoutBlocks";
import { build30DayMeals } from "@/data/mealBlocks";

// v4: added Powerbuilding and Cardio & HIIT disciplines.
// Bumping the key invalidates older cached plans.
const PLAN_KEY = "elv8:monthlyPlan:v4";

/* ---------- calorie target (Mifflin-St Jeor) ---------- */
export function calcTargetKcal(u: UserProfile): number {
  const bmr =
    u.sex === "male"
      ? 10 * u.weightKg + 6.25 * u.heightCm - 5 * u.age + 5
      : 10 * u.weightKg + 6.25 * u.heightCm - 5 * u.age - 161;
  const tdee = bmr * 1.45;
  const adj = u.goal === "lose" ? -500 : 400;
  return Math.max(1400, Math.round(tdee + adj));
}

/* ---------- date helpers ---------- */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
}
function weekdayMon0(iso: string): number {
  // 0 = Mon .. 6 = Sun
  const js = new Date(iso + "T00:00:00").getDay();
  return (js + 6) % 7;
}

/* ---------- generation ---------- */
export function generateMonthlyPlan(u: UserProfile, variant: Variant = 1): MonthlyPlan {
  const targetKcal = calcTargetKcal(u);
  const startDate = isoDate(new Date());
  const startWeekday = weekdayMon0(startDate);

  const workouts = build30DayWorkouts(u.discipline, u.level, u.goal, variant, startWeekday);
  const meals = build30DayMeals(u.discipline, u.level, u.goal, variant, targetKcal);

  const days: ProgramDay[] = workouts.map((w, i) => ({
    dayInProgram: i + 1,
    weekIndex: w.weekIndex,
    weekdayLabel: w.weekdayLabel,
    workout: w.workout,
    meals: meals[i],
    targetKcal,
  }));

  return {
    generatedAt: Date.now(),
    startDate,
    userId: u.id,
    targetKcal,
    variant,
    discipline: u.discipline,
    level: u.level,
    goal: u.goal,
    days,
  };
}

/* ---------- per-variant cache (so toggling variants is instant & stable) ---------- */
function planKey(userId: string) {
  return `${PLAN_KEY}:${userId}`;
}

interface StoredPlans {
  active: Variant;
  plans: Partial<Record<Variant, MonthlyPlan>>;
}

function readStore(userId: string): StoredPlans | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(planKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredPlans;
  } catch {
    return null;
  }
}

function writeStore(userId: string, store: StoredPlans) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(planKey(userId), JSON.stringify(store));
}

/** Ensure all 3 variants exist for the user, return active plan. */
export function ensureMonthlyPlan(u: UserProfile): MonthlyPlan {
  let store = readStore(u.id);
  if (!store) {
    store = { active: 1, plans: {} };
  }
  // (Re)generate any missing variant
  for (const v of VARIANTS) {
    if (!store.plans[v]) store.plans[v] = generateMonthlyPlan(u, v);
  }
  // If user changed profile (discipline/level/goal), regenerate all
  const sample = store.plans[1]!;
  if (
    sample.discipline !== u.discipline ||
    sample.level !== u.level ||
    sample.goal !== u.goal
  ) {
    for (const v of VARIANTS) store.plans[v] = generateMonthlyPlan(u, v);
  }
  writeStore(u.id, store);
  return store.plans[store.active]!;
}

export function setActiveVariant(u: UserProfile, variant: Variant): MonthlyPlan {
  const store = readStore(u.id) ?? { active: 1, plans: {} };
  for (const v of VARIANTS) if (!store.plans[v]) store.plans[v] = generateMonthlyPlan(u, v);
  store.active = variant;
  writeStore(u.id, store);
  return store.plans[variant]!;
}

export function regenerateMonthlyPlans(u: UserProfile): MonthlyPlan {
  const store: StoredPlans = { active: 1, plans: {} };
  for (const v of VARIANTS) store.plans[v] = generateMonthlyPlan(u, v);
  writeStore(u.id, store);
  return store.plans[1]!;
}

export function getActiveVariant(userId: string): Variant {
  return readStore(userId)?.active ?? 1;
}

/* ---------- day-of-program math ----------
 * Day 1 = startDate. If today > startDate + 29, the program is complete. */
export function currentProgramDay(plan: MonthlyPlan): number {
  const today = isoDate(new Date());
  const start = plan.startDate;
  const diff = Math.floor(
    (new Date(today + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return Math.min(30, Math.max(1, diff + 1));
}

export function dateForDay(plan: MonthlyPlan, dayInProgram: number): string {
  return addDays(plan.startDate, dayInProgram - 1);
}

/* ---------- swap a meal for a given day (persisted across variants) ----------
 * Replaces the primary option (A) of the slot on `dayInProgram` for the active
 * variant. The previous option-A becomes option B so the user can swap back.
 */
import type { Meal } from "./types";
export function swapMealForDay(
  u: UserProfile,
  dayInProgram: number,
  slot: Meal["slot"],
  newMeal: Meal,
): MonthlyPlan {
  const store = readStore(u.id);
  if (!store) return ensureMonthlyPlan(u);
  const active = store.active;
  const plan = store.plans[active];
  if (!plan) return ensureMonthlyPlan(u);
  const day = plan.days[dayInProgram - 1];
  if (!day) return plan;
  const idx = day.meals.findIndex((m) => m.slot === slot);
  if (idx < 0) return plan;
  const cur = day.meals[idx];
  day.meals[idx] = { slot: cur.slot, options: [newMeal, cur.options[0]] };
  writeStore(u.id, store);
  return plan;
}
