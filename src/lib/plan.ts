import type { MonthlyPlan, UserProfile, Variant, Meal } from "./types";
import { apiFetch } from "./api";
export { calcTargetKcal, generateMonthlyPlan } from "./plan-logic";

/* ---------- day-of-program math ----------
 * Day 1 = startDate. If today > startDate + 29, the program is complete. */
export function currentProgramDay(plan: MonthlyPlan): number {
  const today = new Date().toISOString().slice(0, 10);
  const start = plan.startDate;
  const diff = Math.floor(
    (new Date(today + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return Math.min(30, Math.max(1, diff + 1));
}

export function dateForDay(plan: MonthlyPlan, dayInProgram: number): string {
  const d = new Date(plan.startDate + "T00:00:00");
  d.setDate(d.getDate() + dayInProgram - 1);
  return d.toISOString().slice(0, 10);
}

/* ---------- API client methods ---------- */

export async function ensureMonthlyPlan(u: UserProfile): Promise<MonthlyPlan> {
  return apiFetch<MonthlyPlan>("/api/plans");
}

export async function setActiveVariant(u: UserProfile, variant: Variant): Promise<MonthlyPlan> {
  return apiFetch<MonthlyPlan>("/api/plans/variant", {
    method: "PUT",
    body: JSON.stringify({ variant }),
  });
}

export async function regenerateMonthlyPlans(u: UserProfile): Promise<MonthlyPlan> {
  return apiFetch<MonthlyPlan>("/api/plans/regenerate", {
    method: "POST",
  });
}

export async function getActiveVariant(userId: string): Promise<Variant> {
  const plan = await apiFetch<MonthlyPlan>("/api/plans");
  return plan.variant;
}

export async function swapMealForDay(
  u: UserProfile,
  dayInProgram: number,
  slot: Meal["slot"],
  newMeal: Meal,
): Promise<MonthlyPlan> {
  return apiFetch<MonthlyPlan>("/api/plans/swap-meal", {
    method: "PUT",
    body: JSON.stringify({ dayInProgram, slot, newMeal }),
  });
}
