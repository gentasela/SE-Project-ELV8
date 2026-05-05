import type { MonthlyPlan } from "./types";

export type GroceryCategory = "Proteins" | "Veggies & Fruits" | "Grains & Pantry" | "Dairy & Eggs" | "Other";

export interface GroceryItem {
  /** Normalised display name, e.g. "Chicken breast". */
  name: string;
  category: GroceryCategory;
  /** Per-day breakdown for traceability ("Day 1: 200 g + Day 4: 200 g = 400 g"). */
  breakdown: { day: number; amount: string }[];
  /** Aggregated quantity if numeric, else combined free-text. */
  total: string;
}

const PROTEINS = [
  "chicken", "turkey", "beef", "lamb", "shrimp", "salmon", "cod", "tuna",
  "halibut", "trout", "sardine", "mackerel", "sole", "sea bass", "branzino",
  "tilapia", "egg", "tofu", "tempeh", "whey", "jerky",
];
const VEG_FRUIT = [
  "spinach", "broccoli", "kale", "tomato", "cucumber", "pepper", "onion",
  "garlic", "carrot", "zucchini", "asparagus", "cabbage", "lettuce",
  "arugula", "beet", "bok choy", "fennel", "green bean", "peas",
  "cauliflower", "mushroom", "pumpkin", "sweet potato", "potato",
  "apple", "banana", "berry", "berries", "blueberry", "raspberr", "peach",
  "pear", "lemon", "lime", "orange", "pomegranate", "avocado", "date",
  "pineapple", "parsley", "mint", "cilantro", "scallion", "ginger",
];
const GRAINS_PANTRY = [
  "oat", "rice", "quinoa", "couscous", "pasta", "bread", "toast", "rye",
  "bagel", "tortilla", "wrap", "cracker", "granola", "flour", "lentil",
  "chickpea", "bean", "olive oil", "tahini", "honey", "cinnamon", "salt",
  "pepper", "spice", "chia", "flax", "almond", "walnut", "peanut", "nut",
  "jam", "tamari", "broth", "coconut milk", "almond milk", "hummus",
];
const DAIRY = [
  "yoghurt", "yogurt", "milk", "cheese", "feta", "ricotta", "cottage",
  "cream", "kefir", "mozzarella",
];

const CATEGORY_ORDER: GroceryCategory[] = [
  "Proteins", "Veggies & Fruits", "Grains & Pantry", "Dairy & Eggs", "Other",
];

function categorize(name: string): GroceryCategory {
  const n = name.toLowerCase();
  if (PROTEINS.some((p) => n.includes(p))) return n.includes("egg") ? "Dairy & Eggs" : "Proteins";
  if (DAIRY.some((p) => n.includes(p))) return "Dairy & Eggs";
  if (VEG_FRUIT.some((p) => n.includes(p))) return "Veggies & Fruits";
  if (GRAINS_PANTRY.some((p) => n.includes(p))) return "Grains & Pantry";
  return "Other";
}

/** Parse "200 g chicken breast" -> { qty: 200, unit: "g", name: "chicken breast" } */
function parseLine(raw: string): { qty?: number; unit?: string; name: string } {
  const line = raw.trim().replace(/^[•\-*]\s*/, "");
  // Match leading qty (number or fraction like 1/2) + optional unit.
  const re = /^([\d./]+)\s*(g|kg|ml|l|cup|cups|tbsp|tsp|slice|slices|can|cans|scoop|scoops|piece|pieces)?\s*(.*)$/i;
  const m = line.match(re);
  if (!m) return { name: line.toLowerCase() };
  const qtyStr = m[1];
  let qty: number | undefined;
  if (qtyStr.includes("/")) {
    const [a, b] = qtyStr.split("/").map(Number);
    if (b) qty = a / b;
  } else {
    qty = Number(qtyStr);
    if (Number.isNaN(qty)) qty = undefined;
  }
  const unit = m[2]?.toLowerCase();
  const name = m[3].toLowerCase().trim();
  return { qty, unit, name: name || line.toLowerCase() };
}

