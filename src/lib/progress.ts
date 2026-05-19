import type { ProgressLog } from "./types";
import { apiFetch } from "./api";

function dateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function getAllLogs(userId: string): Promise<Record<string, ProgressLog>> {
  return apiFetch<Record<string, ProgressLog>>("/api/progress");
}

export async function getLog(userId: string, date: string = dateKey()): Promise<ProgressLog> {
  return apiFetch<ProgressLog>(`/api/progress/log/${date}`);
}

export async function setLog(userId: string, patch: Partial<ProgressLog>, date: string = dateKey()): Promise<ProgressLog> {
  return apiFetch<ProgressLog>(`/api/progress/log/${date}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export async function toggleMeal(userId: string, slot: keyof ProgressLog["meals"]): Promise<ProgressLog> {
  const current = await getLog(userId);
  return setLog(userId, { meals: { ...current.meals, [slot]: !current.meals[slot] } });
}

export async function toggleWorkout(userId: string): Promise<ProgressLog> {
  const current = await getLog(userId);
  return setLog(userId, { workoutDone: !current.workoutDone });
}

/** Returns last N days of logs (oldest first). */
export async function recentDays(userId: string, n: number = 14): Promise<{ date: string; log: ProgressLog }[]> {
  return apiFetch<{ date: string; log: ProgressLog }[]>(`/api/progress/recent?n=${n}`);
}

export async function streak(userId: string): Promise<number> {
  const data = await apiFetch<{ streak: number }>("/api/progress/streak");
  return data.streak;
}

export function completionRate(log: ProgressLog): number {
  const total = 5;
  const done =
    (log.workoutDone ? 1 : 0) +
    (log.meals.breakfast ? 1 : 0) +
    (log.meals.lunch ? 1 : 0) +
    (log.meals.dinner ? 1 : 0) +
    (log.meals.snack ? 1 : 0);
  return done / total;
}