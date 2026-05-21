import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface ProgressRow {
  userId: string;
  date: string;
  workoutDone: number;
  mealBreakfast: number;
  mealLunch: number;
  mealDinner: number;
  mealSnack: number;
}

const emptyLog = {
  workoutDone: false,
  meals: { breakfast: false, lunch: false, dinner: false, snack: false },
};

function formatProgress(row?: ProgressRow) {
  if (!row) return emptyLog;
  return {
    workoutDone: row.workoutDone === 1,
    meals: {
      breakfast: row.mealBreakfast === 1,
      lunch: row.mealLunch === 1,
      dinner: row.mealDinner === 1,
      snack: row.mealSnack === 1,
    },
  };
}

// GET ALL LOGS FOR USER (keyed by date)
router.get("/", requireAuth, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM progress WHERE userId = ?").all(req.user!.id) as ProgressRow[];
    const map: Record<string, any> = {};
    for (const row of rows) {
      map[row.date] = formatProgress(row);
    }
    return res.json(map);
  } catch (error) {
    console.error("[Progress] Error getting all logs:", error);
    return res.status(500).json({ error: "Failed to get progress logs" });
  }
});

// GET LOG FOR DATE
router.get("/log/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  try {
    const row = db.prepare("SELECT * FROM progress WHERE userId = ? AND date = ?").get(req.user!.id, date) as ProgressRow | undefined;
    return res.json(formatProgress(row));
  } catch (error) {
    console.error("[Progress] Error getting log:", error);
    return res.status(500).json({ error: "Failed to get progress log" });
  }
});

// SET LOG FOR DATE
router.put("/log/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  const { workoutDone, meals } = req.body;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(date)) {
  return res.status(400).json({ error: "Date must be in YYYY-MM-DD format." });
}

  try {
    // Get existing
    const existing = db.prepare("SELECT * FROM progress WHERE userId = ? AND date = ?").get(req.user!.id, date) as ProgressRow | undefined;

    const merged = {
      workoutDone: workoutDone !== undefined ? (workoutDone ? 1 : 0) : (existing?.workoutDone ?? 0),
      mealBreakfast: meals?.breakfast !== undefined ? (meals.breakfast ? 1 : 0) : (existing?.mealBreakfast ?? 0),
      mealLunch: meals?.lunch !== undefined ? (meals.lunch ? 1 : 0) : (existing?.mealLunch ?? 0),
      mealDinner: meals?.dinner !== undefined ? (meals.dinner ? 1 : 0) : (existing?.mealDinner ?? 0),
      mealSnack: meals?.snack !== undefined ? (meals.snack ? 1 : 0) : (existing?.mealSnack ?? 0),
    };

    db.prepare(`
      INSERT INTO progress (userId, date, workoutDone, mealBreakfast, mealLunch, mealDinner, mealSnack)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId, date) DO UPDATE SET
        workoutDone = excluded.workoutDone,
        mealBreakfast = excluded.mealBreakfast,
        mealLunch = excluded.mealLunch,
        mealDinner = excluded.mealDinner,
        mealSnack = excluded.mealSnack
    `).run(
      req.user!.id,
      date,
      merged.workoutDone,
      merged.mealBreakfast,
      merged.mealLunch,
      merged.mealDinner,
      merged.mealSnack
    );

    const updated = db.prepare("SELECT * FROM progress WHERE userId = ? AND date = ?").get(req.user!.id, date) as ProgressRow;
    return res.json(formatProgress(updated));
  } catch (error) {
    console.error("[Progress] Error saving log:", error);
    return res.status(500).json({ error: "Failed to update progress log" });
  }
});

// RECENT DAYS LOGS
router.get("/recent", requireAuth, (req, res) => {
  const n = Number(req.query.n || 14);
  const out: { date: string; log: any }[] = [];
  const today = new Date();

  try {
    // Get all records in the range to avoid multiple queries
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const placeholders = dates.map(() => "?").join(",");
    const rows = db.prepare(`
      SELECT * FROM progress 
      WHERE userId = ? AND date IN (${placeholders})
    `).all(req.user!.id, ...dates) as ProgressRow[];

    const rowMap = new Map(rows.map((r) => [r.date, r]));

    for (const date of dates) {
      out.push({
        date,
        log: formatProgress(rowMap.get(date)),
      });
    }

    return res.json(out);
  } catch (error) {
    console.error("[Progress] Error getting recent logs:", error);
    return res.status(500).json({ error: "Failed to get recent progress" });
  }
});

// STREAK
router.get("/streak", requireAuth, (req, res) => {
  try {
    const today = new Date();
    let currentStreak = 0;

    // We check up to 60 days
    const dates: string[] = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const placeholders = dates.map(() => "?").join(",");
    const rows = db.prepare(`
      SELECT * FROM progress 
      WHERE userId = ? AND date IN (${placeholders})
    `).all(req.user!.id, ...dates) as ProgressRow[];

    const rowMap = new Map(rows.map((r) => [r.date, r]));

    for (const date of dates) {
      const row = rowMap.get(date);
      const log = formatProgress(row);
      const total = 5;
      const done =
        (log.workoutDone ? 1 : 0) +
        (log.meals.breakfast ? 1 : 0) +
        (log.meals.lunch ? 1 : 0) +
        (log.meals.dinner ? 1 : 0) +
        (log.meals.snack ? 1 : 0);
      const rate = done / total;

      if (rate >= 0.6) {
        currentStreak++;
      } else {
        break;
      }
    }

    return res.json({ streak: currentStreak });
  } catch (error) {
    console.error("[Progress] Error computing streak:", error);
    return res.status(500).json({ error: "Failed to compute streak" });
  }
});

export default router;
