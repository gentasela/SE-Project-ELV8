import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store database file in the server directory
const dbPath = join(__dirname, "..", "elv8.db");
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    heightCm INTEGER NOT NULL,
    weightKg REAL NOT NULL,
    sex TEXT NOT NULL CHECK(sex IN ('female','male','other')),
    discipline TEXT NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('beginner','intermediate','advanced')),
    goal TEXT NOT NULL CHECK(goal IN ('lose','gain')),
    createdAt INTEGER NOT NULL,
    remindersEnabled INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plans (
    userId TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    activeVariant INTEGER NOT NULL DEFAULT 1,
    plansJson TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress (
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    workoutDone INTEGER NOT NULL DEFAULT 0,
    mealBreakfast INTEGER NOT NULL DEFAULT 0,
    mealLunch INTEGER NOT NULL DEFAULT 0,
    mealDinner INTEGER NOT NULL DEFAULT 0,
    mealSnack INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (userId, date)
  );

  CREATE TABLE IF NOT EXISTS fridge_inventory (
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    PRIMARY KEY (userId, item)
  );

  CREATE TABLE IF NOT EXISTS grocery_checklist (
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    itemName TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (userId, itemName)
  );
`);

// Migration to add remindersEnabled column if db already existed
try {
  db.exec("ALTER TABLE users ADD COLUMN remindersEnabled INTEGER NOT NULL DEFAULT 1");
} catch (e) {
  // Already exists
}

console.log(`[Database] Initialized SQLite database at ${dbPath}`);
