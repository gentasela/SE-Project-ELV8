import { VARIANTS, type Variant } from "@/lib/types";

export function VariantSwitcher({
  value,
  onChange,
}: {
  value: Variant;
  onChange: (v: Variant) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Plan
      </span>
      <div
        role="group"
        aria-label="Plan variant"
        className="inline-flex rounded-full border border-border bg-surface p-0.5"
      >
        {VARIANTS.map((v) => {
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={active}
              className={[
                "h-7 w-8 rounded-full font-sans text-[11px] font-700 uppercase tracking-[0.1em] transition",
                active
                  ? "bg-accent-lime text-accent-lime-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

