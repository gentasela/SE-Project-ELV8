import type { ProgressLog } from "./types";

const KEY = "elv8:progress";

function dateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function readAll(): Record<string, ProgressLog> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, ProgressLog>) {
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

function k(userId: string, date: string) {
  return `${userId}:${date}`;
}

const empty: ProgressLog = {
  workoutDone: false,
  meals: { breakfast: false, lunch: false, dinner: false, snack: false },
};

export function getLog(userId: string, date: string = dateKey()): ProgressLog {
  const all = readAll();
  return all[k(userId, date)] ?? empty;
}

export function setLog(userId: string, patch: Partial<ProgressLog>, date: string = dateKey()) {
  const all = readAll();
  const key = k(userId, date);
  const merged: ProgressLog = {
    workoutDone: patch.workoutDone ?? all[key]?.workoutDone ?? false,
    meals: { ...empty.meals, ...all[key]?.meals, ...patch.meals },
  };
  all[key] = merged;
  writeAll(all);
  return merged;
}

export function toggleMeal(userId: string, slot: keyof ProgressLog["meals"]) {
  const current = getLog(userId);
  return setLog(userId, { meals: { ...current.meals, [slot]: !current.meals[slot] } });
}

export function toggleWorkout(userId: string) {
  const current = getLog(userId);
  return setLog(userId, { workoutDone: !current.workoutDone });
}

/** Returns last N days of logs (oldest first). */
export function recentDays(userId: string, n: number = 14): { date: string; log: ProgressLog }[] {
  const out: { date: string; log: ProgressLog }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = dateKey(d);
    out.push({ date, log: getLog(userId, date) });
  }
  return out;
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

export function streak(userId: string): number {
  // count consecutive days (ending today) where completionRate >= 0.6
  const today = new Date();
  let s = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const rate = completionRate(getLog(userId, dateKey(d)));
    if (rate >= 0.6) s++;
    else break;
  }
  return s;
}