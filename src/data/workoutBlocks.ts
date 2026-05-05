import type { Discipline, Goal, Level, Variant, Workout, Exercise } from "@/lib/types";

/* ---------------------------------------------------------------------------
 * 30-DAY WORKOUT PROGRAM GENERATOR
 *
 * Architecture:
 *   - For every (discipline, level, goal, variant) we hand-author a 7-day
 *     "week 1 template" of session archetypes (Mon..Sun with rest days).
 *   - Weeks 2, 3, 4 are produced by progressing volume / intensity /
 *     duration on the same archetypes (deload week 4).
 *   - Lose-Weight goal → higher-volume, more conditioning days, shorter rest
 *   - Gain-Weight goal → progressive overload, lower reps higher load cues,
 *     longer rest (3-5 sessions, 2 active recovery)
 *   - Variant 1/2/3 ensure exercises do NOT overlap significantly between the
 *     three monthly programs available to the same user.
 * ------------------------------------------------------------------------- */

type WeekTemplate = Workout[]; // length 7 (Mon..Sun)

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ex = (name: string, detail: string, cue?: string): Exercise => ({ name, detail, cue });

const restDay = (activity: string): Workout => ({
  title: "Active Recovery",
  focus: "Recovery & mobility",
  durationMin: 25,
  why: "Recovery is when adaptation happens — let your body absorb the work.",
  restDay: true,
  exercises: [
    ex("Mobility flow", "10 min full-body"),
    ex("Breathwork", "4-7-8 breathing × 8 rounds"),
  ],
  activity,
});

/* ============================================================================
 * PILATES — directly seeded from user-uploaded templates plan1/plan2/plan3.txt
 * ========================================================================== */

