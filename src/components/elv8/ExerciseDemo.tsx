import { useEffect, useMemo, useState } from "react";
import type { Discipline } from "@/lib/types";

type MovementPattern = "Push" | "Pull" | "Legs" | "Core";

type InstructionKey = "setup" | "execution" | "safety" | "grip" | "warning";
type ExerciseInstructions = Partial<Record<InstructionKey, string>>;

type DemoMeta = {
  pattern: MovementPattern;
  instructions: ExerciseInstructions;
};

const KEYWORDS = {
  push: ["push", "push-up", "pushup", "press", "bench", "chest", "overhead", "shoulder", "dip"],
  pull: ["row", "pull", "pulldown", "pull-up", "pullup", "chin", "curl", "pullover"],
  legs: ["squat", "lunge", "deadlift", "rdl", "hinge", "bridge", "thrust", "step", "goblet", "hamstring", "glute", "wall sit"],
  core: ["plank", "crunch", "sit", "twist", "leg raise", "hollow", "mountain climber", "climber", "burpee", "bear", "boat"],
};

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/^[a-z]{1,2}[\s:.\-]+/i, "")
    .replace(/\d+\s*(x|×|reps?|sets?|sec|s|min|m|rounds?)\b/gi, "")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function patternFor(name: string): MovementPattern {
  const n = sanitize(name);
  if (includesAny(n, KEYWORDS.push)) return "Push";
  if (includesAny(n, KEYWORDS.pull)) return "Pull";
  if (includesAny(n, KEYWORDS.legs)) return "Legs";
  if (includesAny(n, KEYWORDS.core)) return "Core";
  return "Core";
}

function instructionCopyFor(name: string, pattern: MovementPattern): ExerciseInstructions {
  const n = sanitize(name);

  if (includesAny(n, ["mountain climber", "climber"])) {
    return {
      setup: "Get into a high plank with your body parallel to the floor.",
      execution: "Pull one knee toward your chest using your thighs, without jumping.",
      safety: "Keep your gaze on the floor to maintain a neutral spine.",
      grip: "Press palms firmly into the ground to stabilize your shoulders.",
      warning: "Do not let your lower back arch or your hips sag.",
    };
  }

  if (includesAny(n, ["bench", "chest press"])) {
    return {
      setup: "Plant feet firmly and lock shoulder blades into the bench.",
      execution: "Lower to mid-chest, then press up smoothly.",
      safety: "Keep elbows tucked at 45 degrees to protect shoulders.",
      grip: "Wrap thumbs fully and keep wrists stacked over elbows.",
      warning: "Do not bounce the bar or flare elbows wide under load.",
    };
  }

  if (includesAny(n, ["squat", "goblet", "wall sit"])) {
    return {
      setup: "Brace ribs down and set feet hip-width.",
      execution: "Sit between hips, then drive through the full foot.",
      safety: "Keep knees tracking over toes and spine tall.",
      grip: "Grip the bar, bell, or floor with steady full-hand tension.",
      warning: "Do not let knees collapse inward or heels lift.",
    };
  }

  if (includesAny(n, ["deadlift", "rdl", "hinge"])) {
    return {
      setup: "Hinge hips back and brace before touching the load.",
      execution: "Drive the floor away and keep weight close.",
      safety: "Keep lats tight and never round your back.",
      grip: "Grip evenly with locked wrists and crush the handle.",
      warning: "Do not yank from the floor or let the load drift forward.",
    };
  }

  if (includesAny(n, ["row", "pulldown", "pull-up", "pullup", "chin"])) {
    return {
      setup: "Set a long spine and pull shoulders down.",
      execution: "Drive elbows back, pause, then return slowly.",
      safety: "Keep neck relaxed and avoid shrugging under fatigue.",
      grip: "Grip firmly with straight wrists and even pressure.",
      warning: "Do not swing your torso or crank your neck forward.",
    };
  }

  if (includesAny(n, ["overhead", "shoulder press", "press"])) {
    return {
      setup: "Stand tall with elbows under the load.",
      execution: "Press straight overhead, then lower with control.",
      safety: "Squeeze glutes and ribs down to protect your back.",
      grip: "Keep knuckles up with wrists stacked over elbows.",
      warning: "Do not lean back or press the bar forward.",
    };
  }

  if (pattern === "Legs") {
    return {
      setup: "Plant feet, brace hard, and stand tall.",
      execution: "Control the descent, then drive through your foot.",
      safety: "Stop if knees twist or balance breaks.",
      grip: "Hold the load close with wrists straight and active.",
      warning: "Do not rush reps or let joints cave inward.",
    };
  }

  if (pattern === "Push") {
    return {
      setup: "Stack wrists, brace ribs, and set shoulders down.",
      execution: "Lower with control, then press through evenly.",
      safety: "Keep shoulders back and elbows controlled.",
      grip: "Grip tight with neutral wrists and full thumb contact.",
      warning: "Do not flare elbows or collapse through the chest.",
    };
  }

  if (pattern === "Pull") {
    return {
      setup: "Set shoulder blades and keep ribs quiet.",
      execution: "Pull with elbows, squeeze, then return slowly.",
      safety: "Avoid shrugging or swinging your torso.",
      grip: "Grip securely and keep wrists straight through every rep.",
      warning: "Do not jerk the weight or lose shoulder control.",
    };
  }

  return {
    setup: "Brace ribs and lock your pelvis before moving.",
    execution: "Move slowly and keep your trunk stable.",
    safety: "Stop immediately if your back arches or joints pinch.",
    grip: "Press or grip firmly with straight wrists and steady tension.",
    warning: "Do not chase speed at the expense of control.",
  };
}

