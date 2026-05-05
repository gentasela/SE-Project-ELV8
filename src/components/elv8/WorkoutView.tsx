import type { Workout } from "@/lib/types";
import { ExerciseDemoButton } from "@/components/elv8/ExerciseDemo";
import type { Discipline } from "@/lib/types";

export function WorkoutView({ workout, discipline }: { workout: Workout; discipline?: Discipline }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-accent-lime">
          {workout.restDay ? "Rest Day" : `Workout · ${workout.durationMin} min`}
        </span>
        <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {workout.focus}
        </span>
      </div>
      <h3 className="mt-3 font-display text-2xl font-700 text-foreground">{workout.title}</h3>
      {workout.why && (
        <p className="mt-2 text-sm italic text-foreground/75">Why: {workout.why}</p>
      )}
      {!workout.restDay && workout.restProtocol && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent-lime/40 bg-accent-lime/10 px-3 py-1 font-sans text-[10px] font-700 uppercase tracking-[0.18em] text-accent-lime">
          <span aria-hidden>⏱</span>
          {workout.restProtocol}
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {workout.exercises.map((ex, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-[3px] w-5 flex-none rounded-full bg-accent-lime/80" />
            <div>
              <div className="font-600 text-foreground">
                <span className="align-middle">{ex.name}</span>
                <ExerciseDemoButton name={ex.name} discipline={discipline} instructions={ex.instructions} />
              </div>
              <div className="text-sm text-foreground/85">{ex.detail}</div>
              {ex.cue && <div className="text-xs text-muted-foreground">· {ex.cue}</div>}
            </div>
          </li>
        ))}
      </ul>

      {workout.activity && (
        <div className="mt-5 rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Daily activity · <span className="text-foreground/80">{workout.activity}</span>
        </div>
      )}
    </article>
  );
}