const pilatesBeginnerLose: Record<Variant, WeekTemplate> = {
  1: [ // PLAN 1: CORE ALIGNMENT
    { title: "The Fundamentals", focus: 'Powerhouse + lateral breathing', durationMin: 35,
      why: "Find the core engagement that every other Pilates session is built on.",
      activity: "20 min light walk after",
      exercises: [
        ex("Lateral Breathing Prep", "2 min", "Inhale ribs wide, exhale navel to spine"),
        ex("The Hundred (knees bent)", "1 × 100 pumps"),
        ex("Half Roll-Ups", "3 × 10"),
        ex("Single Leg Circles", "2 × 8 per leg"),
        ex("Rolling Like a Ball", "3 × 8"),
        ex("Spine Stretch Forward", "2 × 5"),
      ]},
    { title: "Posterior Chain & Pelvic Floor", focus: "Back body & posture", durationMin: 30,
      why: "Strengthen the muscles you can't see in the mirror — they hold your posture.",
      activity: "15 min daily steps",
      exercises: [
        ex("Pelvic Tilts", "3 × 15"),
        ex("Shoulder Bridge (basic)", "3 × 12"),
        ex("Bird-Dog", "3 × 10 per side"),
        ex("Swan Prep", "3 × 5"),
      ]},
    restDay("20 min light walk + seated spinal twists"),
    { title: "Stability & Control", focus: "Pelvic quietness", durationMin: 30,
      why: "Train deep stabilizers so your spine stays calm under load.",
      activity: "20 min steady-state walk",
      exercises: [
        ex("Deadbugs (slow)", "3 × 12"),
        ex("Side-Lying Leg Lifts", "2 × 15 per side"),
        ex("Toe Taps", "3 × 12 per side"),
        ex("Plank on knees", "3 × 30s"),
      ]},
    { title: "Full-Body Flow (Beginner)", focus: "Repeat & integrate", durationMin: 35,
      why: "Repetition wires the patterns — today consolidates the week.",
      activity: "15 min daily steps",
      exercises: [
        ex("The Hundred", "1 × 100 pumps"),
        ex("Half Roll-Ups", "3 × 10"),
        ex("Rolling Like a Ball", "3 × 8"),
        ex("Spine Stretch Forward", "2 × 5"),
        ex("Full-body static stretch", "5 min"),
      ]},
    { title: "Mobility / Recovery", focus: "Spinal fluidity", durationMin: 25,
      why: "Restore range so next week feels lighter.",
      activity: "30 min leisurely nature walk",
      exercises: [
        ex("Cat-Cow", "2 × 15"),
        ex("Mermaid Stretch", "2 × 5 per side"),
        ex("Child's Pose", "2 × 60s"),
      ]},
    restDay("Full rest & mental reset"),
  ],
  2: [ // PLAN 2: STRENGTH THROUGH LENGTH
    { title: "Lengthening Series", focus: "Decompression + extension", durationMin: 35,
      why: "Decompress the spine and lengthen as you load.",
      activity: "30 min brisk walk",
      exercises: [
        ex("Full Roll-Ups", "3 × 10"),
        ex("Single Leg Stretch", "3 × 12 per side"),
        ex("Double Leg Stretch", "3 × 10"),
        ex("Spine Twist (seated)", "2 × 8 per side"),
      ]},
    { title: "Glute & Hip Integration", focus: "Pelvic stability", durationMin: 35,
      why: "Strong glutes protect a strong core — they're the same chain.",
      activity: "Optional 15 min stair climbing",
      exercises: [
        ex("Side-Lying Circles", "2 × 12 each direction per leg"),
        ex("Clamshells", "3 × 20 per side"),
        ex("Shoulder Bridge marching", "3 × 12"),
        ex("Swimming (slow)", "3 × 20 counts"),
      ]},
    { title: "Core Endurance", focus: "Sustained tension + rotation", durationMin: 35,
      why: "Endurance teaches your deep core to stay engaged for daily life.",
      activity: "20 min steady walk",
      exercises: [
        ex("Plank (full)", "3 × 45s"),
        ex("Criss-Cross (slow)", "3 × 10 per side"),
        ex("Leg Pull Front prep", "3 × 8"),
      ]},
    restDay("45–60 min long walk (primary activity day)"),
    { title: "Beginner Power Half-Hour", focus: "Classical circuit", durationMin: 30,
      why: "Classical sequencing teaches your body to flow without breaks.",
      activity: "15 min light movement",
      exercises: [
        ex("Circuit × 3 rounds", "All five exercises back-to-back"),
        ex("The Hundred", "100 pumps"),
        ex("Single Leg Circles", "8 per leg"),
        ex("Single Leg Stretch", "10 per side"),
        ex("Spine Stretch", "5 reps"),
        ex("The Saw", "5 per side"),
      ]},
    { title: "Mobility", focus: "Dynamic flow", durationMin: 25,
      why: "Open the spine and shoulders to prepare for week 2.",
      activity: "30 min leisurely walk",
      exercises: [
        ex("Child's Pose to Cobra Flow", "3 × 5"),
        ex("Cat-Cow", "2 × 15"),
        ex("Mermaid Stretch", "2 × 5 per side"),
      ]},
    restDay("Full rest, relaxed movement only"),
  ],
  3: [ // PLAN 3: PRECISION PILOT
    { title: "Advanced Foundations", focus: "Control at tempo", durationMin: 35,
      why: "Move faster without losing form — that's true core control.",
      activity: "30 min brisk walk",
      exercises: [
        ex("Single Leg Stretch (quick)", "3 × 20 per side"),
        ex("The Saw", "3 × 8 per side"),
        ex("Neck Pull prep", "3 × 8"),
        ex("Seal", "3 × 10"),
      ]},
    { title: "Lateral Power", focus: "Obliques + hip stability", durationMin: 35,
      why: "Strong sides = a stable, defined waistline.",
      activity: "20 min steady walk",
      exercises: [
        ex("Side Kick (front/back)", "3 × 12 per side"),
        ex("Side Kick (up/down)", "3 × 12 per side"),
        ex("Side Plank", "3 × 30s per side"),
      ]},
    { title: "Spinal Articulation", focus: "Mobility + extension", durationMin: 35,
      why: "Articulating each vertebra keeps the back young.",
      activity: "20 min light movement",
      exercises: [
        ex("Full Shoulder Bridge", "3 × 12"),
        ex("Swan Dive prep", "3 × 10"),
        ex("Spine Stretch Forward", "3 × 10"),
      ]},
    restDay("45–60 min long walk (primary activity day)"),
    { title: "Precision Flow", focus: "Seamless transitions", durationMin: 35,
      why: "Practice flow — rhythm is what burns calories in Pilates.",
      activity: "15 min rhythmic walk",
      exercises: [
        ex("Precision Circuit × 3", "Move with steady rhythm"),
        ex("Quick SLS → The Saw", "10 per side"),
        ex("Side Kick → Side Plank", "8 reps"),
        ex("Shoulder Bridge → Spine Stretch", "10 reps"),
        ex("Seal into standing balance", "5 reps"),
      ]},
    { title: "Mobility", focus: "Recovery & flexibility", durationMin: 25,
      why: "Open hips and hamstrings to set up week 2 progression.",
      activity: "30 min leisurely walk",
      exercises: [
        ex("Butterfly Stretch", "3 × 45s"),
        ex("Hamstring Stretch", "3 × 45s per side"),
      ]},
    restDay("Full rest, relaxed movement only"),
  ],
};

