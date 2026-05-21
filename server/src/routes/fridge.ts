import express, { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET INVENTORY
router.get("/inventory", requireAuth, (req, res) => {
  try {
    const rows = db.prepare("SELECT item FROM fridge_inventory WHERE userId = ?").all(req.user!.id) as { item: string }[];
    const items = rows.map((r) => r.item);
    return res.json(items);
  } catch (error) {
    console.error("[Fridge] Error reading inventory:", error);
    return res.status(500).json({ error: "Failed to read fridge inventory" });
  }
});

// ADD A SINGLE ITEM TO INVENTORY (POST)
router.post("/inventory", requireAuth, (req: express.Request, res: express.Response) => {
  const { item } = req.body;

  if (!item || typeof item !== "string" || !item.trim()) {
    return res.status(400).json({ error: "A non-empty item string is required" });
  }

  const normalized = item.trim().toLowerCase();

  try {
    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(req.user!.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    db.prepare(
      "INSERT OR IGNORE INTO fridge_inventory (userId, item) VALUES (?, ?)"
    ).run(req.user!.id, normalized);

    const rows = db
      .prepare("SELECT item FROM fridge_inventory WHERE userId = ?")
      .all(req.user!.id) as { item: string }[];

    return res.status(201).json(rows.map((r) => r.item));
  } catch (error) {
    console.error("[Fridge] Error adding item to inventory:", error);
    return res.status(500).json({ error: "Failed to add item to fridge inventory" });
  }
});

// SET INVENTORY
router.put("/inventory", requireAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Items must be an array of strings" });
  }

  // Normalize
  const norm = Array.from(new Set(items.map((i: string) => i.trim().toLowerCase()).filter(Boolean)));

  try {
    const deleteTx = db.transaction(() => {
      db.prepare("DELETE FROM fridge_inventory WHERE userId = ?").run(req.user!.id);
      
      const insert = db.prepare("INSERT INTO fridge_inventory (userId, item) VALUES (?, ?)");
      for (const item of norm) {
        insert.run(req.user!.id, item);
      }
    });

    deleteTx();
    return res.json(norm);
  } catch (error) {
    console.error("[Fridge] Error updating inventory:", error);
    return res.status(500).json({ error: "Failed to update fridge inventory" });
  }
});

export default router;
