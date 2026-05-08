import type { Meal, MealSlot, ProgressLog, ProgramDay, Workout } from "./types";

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export const MACRO_KEYS: (keyof Macros)[] = ["calories", "protein", "carbs", "fat"];

export const ZERO: Macros = { protein: 0, carbs: 0, fat: 0, calories: 0 };

export function add(a: Macros, b: Macros): Macros {
  return {
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    calories: a.calories + b.calories,
  };
}

/** Pick the recipe option from a slot using the same rule as the dashboard. */
export function pickOption(slot: MealSlot, workoutDone: boolean): Meal {
  // Workout done -> Option A (recovery / higher cal). Else -> Option B (lean).
  return workoutDone ? slot.options[0] : slot.options[1];
}

/** Sum macros for completed meals on a given day. */
export function consumedForDay(
  day: ProgramDay,
  log: ProgressLog,
): Macros {
  let total = { ...ZERO };
  for (const slot of day.meals) {
    if (!log.meals[slot.slot]) continue;
    const meal = pickOption(slot, log.workoutDone);
    total = add(total, meal.macros);
  }
  return total;
}

/** Daily macro budget derived from the day's calorie target.
 * Split: 30% protein, 45% carbs, 25% fat. */
export function macroBudget(targetKcal: number): Macros {
  return {
    calories: targetKcal,
    protein: Math.round((targetKcal * 0.30) / 4),
    carbs: Math.round((targetKcal * 0.45) / 4),
    fat: Math.round((targetKcal * 0.25) / 9),
  };
}

/* ---------------- METs (workout intensity) ----------------
 * Derived from focus keywords + durationMin. Typical MET values:
 *  light mobility / yoga ~ 2.5
 *  pilates / bodyweight  ~ 4
 *  strength / lifts      ~ 5
 *  metcon / circuit      ~ 7
 *  HIIT / sprint / plyo  ~ 9
 */
export function metsForWorkout(w: Workout): number {
  if (w.restDay) return 2.0;
  const f = (w.focus + " " + w.title).toLowerCase();
  if (/hiit|tabata|sprint|metcon|plyo|emom|interval|cardio/.test(f)) return 9;
  if (/circuit|conditioning|fat[- ]?loss|burn|burpee/.test(f)) return 7;
  if (/strength|powerlift|powerbuild|squat|bench|deadlift|lift|hypertrophy/.test(f)) return 5.5;
  if (/bodyweight|calisthenic|core/.test(f)) return 4.5;
  if (/pilates|mobility|flow/.test(f)) return 4;
  if (/yoga|breath|recovery|stretch/.test(f)) return 2.8;
  return 4;
}

/** Intensity score for the day (0..100): METs * (durationMin / 60) normalised. */
export function intensityScore(w: Workout, completed: boolean): number {
  if (!completed) return 0;
  const mets = metsForWorkout(w);
  const hours = (w.durationMin ?? 30) / 60;
  // 9 METs * 1h = 9 -> ~90. Cap at 100.
  return Math.min(100, Math.round(mets * hours * 10));
}

/** Consistency score (0..100) — how close consumed kcal landed inside the budget.
 * 100 = within ±10% of target. Drops linearly to 0 at ±60%. */
export function consistencyScore(consumedKcal: number, targetKcal: number): number {
  if (consumedKcal <= 0) return 0;
  const diff = Math.abs(consumedKcal - targetKcal) / targetKcal;
  if (diff <= 0.10) return 100;
  if (diff >= 0.60) return 0;
  return Math.round((1 - (diff - 0.10) / 0.50) * 100);
}