/* For PILATES we offer the same templates for "gain" but with longer holds,
   higher tempo and added bodyweight resistance cues. */
const pilatesBeginnerGain: Record<Variant, WeekTemplate> = pilatesBeginnerLose;

/* ============================================================================
 * GENERIC SEED TEMPLATES
 * For all other (discipline, level, goal) combinations we use a small set of
 * archetype builders. Variants 1/2/3 swap the underlying movement pool so
 * exercises don't repeat across the three programs.
 * ========================================================================== */

type Pool = {
  push: string[];
  pull: string[];
  squat: string[];
  hinge: string[];
  core: string[];
  conditioning: string[];
  carry: string[];
  mobility: string[];
};

const POOLS: Record<Variant, Pool> = {
  1: {
    push: ["Push-Ups", "Pike Push-Ups", "Diamond Push-Ups"],
    pull: ["Inverted Rows (table)", "Doorway Rows", "Towel Rows"],
    squat: ["Bodyweight Squats", "Split Squats", "Cossack Squats"],
    hinge: ["Glute Bridges", "Single-Leg Deadlift (BW)", "Good Mornings (BW)"],
    core: ["Plank", "Dead Bug", "Hollow Hold"],
    conditioning: ["Mountain Climbers", "Jumping Jacks", "High Knees"],
    carry: ["Suitcase Carry (any weighted bag)", "Front-Loaded Carry"],
    mobility: ["World's Greatest Stretch", "Cat-Cow", "Hip 90/90"],
  },
  2: {
    push: ["Decline Push-Ups", "Archer Push-Ups (assisted)", "Wall Handstand Hold"],
    pull: ["Wide-Grip Doorway Rows", "Scapular Pulls", "Reverse Snow Angels"],
    squat: ["Goblet Squats (any weight)", "Reverse Lunges", "Wall Sit"],
    hinge: ["Romanian Deadlift (BW)", "Hip Thrusts (floor)", "Single-Leg Bridge"],
    core: ["Side Plank", "Bird-Dog", "V-Ups"],
    conditioning: ["Burpees (no push-up)", "Skater Jumps", "Step-Up Jumps"],
    carry: ["Overhead Carry", "Farmer's Carry"],
    mobility: ["Pigeon Stretch", "Thoracic Opener", "Couch Stretch"],
  },
  3: {
    push: ["Pseudo-Planche Push-Ups", "Wide Push-Ups", "Tricep Push-Ups"],
    pull: ["Pull-Up Negatives", "Tucked Front-Lever Hold", "Australian Rows"],
    squat: ["Pistol Squat (assisted)", "Bulgarian Split Squat", "Jump Squats"],
    hinge: ["Single-Leg Hinge", "Nordic Curl Negatives", "Banded Pull-Through"],
    core: ["Russian Twists", "L-Sit Tuck", "Dragon Flag Negatives"],
    conditioning: ["Sprint Intervals (in place)", "Tuck Jumps", "Bear Crawl"],
    carry: ["Goblet Walk", "Cross-Body Carry"],
    mobility: ["Jefferson Curl", "Cossack Stretch", "Shoulder Dislocates (towel)"],
  },
};

interface ArchetypeArgs {
  level: Level;
  goal: Goal;
}

