import type { Meal, MonthlyPlan } from "./types";
import { apiFetch } from "./api";

/* -------- Inventory keyword extraction -------- */
const STOP = new Set([
  "and","or","with","a","an","the","of","to","into","plus","optional",
  "fresh","dried","frozen","cooked","raw","baked","grilled","sliced","chopped",
  "seared","seasoned","whole","grain","steamed","boiled","roasted","smoked",
  "low","fat","2","percent","skim","extra","virgin","ground","mixed",
  "small","large","medium","big","cup","cups","tbsp","tsp","g","kg","ml","l",
  "slice","slices","can","cans","scoop","scoops","piece","pieces","oz",
  "pinch","handful","clove","cloves","leaf","leaves","stalk","stalks",
  "cube","cubes","bar","bars","stick","sticks","head","ribbon","ribbons",
  "for","over","on","in","per","each","as","needed","optional",
  "season","seasoning","spice","spices","salt","pepper","oil","sauce",
  "lemon","lime","juice","zest","water","ice","bite","bite-size",
]);

function tokenize(line: string): string[] {
  return line
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim().replace(/(ies)$/, "y").replace(/s$/, ""))
    .filter((w) => w.length >= 3 && !STOP.has(w));
}

export function ingredientKeywords(line: string): string[] {
  const toks = tokenize(line);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of toks) {
    if (!seen.has(t)) { seen.add(t); out.push(t); }
  }
  return out;
}

export function mealKeywords(meal: Meal): Set<string> {
  const set = new Set<string>();
  for (const raw of meal.ingredients) {
    for (const k of ingredientKeywords(raw)) set.add(k);
  }
  return set;
}

/* -------- Inventory storage (REST API) -------- */

export async function readInventory(userId: string): Promise<string[]> {
  return apiFetch<string[]>("/api/fridge/inventory");
}

export async function setInventory(userId: string, items: string[]): Promise<string[]> {
  return apiFetch<string[]>("/api/fridge/inventory", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function addInventoryItem(userId: string, item: string): Promise<string[]> {
  const cur = await readInventory(userId);
  const norm = item.trim().toLowerCase();
  if (!norm || cur.includes(norm)) return cur;
  return setInventory(userId, [...cur, norm]);
}

export async function removeInventoryItem(userId: string, item: string): Promise<string[]> {
  const norm = item.trim().toLowerCase();
  const cur = await readInventory(userId);
  return setInventory(userId, cur.filter((i) => i !== norm));
}

export async function deductMealFromInventory(userId: string, meal: Meal): Promise<string[]> {
  const inv = await readInventory(userId);
  if (!inv.length) return [];
  const kw = mealKeywords(meal);
  const removed: string[] = [];
  const next = inv.filter((item) => {
    const hit = kw.has(item) || Array.from(kw).some((k) => k.includes(item) || item.includes(k));
    if (hit) removed.push(item);
    return !hit;
  });
  if (removed.length) await setInventory(userId, next);
  return removed;
}

/* -------- Recipe ranking -------- */
export interface RecipeMatch {
  meal: Meal;
  dayInProgram: number;
  slot: Meal["slot"];
  variantSlotIndex: 0 | 1;
  matched: string[];
  missing: string[];
  total: number;
  score: number;
  perfect: boolean;
}

export function rankRecipes(plan: MonthlyPlan, pantry: string[]): RecipeMatch[] {
  const items = pantry.map((p) => p.toLowerCase()).filter(Boolean);
  if (!items.length) return [];
  const out: RecipeMatch[] = [];
  for (const day of plan.days) {
    for (const slot of day.meals) {
      for (let i = 0; i < 2; i++) {
        const meal = slot.options[i];
        const kw = mealKeywords(meal);
        const matched: string[] = [];
        const missing: string[] = [];
        for (const it of items) {
          const hit = kw.has(it) || Array.from(kw).some((k) => k.includes(it) || itemMatches(it, k));
          if (hit) matched.push(it); else missing.push(it);
        }
        if (!matched.length) continue;
        out.push({
          meal, dayInProgram: day.dayInProgram, slot: slot.slot,
          variantSlotIndex: i as 0 | 1,
          matched, missing,
          total: items.length,
          score: matched.length / items.length,
          perfect: matched.length === items.length,
        });
      }
    }
  }
  
  const seen = new Set<string>();
  const dedup: RecipeMatch[] = [];
  out.sort((a, b) => b.matched.length - a.matched.length || a.dayInProgram - b.dayInProgram);
  for (const r of out) {
    if (seen.has(r.meal.title)) continue;
    seen.add(r.meal.title);
    dedup.push(r);
  }
  return dedup;
}

function itemMatches(it: string, k: string): boolean {
  return k.includes(it) || it.includes(k);
}

export const SUGGESTED_INVENTORY = [
  "chicken","beef","turkey","salmon","tuna","cod","shrimp","egg","tofu",
  "spinach","broccoli","tomato","cucumber","pepper","onion","garlic","carrot",
  "zucchini","mushroom","avocado","lemon",
  "rice","quinoa","oats","pasta","bread","lentil","chickpea","bean","potato",
  "yoghurt","cheese","feta","milk","almond",
];
