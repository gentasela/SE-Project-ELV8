import { useEffect, useState } from "react";
import type { Meal, MealSlot } from "@/lib/types";

const SLOT_LABEL: Record<Meal["slot"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealView({
  slot,
  done,
  onToggle,
  initialOption = 0,
  optionLabels = ["Recovery", "Lean"],
}: {
  slot: MealSlot;
  done?: boolean;
  onToggle?: () => void;
  initialOption?: 0 | 1;
  optionLabels?: [string, string];
}) {
  const [open, setOpen] = useState(false);
  const [optionIdx, setOptionIdx] = useState<0 | 1>(initialOption);
  // Reactively follow workout-completion changes from the parent.
  useEffect(() => {
    setOptionIdx(initialOption);
  }, [initialOption]);
  const meal = slot.options[optionIdx];
  const altIdx: 0 | 1 = optionIdx === 0 ? 1 : 0;
  const currentLabel = optionLabels[optionIdx];
  const altLabel = optionLabels[altIdx];
  return (
    <article className="rounded-2xl border border-border bg-surface-2 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent-lime">
            {SLOT_LABEL[meal.slot]} · {currentLabel} · {meal.kcal} kcal
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h4 className="font-display text-lg font-700 text-foreground">{meal.title}</h4>
            <button
              type="button"
              onClick={() => setOptionIdx((i) => (i === 0 ? 1 : 0))}
              title={`Swap to ${altLabel}`}
              aria-label={`Swap to ${altLabel}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-sans text-[10px] font-700 uppercase tracking-[0.16em] text-muted-foreground transition hover:border-accent-lime/60 hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              Swap · {altLabel}
            </button>
          </div>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={!!done}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full border transition",
              done
                ? "border-accent-lime bg-accent-lime text-accent-lime-foreground"
                : "border-border bg-background text-muted-foreground hover:border-accent-lime/60",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground"
      >
        {open ? "Hide recipe" : "View recipe"}
        <span className={"transition " + (open ? "rotate-180" : "")}>▾</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Ingredients
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/90">
              {meal.ingredients.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Steps
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-foreground/90">
              {meal.steps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
}