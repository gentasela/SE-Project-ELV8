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