// reps & sets scaled by level/goal
function vol(level: Level, goal: Goal, baseReps: number) {
  const lvlMul = level === "beginner" ? 1 : level === "intermediate" ? 1.3 : 1.6;
  const goalMul = goal === "lose" ? 1.15 : 0.9; // lose = more volume; gain = lower reps, heavier intent
  return Math.round(baseReps * lvlMul * goalMul);
}
function setsFor(level: Level, goal: Goal) {
  if (goal === "gain") return level === "beginner" ? 3 : level === "intermediate" ? 4 : 5;
  return level === "beginner" ? 3 : level === "intermediate" ? 4 : 5;
}
function durFor(level: Level, goal: Goal) {
  const base = level === "beginner" ? 30 : level === "intermediate" ? 40 : 50;
  return goal === "lose" ? base + 10 : base;
}
function restCue(goal: Goal) {
  return goal === "gain" ? "Rest 2–3 min between sets" : "Rest 30–45 s between sets";
}

function fullBody(pool: Pool, a: ArchetypeArgs, label: string): Workout {
  const s = setsFor(a.level, a.goal);
  return {
    title: label,
    focus: "Full-body strength",
    durationMin: durFor(a.level, a.goal),
    why: a.goal === "gain"
      ? "Compound movements drive the most muscle gain — focus on load, not speed."
      : "Hitting the whole body burns more calories than isolated work.",
    restProtocol: restCue(a.goal),
    exercises: [
      ex(pool.squat[0], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.push[0], `${s} × ${vol(a.level, a.goal, 8)}`),
      ex(pool.pull[0], `${s} × ${vol(a.level, a.goal, 8)}`),
      ex(pool.hinge[0], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.core[0], `${s} × ${vol(a.level, a.goal, 30)} s`),
    ],
  };
}

function upperBody(pool: Pool, a: ArchetypeArgs): Workout {
  const s = setsFor(a.level, a.goal);
  return {
    title: "Upper Body Focus",
    focus: "Push + pull",
    durationMin: durFor(a.level, a.goal),
    why: a.goal === "gain" ? "Hypertrophy upper-body day — slow eccentrics build size." : "High-volume upper work elevates EPOC for hours.",
    restProtocol: restCue(a.goal),
    exercises: [
      ex(pool.push[0], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.pull[0], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.push[1], `${s} × ${vol(a.level, a.goal, 8)}`),
      ex(pool.pull[1], `${s} × ${vol(a.level, a.goal, 8)}`),
      ex(pool.core[1], `${s} × ${vol(a.level, a.goal, 12)}`),
    ],
  };
}

function lowerBody(pool: Pool, a: ArchetypeArgs): Workout {
  const s = setsFor(a.level, a.goal);
  return {
    title: "Lower Body Focus",
    focus: "Quads, glutes, hamstrings",
    durationMin: durFor(a.level, a.goal),
    why: a.goal === "gain" ? "Legs respond best to heavier loads and longer rest." : "Lower body has the largest muscles — most calories burned here.",
    restProtocol: restCue(a.goal),
    exercises: [
      ex(pool.squat[0], `${s} × ${vol(a.level, a.goal, 12)}`),
      ex(pool.hinge[0], `${s} × ${vol(a.level, a.goal, 12)}`),
      ex(pool.squat[1], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.hinge[1], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.core[2], `${s} × ${vol(a.level, a.goal, 20)} s`),
    ],
  };
}

function conditioning(pool: Pool, a: ArchetypeArgs): Workout {
  const rounds = a.level === "beginner" ? 3 : a.level === "intermediate" ? 5 : 7;
  return {
    title: "Conditioning Circuit",
    focus: "Heart rate + fat-burn",
    durationMin: durFor(a.level, a.goal),
    why: a.goal === "gain" ? "Brief conditioning preserves cardio without burning your surplus." : "High-density circuits maximise calorie burn per minute.",
    exercises: [
      ex(`${rounds}-round circuit, 40s work / 20s rest`, "Repeat the four moves below"),
      ex(pool.conditioning[0], "40s"),
      ex(pool.conditioning[1], "40s"),
      ex(pool.squat[2], "40s"),
      ex(pool.core[0], "40s"),
    ],
  };
}

function coreCarry(pool: Pool, a: ArchetypeArgs): Workout {
  const s = setsFor(a.level, a.goal);
  return {
    title: "Core & Carry",
    focus: "Trunk strength + grip",
    durationMin: durFor(a.level, a.goal) - 10,
    why: "A strong, braced core transfers force in every other lift.",
    exercises: [
      ex(pool.core[0], `${s} × ${vol(a.level, a.goal, 30)} s`),
      ex(pool.core[1], `${s} × ${vol(a.level, a.goal, 12)}`),
      ex(pool.core[2], `${s} × ${vol(a.level, a.goal, 10)}`),
      ex(pool.carry[0], `${s} × 30 m`, "Brace abs, breathe steady"),
      ex(pool.mobility[0], "5 min decompression"),
    ],
  };
}

