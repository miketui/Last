// Authentication and session management
// Password hashing uses Bun's built-in Bun.password

import db from "./database";
import { randomUUID } from "node:crypto";

const SESSION_TTL_HOURS = 72;

export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "starter" | "professional" | "enterprise";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  manuscripts_this_month: number;
  created_at: string;
}

/** Register a new user */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const existing = db.query("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) throw new Error("Email already registered");

  const id = randomUUID();
  const password_hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 12 });

  db.run(
    "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
    [id, email, password_hash, name]
  );

  return getUserById(id)!;
}

/** Authenticate user and create session. Returns session token. */
export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const row = db.query("SELECT id, password_hash FROM users WHERE email = ?").get(email) as any;
  if (!row) throw new Error("Invalid email or password");

  const valid = await Bun.password.verify(password, row.password_hash);
  if (!valid) throw new Error("Invalid email or password");

  const user = getUserById(row.id)!;
  const token = createSession(user.id);
  return { token, user };
}

/** Create a session token */
function createSession(userId: string): string {
  const id = randomUUID();
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000).toISOString();
  db.run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [id, userId, expires]);
  return id;
}

/** Validate session token and return user. Returns null if invalid/expired. */
export function validateSession(token: string): User | null {
  if (!token) return null;
  const row = db.query(
    "SELECT user_id, expires_at FROM sessions WHERE id = ?"
  ).get(token) as any;

  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.run("DELETE FROM sessions WHERE id = ?", [token]);
    return null;
  }

  return getUserById(row.user_id);
}

/** Delete session */
export function logout(token: string): void {
  db.run("DELETE FROM sessions WHERE id = ?", [token]);
}

/** Get user by ID */
export function getUserById(id: string): User | null {
  const row = db.query(
    "SELECT id, email, name, plan, stripe_customer_id, stripe_subscription_id, manuscripts_this_month, created_at FROM users WHERE id = ?"
  ).get(id) as any;
  return row || null;
}

/** Update user plan */
export function updateUserPlan(userId: string, plan: string, stripeSubId?: string): void {
  db.run("UPDATE users SET plan = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?", [plan, stripeSubId || null, userId]);
}

/** Check plan limits */
export function checkPlanLimits(user: User): { canUpload: boolean; maxModules: number; maxWordCount: number } {
  // Reset monthly count if needed
  const resetAt = new Date(user.manuscripts_this_month > 0 ? (db.query("SELECT monthly_reset_at FROM users WHERE id = ?").get(user.id) as any)?.monthly_reset_at : new Date().toISOString());
  if (Date.now() - resetAt.getTime() > 30 * 24 * 3600_000) {
    db.run("UPDATE users SET manuscripts_this_month = 0, monthly_reset_at = datetime('now') WHERE id = ?", [user.id]);
    user.manuscripts_this_month = 0;
  }

  switch (user.plan) {
    case "free":
      return { canUpload: user.manuscripts_this_month < 1, maxModules: 3, maxWordCount: 10000 };
    case "starter":
      return { canUpload: user.manuscripts_this_month < 5, maxModules: 7, maxWordCount: 80000 };
    case "professional":
      return { canUpload: user.manuscripts_this_month < 20, maxModules: 10, maxWordCount: 200000 };
    case "enterprise":
      return { canUpload: true, maxModules: 10, maxWordCount: 500000 };
    default:
      return { canUpload: false, maxModules: 0, maxWordCount: 0 };
  }
}

/** Middleware helper: extract user from request cookie */
export function getUserFromRequest(req: Request): User | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  return validateSession(match[1]);
}
