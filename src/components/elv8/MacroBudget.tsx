import type { Macros } from "@/lib/macros";

interface BarProps {
  label: string;
  consumed: number;
  budget: number;
  unit: string;
  color: string; // CSS color for the fill
}

function Bar({ label, consumed, budget, unit, color }: BarProps) {
  const pct = Math.min(100, Math.round((consumed / Math.max(1, budget)) * 100));
  const over = consumed > budget;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-[10px] font-700 uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="font-sans text-[11px] tabular-nums text-foreground/85">
          <span className={over ? "text-destructive" : "text-foreground"}>{consumed}</span>
          <span className="text-muted-foreground"> / {budget}{unit}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
          aria-valuenow={consumed}
          aria-valuemax={budget}
          role="progressbar"
        />
      </div>
    </div>
  );
}

export function MacroBudget({
  consumed,
  budget,
}: {
  consumed: Macros;
  budget: Macros;
}) {
  return (
    <section
      aria-label="Daily macro budget"
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-700 text-foreground">Daily progress</h2>
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Auto from completed meals
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Bar
          label="Calories"
          consumed={consumed.calories}
          budget={budget.calories}
          unit=" kcal"
          color="var(--accent-lime)"
        />
        <Bar
          label="Protein"
          consumed={consumed.protein}
          budget={budget.protein}
          unit=" g"
          color="oklch(0.78 0.15 200)"
        />
        <Bar
          label="Carbs"
          consumed={consumed.carbs}
          budget={budget.carbs}
          unit=" g"
          color="oklch(0.82 0.16 80)"
        />
        <Bar
          label="Fats"
          consumed={consumed.fat}
          budget={budget.fat}
          unit=" g"
          color="oklch(0.72 0.18 25)"
        />
      </div>
    </section>
  );
}