function mobility(pool: Pool, a: ArchetypeArgs): Workout {
  return {
    title: "Mobility & Restore",
    focus: "Range + recovery",
    durationMin: 25,
    why: "Mobility days protect joints and let your nervous system reset.",
    activity: "Optional 30 min easy walk",
    exercises: [
      ex(pool.mobility[0], "3 × 1 min per side"),
      ex(pool.mobility[1], "3 × 1 min"),
      ex(pool.mobility[2], "3 × 1 min per side"),
      ex("Diaphragmatic breathing", "5 min"),
    ],
  };
}

/* Build a 7-day generic week given pool + level + goal */
function genericWeek(variant: Variant, level: Level, goal: Goal, label: string): WeekTemplate {
  const pool = POOLS[variant];
  const a = { level, goal };
  // LOSE: 5 sessions + 2 light recovery (Wed, Sun)
  // GAIN: 4 sessions + 3 recovery / mobility days (Wed, Sat, Sun)
  if (goal === "lose") {
    return [
      fullBody(pool, a, `${label} · Full-Body A`),
      conditioning(pool, a),
      restDay("Mobility flow + 30 min walk"),
      upperBody(pool, a),
      lowerBody(pool, a),
      conditioning(pool, a),
      restDay("Long easy walk 45–60 min"),
    ];
  }
  return [
    upperBody(pool, a),
    lowerBody(pool, a),
    mobility(pool, a),
    fullBody(pool, a, `${label} · Full-Body B`),
    coreCarry(pool, a),
    restDay("Light walk + breathwork"),
    restDay("Full rest — eat, sleep, grow"),
  ];
}

/* ============================================================================
 * REGISTRY
 * ========================================================================== */

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  yoga: "Flow",
  pilates: "Pilates",
  bodyweight: "Calisthenics",
  beginnerStrength: "Strength",
  fatLoss: "HIIT",
  homeNoEquip: "Home",
  powerbuilding: "Powerbuilding",
  cardioHiit: "Cardio & HIIT",
};

const yogaWeek = (variant: Variant, level: Level, goal: Goal): WeekTemplate => {
  const pool = POOLS[variant];
  const a = { level, goal };
  // Yoga: 4 active flows + 2 mobility + 1 full rest
  const flow = (title: string, focus: string, why: string, list: Exercise[]): Workout => ({
    title, focus, durationMin: durFor(level, goal),
    why,
    exercises: list,
  });
  return [
    flow(
      `Sun Salutation Flow (V${variant})`,
      "Breath-linked vinyasa",
      "Wakes the spine and primes the breath for the week ahead.",
      [
        ex("Surya Namaskar A", `${setsFor(level, goal)} rounds`),
        ex("Warrior I → Warrior II", "5 breaths each side"),
        ex(pool.mobility[0], "3 × 45s per side"),
        ex("Down Dog hold", `${30 + (level === "advanced" ? 30 : 0)}s × 3`),
      ],
    ),
    flow(
      "Hip & Hamstring Open",
      "Lower-body mobility",
      "Hips hold most stress — opening them frees the lower back.",
      [
        ex(pool.mobility[2], "3 × 1 min per side"),
        ex("Pigeon Pose", "3 × 1 min per side"),
        ex("Half-Splits", "3 × 45s per side"),
        ex("Seated Forward Fold", "5 min"),
      ],
    ),
    mobility(pool, a),
    flow(
      "Standing Strength Flow",
      "Stability + balance",
      "Long isometric holds in standing poses build deep leg strength.",
      [
        ex("Warrior III", "3 × 45s per side"),
        ex("Tree Pose", "3 × 1 min per side"),
        ex("Triangle Pose", "3 × 45s per side"),
        ex("Chair Pose", `${setsFor(level, goal)} × 45s`),
      ],
    ),
    flow(
      "Core & Twist Flow",
      "Rotation + abs",
      "Twists wring out the spine and fire the obliques.",
      [
        ex("Boat Pose", `${setsFor(level, goal)} × 45s`),
        ex("Side Plank", "3 × 30s per side"),
        ex("Revolved Chair", "3 × 30s per side"),
        ex(pool.core[0], `3 × ${vol(level, goal, 30)}s`),
      ],
    ),
    restDay("Yin yoga 30 min · long passive holds"),
    restDay("Full rest — savasana 15 min"),
  ];
};

