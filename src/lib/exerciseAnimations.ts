export type ExercisePerspective = "Side View" | "Front View" | "Three-Quarter View";

export type ExerciseAnimationAsset = {
  gifUrl: string;
  perspective: ExercisePerspective;
};

const EXERCISE_DB_BASE = "https://v2.exercisedb.io/image";

const ANIMATION_LIBRARY: Array<{
  terms: string[];
  asset: ExerciseAnimationAsset;
}> = [
  { terms: ["squat", "goblet", "wall sit"], asset: { gifUrl: `${EXERCISE_DB_BASE}/JgH2q70`, perspective: "Side View" } },
  { terms: ["lunge", "step", "split squat"], asset: { gifUrl: `${EXERCISE_DB_BASE}/2YEH8yX`, perspective: "Side View" } },
  { terms: ["deadlift", "rdl", "hinge"], asset: { gifUrl: `${EXERCISE_DB_BASE}/wT-L0rS`, perspective: "Side View" } },
  { terms: ["bench", "push-up", "pushup", "chest press"], asset: { gifUrl: `${EXERCISE_DB_BASE}/QEXmYtA`, perspective: "Three-Quarter View" } },
  { terms: ["overhead", "shoulder press", "press"], asset: { gifUrl: `${EXERCISE_DB_BASE}/EElI01T`, perspective: "Front View" } },
  { terms: ["row", "pulldown", "pull-up", "pullup", "chin"], asset: { gifUrl: `${EXERCISE_DB_BASE}/L9dxBuz`, perspective: "Three-Quarter View" } },
  { terms: ["curl"], asset: { gifUrl: `${EXERCISE_DB_BASE}/D0pWpL7`, perspective: "Front View" } },
  { terms: ["plank", "mountain climber", "climber"], asset: { gifUrl: `${EXERCISE_DB_BASE}/N2Ke1uS`, perspective: "Side View" } },
  { terms: ["crunch", "sit", "hollow", "leg raise"], asset: { gifUrl: `${EXERCISE_DB_BASE}/P4RzS33`, perspective: "Side View" } },
  { terms: ["burpee", "jumping jack", "skater", "sprint"], asset: { gifUrl: `${EXERCISE_DB_BASE}/NTYRIaE`, perspective: "Side View" } },
  { terms: ["bridge", "thrust", "glute"], asset: { gifUrl: `${EXERCISE_DB_BASE}/u8Zw3Oa`, perspective: "Side View" } },
];

function sanitizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^[a-z]{1,2}[\s:.\-]+/i, "")
    .replace(/\d+\s*(x|×|reps?|sets?|sec|s|min|m|rounds?)\b/gi, "")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveExerciseAnimation(name: string): ExerciseAnimationAsset {
  const normalized = sanitizeExerciseName(name);
  return (
    ANIMATION_LIBRARY.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.asset ?? {
      gifUrl: `${EXERCISE_DB_BASE}/4FzZvYD`,
      perspective: "Three-Quarter View",
    }
  );
}