/** Normalise the ingredient name into a canonical "key" for grouping.
 * e.g. "150 g chicken breast" and "180 g chicken" -> both "chicken breast" / "chicken".
 * Strategy: pick the most-distinctive food noun. */
function canonicalKey(name: string): string {
  // Drop trailing parentheticals + descriptors after commas.
  let n = name.split(",")[0].split("(")[0].trim();
  // Strip leading filler adjectives.
  n = n.replace(/^(grilled|baked|seared|seasoned|fresh|sliced|chopped|steamed|raw|cooked|roasted|whole-grain|whole grain|boiled|smoked)\s+/i, "");
  // Singularise simple plurals.
  n = n.replace(/(ies)$/, "y").replace(/s$/, "");
  return n.trim();
}

/** Build a grocery list from the plan.
 * If `weekIndex` is provided (1..4), restricts to that week. */
export function buildGroceryList(plan: MonthlyPlan, weekIndex?: number): Record<GroceryCategory, GroceryItem[]> {
  const days = weekIndex
    ? plan.days.filter((d) => d.weekIndex === weekIndex)
    : plan.days;

  // Map: canonicalName -> aggregator
  const map = new Map<string, GroceryItem & { numericQty: number; unit?: string; nonNumeric: string[] }>();

  for (const day of days) {
    for (const slot of day.meals) {
      // Use Option A as the canonical "shopping" recipe (the recovery default).
      const meal = slot.options[0];
      for (const raw of meal.ingredients) {
        const { qty, unit, name } = parseLine(raw);
        if (!name) continue;
        const key = canonicalKey(name);
        const display = key.charAt(0).toUpperCase() + key.slice(1);
        const existing = map.get(key);
        if (existing) {
          if (qty !== undefined && (!existing.unit || existing.unit === unit)) {
            existing.numericQty += qty;
            existing.unit = existing.unit ?? unit;
            existing.breakdown.push({ day: day.dayInProgram, amount: `${qty}${unit ? " " + unit : ""}` });
          } else {
            existing.nonNumeric.push(`Day ${day.dayInProgram}: ${raw}`);
            existing.breakdown.push({ day: day.dayInProgram, amount: raw });
          }
        } else {
          map.set(key, {
            name: display,
            category: categorize(key),
            breakdown: qty !== undefined
              ? [{ day: day.dayInProgram, amount: `${qty}${unit ? " " + unit : ""}` }]
              : [{ day: day.dayInProgram, amount: raw }],
            total: "",
            numericQty: qty ?? 0,
            unit,
            nonNumeric: qty === undefined ? [raw] : [],
          });
        }
      }
    }
  }

  // Finalise totals.
  const grouped: Record<GroceryCategory, GroceryItem[]> = {
    "Proteins": [], "Veggies & Fruits": [], "Grains & Pantry": [], "Dairy & Eggs": [], "Other": [],
  };
  for (const item of map.values()) {
    let total = "";
    if (item.numericQty > 0) {
      const rounded = Math.round(item.numericQty * 10) / 10;
      total = `${rounded}${item.unit ? " " + item.unit : ""}`;
      if (item.nonNumeric.length) total += ` + ${item.nonNumeric.length} extra`;
    } else {
      total = `${item.breakdown.length}× as needed`;
    }
    grouped[item.category].push({
      name: item.name,
      category: item.category,
      breakdown: item.breakdown,
      total,
    });
  }
  for (const cat of CATEGORY_ORDER) {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
}

/* ---------------- Fridge inventory (localStorage) ---------------- */

const KEY = "elv8:fridge";

export function readFridge(userId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return all[userId] ?? {};
  } catch {
    return {};
  }
}

export function toggleFridge(userId: string, itemName: string): Record<string, boolean> {
  const all = (() => {
    try { return JSON.parse(window.localStorage.getItem(KEY) ?? "{}"); }
    catch { return {}; }
  })();
  const cur = all[userId] ?? {};
  cur[itemName] = !cur[itemName];
  all[userId] = cur;
  window.localStorage.setItem(KEY, JSON.stringify(all));
  return cur;
}