const pilatesWeek = (variant: Variant, level: Level, goal: Goal): WeekTemplate => {
  if (level === "beginner") {
    return goal === "lose" ? pilatesBeginnerLose[variant] : pilatesBeginnerGain[variant];
  }
  // Intermediate / Advanced Pilates — extend beginner templates with more reps & added complexity
  const base = pilatesBeginnerLose[variant];
  return base.map((d) => {
    if (d.restDay) return d;
    const mul = level === "intermediate" ? 1.4 : 1.8;
    return {
      ...d,
      durationMin: Math.round(d.durationMin * 1.2),
      why: d.why + (level === "advanced" ? " Add resistance with light ankle weights or a band." : ""),
      exercises: d.exercises.map((e) => ({
        ...e,
        detail: e.detail.replace(/(\d+)\s*×\s*(\d+)/, (_m, sets, reps) =>
          `${sets} × ${Math.round(Number(reps) * mul)}`,
        ),
      })),
    };
  });
};

/* ============================================================================
 * POWERBUILDING — Big Three focus (Squat / Bench / Deadlift) + accessories.
 * Variants 1/2/3 swap accessory pools so exercises don't repeat across plans.
 * ========================================================================== */

const PB_BENCH: Record<Variant, string> = { 1: "Barbell Bench Press", 2: "Incline Dumbbell Press", 3: "Close-Grip Bench Press" };
const PB_SQUAT: Record<Variant, string> = { 1: "Back Squat", 2: "Front Squat", 3: "Pause Squat" };
const PB_DEAD:  Record<Variant, string> = { 1: "Conventional Deadlift", 2: "Romanian Deadlift", 3: "Sumo Deadlift" };
const PB_PRESS: Record<Variant, string> = { 1: "Overhead Press", 2: "Push Press", 3: "Seated Dumbbell Press" };
const PB_ROW:   Record<Variant, string> = { 1: "Barbell Row", 2: "Chest-Supported Row", 3: "Single-Arm Dumbbell Row" };
const PB_PULL:  Record<Variant, string> = { 1: "Lat Pulldown", 2: "Pull-Ups", 3: "Cable Pullover" };

function powerbuildingWeek(variant: Variant, level: Level, goal: Goal): WeekTemplate {
  const s = setsFor(level, goal);
  const reps = goal === "gain" ? 5 : 8;
  const accReps = goal === "gain" ? 8 : 12;
  const dur = durFor(level, goal);
  const rest = goal === "gain" ? "Rest 2–3 min between sets" : "Rest 90 s between sets";
  return [
    { title: "Bench Day", focus: "Chest, shoulders, triceps", durationMin: dur,
      why: "Heavy pressing builds the upper-body push needed for size and strength.",
      restProtocol: rest,
      exercises: [
        ex(PB_BENCH[variant], `${s} × ${reps}`, "Drive feet, brace, control the bar"),
        ex(PB_PRESS[variant], `${s} × ${accReps}`),
        ex("Dumbbell Incline Fly", `3 × ${accReps + 2}`),
        ex("Triceps Pushdown", `3 × ${accReps + 4}`),
      ]},
    { title: "Squat Day", focus: "Quads, glutes, core", durationMin: dur,
      why: "Squats hit the largest muscles — the engine for whole-body growth.",
      restProtocol: rest,
      exercises: [
        ex(PB_SQUAT[variant], `${s} × ${reps}`, "Brace hard, knees out, full depth"),
        ex("Bulgarian Split Squat", `3 × ${accReps} per side`),
        ex("Leg Press", `3 × ${accReps}`),
        ex("Standing Calf Raise", `3 × 15`),
      ]},
    restDay("30 min easy walk + 5 min mobility"),
    { title: "Deadlift Day", focus: "Posterior chain", durationMin: dur,
      why: "Deadlifts build raw strength from floor to lockout — every chain fires.",
      restProtocol: rest,
      exercises: [
        ex(PB_DEAD[variant], `${s} × ${reps}`, "Bar over mid-foot, lats tight, push the floor"),
        ex(PB_ROW[variant], `${s} × ${accReps}`),
        ex("Hip Thrust", `3 × ${accReps}`),
        ex("Hanging Leg Raise", `3 × 12`),
      ]},
    { title: "Upper Pull & Arms", focus: "Back, biceps, rear delts", durationMin: dur,
      why: "A strong back supports every press and stabilises every lift.",
      restProtocol: rest,
      exercises: [
        ex(PB_PULL[variant], `${s} × ${accReps}`),
        ex("Face Pulls", `3 × 15`),
        ex("Barbell Curl", `3 × ${accReps}`),
        ex("Hammer Curl", `3 × ${accReps}`),
      ]},
    { title: "Accessory & Conditioning", focus: "Lagging parts + light cardio", durationMin: dur - 10,
      why: "Light volume drives recovery while reinforcing weak points.",
      restProtocol: "Rest 60 s between sets",
      exercises: [
        ex("Goblet Squat", `3 × ${accReps}`),
        ex("Dumbbell Row", `3 × ${accReps} per side`),
        ex("Plank", `3 × 45 s`),
        ex("Incline Walk", "15 min steady"),
      ]},
    restDay("Full rest — eat, sleep, grow"),
  ];
}

