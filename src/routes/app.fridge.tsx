import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { ensureMonthlyPlan, swapMealForDay, currentProgramDay } from "@/lib/plan";
import {
  readInventory,
  setInventory,
  addInventoryItem,
  removeInventoryItem,
  rankRecipes,
  SUGGESTED_INVENTORY,
  type RecipeMatch,
} from "@/lib/fridge";
import type { MonthlyPlan, UserProfile } from "@/lib/types";

export const Route = createFileRoute("/app/fridge")({
  head: () => ({
    meta: [
      { title: "Fridge — ELV8" },
      { name: "description", content: "Find recipes that match what's already in your fridge." },
    ],
  }),
  component: FridgePage,
});

const SLOT_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" } as const;

function FridgePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [swapped, setSwapped] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) { navigate({ to: "/login" }); return; }
      setUser(u);
      
      const [p, inv] = await Promise.all([
        ensureMonthlyPlan(u),
        readInventory(u.id),
      ]);
      setPlan(p);
      setItems(inv);
    };
    load();
  }, [navigate]);

  const matches = useMemo(() => {
    if (!plan || items.length === 0) return [] as RecipeMatch[];
    return rankRecipes(plan, items).slice(0, 30);
  }, [plan, items]);

  const perfect = matches.filter((m) => m.perfect);
  const partial = matches.filter((m) => !m.perfect);

  if (!user || !plan) return null;

  const dayNum = currentProgramDay(plan);

  const add = async (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    const next = await addInventoryItem(user.id, v);
    setItems(next);
    setDraft("");
  };
  const remove = async (v: string) => {
    const next = await removeInventoryItem(user.id, v);
    setItems(next);
  };
  const clear = async () => {
    const next = await setInventory(user.id, []);
    setItems(next);
  };

  const swapIntoToday = async (m: RecipeMatch) => {
    const next = await swapMealForDay(user, dayNum, m.slot, m.meal);
    setPlan({ ...next });
    setSwapped(`${SLOT_LABEL[m.slot]} swapped to "${m.meal.title}".`);
    setTimeout(() => setSwapped(null), 2400);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header>
        <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
          What's in my fridge
        </div>
        <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
          Cook with what you <span className="italic text-accent-lime">have</span>.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Add 3–4 ingredients. We'll rank recipes from your 30-day plan that use them.
        </p>
      </header>

      {/* Inventory input */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-700 text-foreground">My ingredients</h2>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="font-sans text-[10px] font-700 uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); add(draft); }}
          className="mt-3 flex gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. chicken, spinach, rice"
            className="h-10 flex-1 rounded-full border border-border bg-background px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-accent-lime focus:outline-none"
          />
          <button
            type="submit"
            className="h-10 rounded-full bg-accent-lime px-4 font-sans text-[11px] font-700 uppercase tracking-[0.18em] text-accent-lime-foreground"
          >
            Add
          </button>
        </form>

        {items.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {items.map((it) => (
              <button
                key={it}
                type="button"
                onClick={() => remove(it)}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent-lime bg-accent-lime/10 px-3 py-1 font-sans text-xs font-700 text-foreground"
                aria-label={`Remove ${it}`}
              >
                {it}
                <span aria-hidden className="text-accent-lime">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Quick add
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_INVENTORY.filter((s) => !items.includes(s)).slice(0, 18).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="rounded-full border border-border bg-background px-3 py-1 font-sans text-xs text-muted-foreground transition hover:border-accent-lime/60 hover:text-foreground"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {swapped && (
        <div className="mt-4 rounded-xl border border-accent-lime/60 bg-accent-lime/10 px-4 py-2 font-sans text-sm text-foreground">
          {swapped}
        </div>
      )}

      {/* Results */}
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Add ingredients above to see matching recipes.
        </p>
      ) : matches.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No recipes in your plan use those ingredients yet. Try swapping one out.
        </p>
      ) : (
        <>
          {perfect.length > 0 && (
            <Section
              title="Perfect matches"
              subtitle={`Uses all ${items.length} of your ingredients`}
              matches={perfect}
              onSwap={swapIntoToday}
              perfect
            />
          )}
          {partial.length > 0 && (
            <Section
              title="Partial matches"
              subtitle="Uses some — needs a few extras"
              matches={partial}
              onSwap={swapIntoToday}
            />
          )}
        </>
      )}
    </main>
  );
}

function Section({
  title, subtitle, matches, onSwap, perfect,
}: {
  title: string;
  subtitle: string;
  matches: RecipeMatch[];
  onSwap: (m: RecipeMatch) => void;
  perfect?: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-700 text-foreground">{title}</h2>
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {matches.length} recipes
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 grid gap-3">
        {matches.map((m) => (
          <article
            key={`${m.meal.title}-${m.dayInProgram}-${m.slot}`}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent-lime">
                  {SLOT_LABEL[m.slot]} · {m.meal.kcal} kcal · Day {m.dayInProgram}
                </div>
                <h3 className="mt-1 font-display text-lg font-700 text-foreground">{m.meal.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.matched.map((k) => (
                    <span key={k} className="rounded-full bg-accent-lime/15 px-2 py-0.5 font-sans text-[10px] font-700 uppercase tracking-[0.14em] text-accent-lime">
                      ✓ {k}
                    </span>
                  ))}
                  {!perfect && m.missing.map((k) => (
                    <span key={k} className="rounded-full border border-border px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      not used: {k}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSwap(m)}
                className="rounded-full border border-accent-lime bg-accent-lime px-3 py-1.5 font-sans text-[10px] font-700 uppercase tracking-[0.18em] text-accent-lime-foreground"
              >
                Swap into today
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
