import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { ensureMonthlyPlan } from "@/lib/plan";
import {
  buildGroceryList,
  readFridge,
  toggleFridge,
  type GroceryCategory,
} from "@/lib/grocery";
import type { MonthlyPlan, UserProfile } from "@/lib/types";

export const Route = createFileRoute("/app/grocery")({
  head: () => ({
    meta: [
      { title: "Shopping List — ELV8" },
      { name: "description", content: "Aggregated, categorized grocery list for your 30-day plan." },
    ],
  }),
  component: GroceryPage,
});

const CATEGORIES: GroceryCategory[] = [
  "Proteins", "Veggies & Fruits", "Grains & Pantry", "Dairy & Eggs", "Other",
];

type Scope = "week" | "month";

function GroceryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [week, setWeek] = useState<1 | 2 | 3 | 4>(1);
  const [scope, setScope] = useState<Scope>("week");
  const [fridge, setFridge] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) { navigate({ to: "/login" }); return; }
      setUser(u);
      
      const [p, check] = await Promise.all([
        ensureMonthlyPlan(u),
        readFridge(u.id),
      ]);
      setPlan(p);
      setFridge(check);
    };
    load();
  }, [navigate]);

  const list = useMemo(() => {
    if (!plan) return null;
    return buildGroceryList(plan, scope === "week" ? week : undefined);
  }, [plan, week, scope]);

  if (!user || !plan || !list) return null;

  const handleToggle = async (name: string) => {
    const next = await toggleFridge(user.id, name);
    setFridge(next);
  };

  const totals = CATEGORIES.reduce(
    (acc, c) => {
      const items = list[c];
      acc.total += items.length;
      acc.have += items.filter((i) => fridge[i.name]).length;
      return acc;
    },
    { total: 0, have: 0 },
  );

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header>
        <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Smart Grocery · Plan {plan.variant}
        </div>
        <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
          Shopping <span className="italic text-accent-lime">list</span>.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Just the items you need. Tap to check off — checked items move to the bottom.
        </p>
      </header>

      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Scope" className="inline-flex rounded-full border border-border bg-surface p-0.5">
          {(["week", "month"] as Scope[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              aria-pressed={scope === s}
              className={[
                "h-8 rounded-full px-4 font-sans text-[11px] font-700 uppercase tracking-[0.16em] transition",
                scope === s
                  ? "bg-accent-lime text-accent-lime-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {s === "week" ? `Week ${week}` : "Full month"}
            </button>
          ))}
        </div>
        {scope === "week" && (
          <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeek(w as 1 | 2 | 3 | 4)}
                aria-pressed={week === w}
                className={[
                  "h-8 w-9 rounded-full font-sans text-[11px] font-700 transition",
                  week === w
                    ? "bg-accent-lime text-accent-lime-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {w}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {totals.have} / {totals.total} in fridge
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {CATEGORIES.map((cat) => {
          const items = list[cat];
          if (!items.length) return null;
          // Sort: unchecked first (alpha), then checked (alpha) — checked sink.
          const sorted = [...items].sort((a, b) => {
            const ah = !!fridge[a.name];
            const bh = !!fridge[b.name];
            if (ah !== bh) return ah ? 1 : -1;
            return a.name.localeCompare(b.name);
          });
          const remaining = items.filter((i) => !fridge[i.name]).length;
          return (
            <div key={cat} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-700 text-foreground">{cat}</h2>
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {remaining} / {items.length} left
                </span>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {sorted.map((it) => {
                  const have = !!fridge[it.name];
                  return (
                    <li key={it.name}>
                      <button
                        type="button"
                        onClick={() => handleToggle(it.name)}
                        aria-pressed={have}
                        className="flex w-full items-center gap-3 py-3 text-left"
                      >
                        <span
                          className={[
                            "flex h-6 w-6 flex-none items-center justify-center rounded-md border transition",
                            have
                              ? "border-accent-lime bg-accent-lime text-accent-lime-foreground"
                              : "border-border bg-background text-muted-foreground",
                          ].join(" ")}
                        >
                          {have && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span
                          className={[
                            "font-display text-base font-600 transition",
                            have ? "text-muted-foreground line-through" : "text-foreground",
                          ].join(" ")}
                        >
                          {it.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