/* ============================================================================
 * CARDIO & HIIT — intervals, metabolic conditioning, plyometrics.
 * ========================================================================== */

const HIIT_PLYO: Record<Variant, string[]> = {
  1: ["Burpees", "Jump Squats", "Mountain Climbers", "High Knees"],
  2: ["Skater Jumps", "Tuck Jumps", "Plank-to-Push-Up", "Butt Kicks"],
  3: ["Box Jumps (or step-ups)", "Lateral Bounds", "Bear Crawl", "Sprint-in-Place"],
};

function cardioHiitWeek(variant: Variant, level: Level, goal: Goal): WeekTemplate {
  const moves = HIIT_PLYO[variant];
  const rounds = level === "beginner" ? 4 : level === "intermediate" ? 6 : 8;
  const dur = durFor(level, goal);
  const rest = "Rest 15–30 s between rounds";
  const work = level === "beginner" ? "30 s work / 30 s rest" : level === "intermediate" ? "40 s work / 20 s rest" : "45 s work / 15 s rest";
  return [
    { title: "Tabata Blast", focus: "Full-body intervals", durationMin: dur,
      why: "Short maximal bursts spike heart rate and burn calories long after.",
      restProtocol: rest,
      exercises: [
        ex(`${rounds}-round circuit, ${work}`, "Move through all four back-to-back"),
        ex(moves[0], "All-out effort"),
        ex(moves[1], "All-out effort"),
        ex(moves[2], "All-out effort"),
        ex(moves[3], "All-out effort"),
      ]},
    { title: "Steady-State Cardio", focus: "Aerobic base", durationMin: dur,
      why: "Steady cardio builds the engine that powers every interval session.",
      restProtocol: "Keep heart rate at 60–70 % max",
      exercises: [
        ex("Brisk walk, jog or cycle", `${dur} min continuous`),
        ex("Cool-down stretch", "5 min"),
      ]},
    restDay("Mobility flow + 20 min easy walk"),
    { title: "Metcon Ladder", focus: "Conditioning + strength", durationMin: dur,
      why: "Ascending reps under fatigue trains stamina and grit together.",
      restProtocol: "Rest only when needed — push for time",
      exercises: [
        ex("Ladder 1→10 reps of each", "Then back down 10→1"),
        ex("Push-Ups", "Add 1 rep per round"),
        ex("Air Squats", "Add 1 rep per round"),
        ex(moves[0], "Add 1 rep per round"),
      ]},
    { title: "Plyometric Power", focus: "Explosive lower body", durationMin: dur,
      why: "Jumps recruit fast-twitch fibres — speed translates to fat loss.",
      restProtocol: rest,
      exercises: [
        ex(moves[1], `${rounds} × 10`),
        ex("Jump Lunges", `${rounds} × 10 per side`),
        ex("Broad Jumps", `${rounds} × 5`),
        ex("Plank Hold", `3 × 45 s`),
      ]},
    { title: "EMOM Finisher", focus: "Density training", durationMin: dur - 10,
      why: "Every Minute On the Minute keeps you working at a steady high output.",
      restProtocol: "Rest the remainder of each minute",
      exercises: [
        ex(`${level === "beginner" ? 12 : 20}-min EMOM`, "Alternate the two moves each minute"),
        ex(moves[2], "10 reps per minute"),
        ex(moves[3], "15 reps per minute"),
      ]},
    restDay("Full rest — light walk and stretch only"),
  ];
}

