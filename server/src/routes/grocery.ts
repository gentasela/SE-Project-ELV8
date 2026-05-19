import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface ChecklistRow {
  userId: string;
  itemName: string;
  checked: number;
}

function getChecklistMap(userId: string): Record<string, boolean> {
  const rows = db.prepare("SELECT itemName, checked FROM grocery_checklist WHERE userId = ?").all(userId) as { itemName: string; checked: number }[];
  
  const map: Record<string, boolean> = {};
  for (const row of rows) {
    map[row.itemName] = row.checked === 1;
  }
  return map;
}

// GET CHECKLIST MAP
router.get("/checklist", requireAuth, (req, res) => {
  try {
    return res.json(getChecklistMap(req.user!.id));
  } catch (error) {
    console.error("[Grocery] Error reading checklist:", error);
    return res.status(500).json({ error: "Failed to read grocery checklist" });
  }
});

// TOGGLE ITEM IN CHECKLIST
router.post("/toggle", requireAuth, (req, res) => {
  const { itemName } = req.body;
  if (!itemName) {
    return res.status(400).json({ error: "Item name is required" });
  }

  try {
    const existing = db.prepare("SELECT checked FROM grocery_checklist WHERE userId = ? AND itemName = ?").get(req.user!.id, itemName) as { checked: number } | undefined;
    
    const nextVal = existing ? (existing.checked === 1 ? 0 : 1) : 1;

    db.prepare(`
      INSERT INTO grocery_checklist (userId, itemName, checked)
      VALUES (?, ?, ?)
      ON CONFLICT(userId, itemName) DO UPDATE SET checked = excluded.checked
    `).run(req.user!.id, itemName, nextVal);

    return res.json(getChecklistMap(req.user!.id));
  } catch (error) {
    console.error("[Grocery] Error toggling item:", error);
    return res.status(500).json({ error: "Failed to toggle grocery item" });
  }
});

export default router;