function metaFor(name: string, discipline?: Discipline, instructions?: ExerciseInstructions): DemoMeta {
  const pattern = patternFor(name);
  const fallback = instructionCopyFor(name, pattern);
  return {
    pattern,
    instructions: { ...fallback, ...instructions },
  };
}

export function ExerciseDemoButton({ name, discipline, instructions }: { name: string; discipline?: Discipline; instructions?: ExerciseInstructions }) {
  const [open, setOpen] = useState(false);
  const meta = useMemo(() => metaFor(name, discipline, instructions), [name, discipline, instructions]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open exercise details for ${name}`}
        title="Exercise details"
        className="ml-1.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-lime/15 text-accent-lime align-middle transition hover:bg-accent-lime hover:text-accent-lime-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
      >
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden>
          <polygon points="6,4 20,12 6,20" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} exercise details`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/75 px-0 backdrop-blur-md sm:items-center sm:px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-surface/90 text-foreground shadow-2xl backdrop-blur-xl animate-[elv8-sheet-up_260ms_cubic-bezier(.2,.8,.2,1)] sm:rounded-3xl"
          >
            <style>{KEYFRAMES}</style>
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close exercise details"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground backdrop-blur transition hover:bg-surface-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>

            <div className="overflow-y-auto px-5 pb-6 pt-6 sm:px-6">
              <div className="pr-12">
                <h3 className="mt-2 font-sans text-2xl font-900 text-foreground">{name}</h3>
              </div>

              <MovementExecutionPanel meta={meta} name={name} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MovementExecutionPanel({ meta }: { meta: DemoMeta; name: string }) {
  const sections: Array<{ key: InstructionKey; label: string; tone: "brand" | "warning" }> = [
    { key: "setup", label: "SETUP", tone: "brand" },
    { key: "execution", label: "EXECUTION", tone: "brand" },
    { key: "safety", label: "SAFETY", tone: "brand" },
    { key: "grip", label: "GRIP", tone: "brand" },
    { key: "warning", label: "WARNING", tone: "warning" },
  ];

  return (
    <section className="mt-9">
      <div className="space-y-9">
        {sections.map(({ key, label, tone }) => {
          const text = meta.instructions[key];
          if (!text) return null;
          return <CueLine key={key} label={label} text={text} tone={tone} />;
        })}
      </div>
    </section>
  );
}

function CueLine({ label, text, tone }: { label: string; text: string; tone: "brand" | "warning" }) {
  const isWarning = tone === "warning";
  return (
    <div className="text-left">
      <span className={["font-sans text-xs font-900 uppercase tracking-[0.18em]", isWarning ? "text-destructive" : "text-accent-lime"].join(" ")}>{label}</span>
      <p className="mt-3 font-sans text-[15px] font-600 leading-7 text-foreground sm:text-base">{text}</p>
    </div>
  );
}

const KEYFRAMES = `
@keyframes elv8-sheet-up { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
`;