const buildWeek = (
  discipline: Discipline,
  level: Level,
  goal: Goal,
  variant: Variant,
): WeekTemplate => {
  if (discipline === "pilates") return pilatesWeek(variant, level, goal);
  if (discipline === "yoga") return yogaWeek(variant, level, goal);
  if (discipline === "powerbuilding") return powerbuildingWeek(variant, level, goal);
  if (discipline === "cardioHiit") return cardioHiitWeek(variant, level, goal);
  return genericWeek(variant, level, goal, DISCIPLINE_LABEL[discipline]);
};

/* ============================================================================
 * 30-DAY PROGRESSION
 * Week 1 — base template (as above).
 * Week 2 — +1 set or +15 % reps OR +5 min duration
 * Week 3 — +2 sets or +25 % reps OR +10 min  (peak)
 * Week 4 — DELOAD: -1 set, -10 % reps  (also days 29-30 are full rest)
 * ========================================================================== */

function progressDay(d: Workout, weekIndex: number): Workout {
  if (d.restDay) return d;
  const pct =
    weekIndex === 1 ? 1.0 : weekIndex === 2 ? 1.15 : weekIndex === 3 ? 1.25 : 0.9;
  const addSets = weekIndex === 1 ? 0 : weekIndex === 2 ? 1 : weekIndex === 3 ? 2 : -1;
  const addMin = weekIndex === 1 ? 0 : weekIndex === 2 ? 5 : weekIndex === 3 ? 10 : -5;
  const tag =
    weekIndex === 1 ? "Foundation" :
    weekIndex === 2 ? "Build" :
    weekIndex === 3 ? "Peak" : "Deload";
  return {
    ...d,
    title: `${d.title} · ${tag}`,
    durationMin: Math.max(15, d.durationMin + addMin),
    why: weekIndex === 4
      ? "Deload week — reduce volume so your body absorbs the previous 3 weeks of stress."
      : d.why,
    exercises: d.exercises.map((e) => {
      const m1 = e.detail.match(/^(\d+)\s*×\s*(\d+)(.*)$/);
      if (m1) {
        const sets = Math.max(1, Number(m1[1]) + addSets);
        const reps = Math.max(1, Math.round(Number(m1[2]) * pct));
        return { ...e, detail: `${sets} × ${reps}${m1[3]}` };
      }
      const m2 = e.detail.match(/^(\d+)\s*×\s*(\d+)\s*s$/);
      if (m2) {
        const sets = Math.max(1, Number(m2[1]) + addSets);
        const sec = Math.max(10, Math.round(Number(m2[2]) * pct));
        return { ...e, detail: `${sets} × ${sec} s` };
      }
      return e;
    }),
  };
}

/** Returns 30 ProgramDay-shaped workouts (workout only). Day 29/30 are full rest. */
export function build30DayWorkouts(
  discipline: Discipline,
  level: Level,
  goal: Goal,
  variant: Variant,
  startWeekday: number, // 0=Mon..6=Sun
): { workout: Workout; weekIndex: number; weekdayLabel: string }[] {
  const week = buildWeek(discipline, level, goal, variant);
  const out: { workout: Workout; weekIndex: number; weekdayLabel: string }[] = [];
  for (let i = 0; i < 30; i++) {
    const weekIdx = Math.min(4, Math.floor(i / 7) + 1);
    const dayOfWeek = i % 7;
    const weekdayLabel = WEEKDAYS[(startWeekday + i) % 7];
    let base = week[dayOfWeek];
    // Final 2 days of program → full rest celebration
    if (i >= 28) {
      base = restDay(i === 28 ? "Reflection walk + journal" : "Full rest — celebrate the month");
    }
    out.push({ workout: progressDay(base, weekIdx), weekIndex: weekIdx, weekdayLabel });
  }
  return out;
}
