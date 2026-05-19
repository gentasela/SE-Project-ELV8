import type { MonthlyPlan, ProgramDay, UserProfile, Variant } from "./types";
import { build30DayWorkouts } from "../data/workoutBlocks";
import { build30DayMeals } from "../data/mealBlocks";

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
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
}
export function weekdayMon0(iso: string): number {
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
