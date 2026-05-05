import type { Meal, MonthlyPlan, ProgramDay, UserProfile } from "./types";

/* -------- Inventory keyword extraction --------
 * We extract simple food-noun keywords from ingredient strings so we can
 * match a user's pantry items against any recipe ingredient line.
 * Stop-words and units are filtered out; we also strip leading qty/unit.
 */

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

/** Extract a small set of canonical "keywords" from one ingredient line. */
export function ingredientKeywords(line: string): string[] {
  const toks = tokenize(line);
  // de-dup, keep order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of toks) {
    if (!seen.has(t)) { seen.add(t); out.push(t); }
  }
  return out;
}

/** Aggregate keywords across all ingredients of a meal. */
export function mealKeywords(meal: Meal): Set<string> {
  const set = new Set<string>();
  for (const raw of meal.ingredients) {
    for (const k of ingredientKeywords(raw)) set.add(k);
  }
  return set;
}

/* -------- Inventory storage --------
 * Inventory items are simple lowercase keywords (e.g., "chicken", "spinach").
 * Persisted per-user in localStorage.
 */
const INV_KEY = "elv8:fridgeInv";

interface InventoryStore { [userId: string]: string[] }

function readAll(): InventoryStore {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(INV_KEY) ?? "{}"); }
  catch { return {}; }
}
function writeAll(s: InventoryStore) {
  window.localStorage.setItem(INV_KEY, JSON.stringify(s));
}

export function readInventory(userId: string): string[] {
  return readAll()[userId] ?? [];
}

export function setInventory(userId: string, items: string[]): string[] {
  const norm = Array.from(new Set(items.map((i) => i.trim().toLowerCase()).filter(Boolean)));
  const all = readAll();
  all[userId] = norm;
  writeAll(all);
  return norm;
}

export function addInventoryItem(userId: string, item: string): string[] {
  const cur = readInventory(userId);
  const norm = item.trim().toLowerCase();
  if (!norm || cur.includes(norm)) return cur;
  return setInventory(userId, [...cur, norm]);
}

export function removeInventoryItem(userId: string, item: string): string[] {
  const norm = item.trim().toLowerCase();
  return setInventory(userId, readInventory(userId).filter((i) => i !== norm));
}

/** Remove from inventory any items whose keyword appears in the meal. Returns removed list. */
export function deductMealFromInventory(userId: string, meal: Meal): string[] {
  const inv = readInventory(userId);
  if (!inv.length) return [];
  const kw = mealKeywords(meal);
  const removed: string[] = [];
  const next = inv.filter((item) => {
    const hit = kw.has(item) || Array.from(kw).some((k) => k.includes(item) || item.includes(k));
    if (hit) removed.push(item);
    return !hit;
  });
  if (removed.length) setInventory(userId, next);
  return removed;
}

/* -------- Recipe ranking --------
 * Score every meal in the plan by how many of the user's pantry items it covers.
 */
export interface RecipeMatch {
  meal: Meal;
  dayInProgram: number;
  slot: Meal["slot"];
  variantSlotIndex: 0 | 1; // which option (A or B)
  matched: string[];       // pantry items the recipe uses
  missing: string[];       // pantry items NOT used
  total: number;           // pantry size
  score: number;           // matched / total
  perfect: boolean;        // matched == total
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
          const hit = kw.has(it) || Array.from(kw).some((k) => k.includes(it) || it.includes(k));
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
  // De-dup by meal title (so we don't show the same recipe 8 times across the month)
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

/* -------- Suggested keywords (for quick-add chips) -------- */
export const SUGGESTED_INVENTORY = [
  "chicken","beef","turkey","salmon","tuna","cod","shrimp","egg","tofu",
  "spinach","broccoli","tomato","cucumber","pepper","onion","garlic","carrot",
  "zucchini","mushroom","avocado","lemon",
  "rice","quinoa","oats","pasta","bread","lentil","chickpea","bean","potato",
  "yoghurt","cheese","feta","milk","almond",
];
