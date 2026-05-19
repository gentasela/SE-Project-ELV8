import type { UserProfile } from "./types";
import { apiFetch } from "./api";

export async function signUp(
  draft: Omit<UserProfile, "id" | "passwordHash" | "createdAt"> & { password: string },
): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(draft),
  });
}

export async function logIn(email: string, password: string): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logOut(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    return await apiFetch<UserProfile | null>("/api/auth/me");
  } catch (error) {
    console.error("[Auth] Error fetching current user:", error);
    return null;
  }
}

export async function updateCurrentUser(patch: Partial<UserProfile>): Promise<UserProfile | null> {
  return apiFetch<UserProfile>("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}