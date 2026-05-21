import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import { generateMonthlyPlan } from "../../../src/lib/plan-logic";
import { MonthlyPlan, Variant } from "../types";

const router = Router();

interface StoredPlansRow {
  userId: string;
  activeVariant: number;
  plansJson: string; // JSON: Record<Variant, MonthlyPlan>
}

// Helper to ensure user plans exist and match current profile
function getOrGeneratePlans(userId: string): { activeVariant: Variant; plans: Record<Variant, MonthlyPlan> } {
  // Get user profile
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
  if (!user) throw new Error("User not found");

  const row = db.prepare("SELECT * FROM plans WHERE userId = ?").get(userId) as StoredPlansRow | undefined;

  let activeVariant: Variant = 1;
  let plans: Record<Variant, MonthlyPlan> = {} as any;

  if (row) {
    activeVariant = row.activeVariant as Variant;
    try {
      plans = JSON.parse(row.plansJson);
    } catch {
      // JSON corrupt, will regenerate
    }
  }

  const hasAllVariants = plans[1] && plans[2] && plans[3];
  const sample = plans[1];
  const profileMatches = sample && 
    sample.discipline === user.discipline &&
    sample.level === user.level &&
    sample.goal === user.goal;

  if (!row || !hasAllVariants || !profileMatches) {
    // Generate/Regenerate all plans
    const newPlans: Record<Variant, MonthlyPlan> = {
      1: generateMonthlyPlan(user, 1),
      2: generateMonthlyPlan(user, 2),
      3: generateMonthlyPlan(user, 3),
    };

    const plansJson = JSON.stringify(newPlans);

    if (!row) {
      db.prepare("INSERT INTO plans (userId, activeVariant, plansJson) VALUES (?, ?, ?)").run(
        userId,
        1,
        plansJson
      );
      activeVariant = 1;
    } else {
      db.prepare("UPDATE plans SET plansJson = ? WHERE userId = ?").run(plansJson, userId);
    }
    plans = newPlans;
  }

  return { activeVariant, plans };
}

// GET ACTIVE PLAN
router.get("/", requireAuth, (req, res) => {
  try {
    const { activeVariant, plans } = getOrGeneratePlans(req.user!.id);
    return res.json(plans[activeVariant]);
  } catch (error) {
    console.error("[Plans] Error loading plan:", error);
    return res.status(500).json({ error: "Failed to load monthly plan" });
  }
});

// SET ACTIVE VARIANT
router.put("/variant", requireAuth, (req, res) => {
  const { variant } = req.body;
  if (!variant || ![1, 2, 3].includes(Number(variant))) {
    return res.status(400).json({ error: "Invalid variant" });
  }

  const v = Number(variant) as Variant;

  try {
    const { plans } = getOrGeneratePlans(req.user!.id);
    db.prepare("UPDATE plans SET activeVariant = ? WHERE userId = ?").run(v, req.user!.id);
    return res.json(plans[v]);
  } catch (error) {
    console.error("[Plans] Error updating variant:", error);
    return res.status(500).json({ error: "Failed to switch plan variant" });
  }
});

// REGENERATE/RESTART ALL PLANS
router.post("/regenerate", requireAuth, (req, res) => {
  try {
    const user = req.user!;
    const newPlans: Record<Variant, MonthlyPlan> = {
      1: generateMonthlyPlan(user, 1),
      2: generateMonthlyPlan(user, 2),
      3: generateMonthlyPlan(user, 3),
    };

    db.prepare(`
      INSERT INTO plans (userId, activeVariant, plansJson)
      VALUES (?, 1, ?)
      ON CONFLICT(userId) DO UPDATE SET activeVariant = 1, plansJson = excluded.plansJson
    `).run(user.id, JSON.stringify(newPlans));

    return res.json(newPlans[1]);
  } catch (error) {
    console.error("[Plans] Error regenerating plans:", error);
    return res.status(500).json({ error: "Failed to restart program" });
  }
});

// SWAP A MEAL FOR A GIVEN DAY (persisted in JSON store)
router.put("/swap-meal", requireAuth, (req, res) => {
  const { dayInProgram, slot, newMeal } = req.body;

  if (!dayInProgram || !slot || !newMeal) {
  return res.status(400).json({ error: "Missing swap details" });
}

const validSlots = ["breakfast", "lunch", "dinner", "snack"];
if (!validSlots.includes(slot)) {
  return res.status(400).json({ error: "Invalid meal slot. Must be breakfast, lunch, dinner or snack." });
}

  try {
    const { activeVariant, plans } = getOrGeneratePlans(req.user!.id);
    const plan = plans[activeVariant];
    const day = plan.days[dayInProgram - 1];

    if (!day) {
      return res.status(400).json({ error: "Invalid day in program" });
    }

    const idx = day.meals.findIndex((m) => m.slot === slot);
    if (idx < 0) {
      return res.status(400).json({ error: "Invalid meal slot" });
    }

    const cur = day.meals[idx];
    day.meals[idx] = { slot: cur.slot, options: [newMeal, cur.options[0]] };

    // Update plans JSON
    db.prepare("UPDATE plans SET plansJson = ? WHERE userId = ?").run(
      JSON.stringify(plans),
      req.user!.id
    );

    return res.json(plan);
  } catch (error) {
    console.error("[Plans] Error swapping meal:", error);
    return res.status(500).json({ error: "Failed to swap meal" });
  }
});

export default router;
