import type { UserProfile } from "./types";

const USERS_KEY = "elv8:users";
const SESSION_KEY = "elv8:session";

async function sha256(text: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // Fallback (not cryptographically strong — local-only app)
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return String(h);
  }
  const buf = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: UserProfile[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signUp(
  draft: Omit<UserProfile, "id" | "passwordHash" | "createdAt"> & { password: string },
): Promise<UserProfile> {
  const users = readUsers();
  const email = draft.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with that email already exists.");
  }
  const passwordHash = await sha256(draft.password);
  const user: UserProfile = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    name: draft.name,
    age: draft.age,
    heightCm: draft.heightCm,
    weightKg: draft.weightKg,
    sex: draft.sex,
    discipline: draft.discipline,
    level: draft.level,
    goal: draft.goal,
    createdAt: Date.now(),
  };
  writeUsers([...users, user]);
  window.localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export async function logIn(email: string, password: string): Promise<UserProfile> {
  const users = readUsers();
  const e = email.trim().toLowerCase();
  const user = users.find((u) => u.email === e);
  if (!user) throw new Error("No account found for that email.");
  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error("Incorrect password.");
  window.localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function logOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readUsers().find((u) => u.id === id) ?? null;
}

export function updateCurrentUser(patch: Partial<UserProfile>): UserProfile | null {
  const current = getCurrentUser();
  if (!current) return null;
  const users = readUsers();
  const next = users.map((u) => (u.id === current.id ? { ...u, ...patch } : u));
  writeUsers(next);
  return next.find((u) => u.id === current.id) ?? null;
}