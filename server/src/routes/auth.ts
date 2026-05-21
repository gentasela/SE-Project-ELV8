import { Router } from "express";
import { createHash, randomUUID } from "crypto";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import { UserProfile } from "../types";

const router = Router();

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function sanitizeUser(user: UserProfile) {
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    remindersEnabled: (user as any).remindersEnabled === 1,
  };
}

// SIGNUP
router.post("/signup", (req, res) => {
  const { email, password, name, age, heightCm, weightKg, sex, discipline, level, goal } = req.body;

  if (!email || !password || !name || !age || !heightCm || !weightKg || !sex || !discipline || !level || !goal) {
  return res.status(400).json({ error: "Missing required fields" });
}

if (password.length < 8) {
  return res.status(400).json({ error: "Password must be at least 8 characters." });
}

  const cleanEmail = email.trim().toLowerCase();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(cleanEmail)) {
  return res.status(400).json({ error: "Invalid email address." });
}

if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  // ADD THE 3 CHECKS HERE ↓
  if (Number(age) < 10 || Number(age) > 120) {
    return res.status(400).json({ error: "Age must be between 10 and 120." });
  }
  if (Number(heightCm) < 50 || Number(heightCm) > 300) {
    return res.status(400).json({ error: "Height must be between 50 and 300 cm." });
  }
  if (Number(weightKg) < 20 || Number(weightKg) > 500) {
    return res.status(400).json({ error: "Weight must be between 20 and 500 kg." });
  }

  try {
    // Check if user already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with that email already exists." });
    }

    const userId = randomUUID();
    const passwordHash = sha256(password);

    db.prepare(`
      INSERT INTO users (id, email, passwordHash, name, age, heightCm, weightKg, sex, discipline, level, goal, createdAt, remindersEnabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      userId,
      cleanEmail,
      passwordHash,
      name.trim(),
      Number(age),
      Number(heightCm),
      Number(weightKg),
      sex,
      discipline,
      level,
      goal,
      Date.now()
    );

    // Create session
    const token = randomUUID();
    db.prepare("INSERT INTO sessions (token, userId, createdAt) VALUES (?, ?, ?)").run(
      token,
      userId,
      Date.now()
    );

    // Set cookie
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: false, // Set to true in production if HTTPS
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserProfile;
    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("[Auth] Signup error:", error);
    return res.status(500).json({ error: "Failed to create user account" });
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail) as UserProfile | undefined;
    if (!user) {
      return res.status(400).json({ error: "No account found for that email." });
    }

    const hash = sha256(password);
    if (hash !== user.passwordHash) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    // Create session
    const token = randomUUID();
    db.prepare("INSERT INTO sessions (token, userId, createdAt) VALUES (?, ?, ?)").run(
      token,
      user.id,
      Date.now()
    );

    // Set cookie
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  const token = req.cookies.session_token;
  if (token) {
    try {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    } catch (error) {
      console.error("[Auth] Logout error:", error);
    }
  }

  res.clearCookie("session_token");
  return res.json({ success: true });
});

// GET CURRENT USER
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.json(null);
  }
  return res.json(sanitizeUser(req.user));
});

// UPDATE CURRENT USER
router.put("/me", requireAuth, (req, res) => {
  const user = req.user!;
  const patch = req.body;

  // Allowed fields to update
  const allowedFields = ["name", "age", "heightCm", "weightKg", "sex", "discipline", "level", "goal", "remindersEnabled"];
  const updates: string[] = [];
  const values: any[] = [];

  for (const field of allowedFields) {
    if (patch[field] !== undefined) {
      updates.push(`${field} = ?`);
      if (field === "remindersEnabled") {
        values.push(patch[field] ? 1 : 0);
      } else {
        values.push(patch[field]);
      }
    }
  }

  if (updates.length === 0) {
    return res.json(sanitizeUser(user));
  }

  values.push(user.id);

  try {
    db.prepare(`
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = ?
    `).run(...values);

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id) as UserProfile;
    return res.json(sanitizeUser(updatedUser));
  } catch (error) {
    console.error("[Auth] Update profile error:", error);
    return res.status(500).json({ error: "Failed to update profile info" });
  }
});

export default router;
