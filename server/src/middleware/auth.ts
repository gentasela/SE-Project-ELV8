import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { UserProfile } from "../types";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.session_token;

  if (!token) {
    return next();
  }

  try {
    // Find session
    const session = db.prepare("SELECT userId FROM sessions WHERE token = ?").get(token) as { userId: string } | undefined;

    if (!session) {
      // Clear invalid cookie
      res.clearCookie("session_token");
      return next();
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId) as UserProfile | undefined;

    if (user) {
      req.user = user;
    }
  } catch (error) {
    console.error("[AuthMiddleware] Error processing session token:", error);
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
