export type Discipline =
  | "yoga"
  | "pilates"
  | "bodyweight"
  | "beginnerStrength"
  | "fatLoss"
  | "homeNoEquip"
  | "powerbuilding"
  | "cardioHiit";

export type Level = "beginner" | "intermediate" | "advanced";
export type Goal = "lose" | "gain";
export type Sex = "female" | "male" | "other";
export type Variant = 1 | 2 | 3;
export const VARIANTS: Variant[] = [1, 2, 3];

export interface UserProfile {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sex: Sex;
  discipline: Discipline;
  level: Level;
  goal: Goal;
  createdAt: number;
  remindersEnabled?: boolean;
}

export interface Exercise {
  name: string;
  detail: string;
  cue?: string;
  instructions?: Partial<Record<"setup" | "execution" | "safety" | "grip" | "warning", string>>;
}

export interface Workout {
  title: string;
  focus: string;
  durationMin: number;
  why: string;            // brief rationale for the day's session
  restProtocol?: string;  // global rest-between-sets note for the session
  exercises: Exercise[];
  restDay?: boolean;
  activity?: string;      // optional non-workout activity (walks, mobility)
}

export interface Meal {
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  title: string;
  kcal: number;
  ingredients: string[];
  steps: string[];
  macros: { protein: number; carbs: number; fat: number; calories: number };
}

/** A meal slot with two interchangeable recipe options (A and B). */
export interface MealSlot {
  slot: Meal["slot"];
  options: [Meal, Meal];
}

export interface ProgramDay {
  dayInProgram: number;   // 1..30
  weekIndex: number;      // 1..4 (week 4 = days 22-30 incl. final 2 deload days)
  weekdayLabel: string;   // "Mon"..."Sun"
  workout: Workout;
  meals: MealSlot[];
  targetKcal: number;
}

export interface MonthlyPlan {
  generatedAt: number;
  startDate: string;      // ISO yyyy-mm-dd of day 1
  userId: string;
  targetKcal: number;
  variant: Variant;       // 1, 2 or 3
  discipline: Discipline;
  level: Level;
  goal: Goal;
  days: ProgramDay[];     // length 30
}

export interface ProgressLog {
  workoutDone: boolean;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean; snack: boolean };
}

export const DISCIPLINES: { id: Discipline; label: string; blurb: string }[] = [
  { id: "yoga", label: "Yoga", blurb: "Breath-led flows, balance and mobility." },
  { id: "pilates", label: "Pilates", blurb: "Core control, alignment and precision." },
  { id: "bodyweight", label: "Bodyweight", blurb: "Calisthenics strength, no gear." },
  { id: "beginnerStrength", label: "Beginner Strength", blurb: "Foundational lifts and patterns." },
  { id: "fatLoss", label: "Fat-Loss", blurb: "Metabolic circuits and conditioning." },
  { id: "homeNoEquip", label: "Home · No Equipment", blurb: "Anywhere routines, zero gear." },
  { id: "powerbuilding", label: "Powerbuilding", blurb: "Compound lifts for strength and size." },
  { id: "cardioHiit", label: "Cardio & HIIT", blurb: "High-intensity circuits for endurance and heart health." },
];

export const LEVELS: { id: Level; label: string; tagline: string }[] = [
  { id: "beginner", label: "Beginner", tagline: "Foundation track" },
  { id: "intermediate", label: "Intermediate", tagline: "Strength & flow" },
  { id: "advanced", label: "Advanced", tagline: "Mastery track" },
];
