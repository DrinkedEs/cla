import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { apiError } from "@/lib/http";
import type { Role, SessionUser } from "@/lib/types";

const SESSION_COOKIE = "la_session";

type SessionRow = RowDataPacket & SessionUser;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.SESSION_MAX_AGE_DAYS);
  return expiresAt;
}

export async function createUserSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = sessionExpiryDate();

  await db.query(
    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (rawToken) {
    await db.query("DELETE FROM sessions WHERE token_hash = ?", [hashToken(rawToken)]);
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!rawToken) {
    return null;
  }

  const [rows] = await db.query<SessionRow[]>(
    `
      SELECT u.id, u.role, u.email, u.phone, u.status
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
        AND s.expires_at > UTC_TIMESTAMP()
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [hashToken(rawToken)]
  );

  const user = rows[0] ?? null;

  if (!user || user.status !== "active") {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
    status: user.status
  };
}

export async function requireUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();

  if (user.role !== role) {
    redirect(user.role === "doctor" ? "/doctor" : "/paciente");
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getSessionUser();

  if (user) {
    redirect(user.role === "doctor" ? "/doctor" : "/paciente");
  }
}

export async function requireApiUser() {
  const user = await getSessionUser();

  if (!user) {
    apiError("Tu sesion expiro. Inicia sesion de nuevo.", 401);
  }

  return user;
}

export async function requireApiRole(role: Role) {
  const user = await requireApiUser();

  if (user.role !== role) {
    apiError("No tienes permisos para esta accion.", 403);
  }

  return user;
}
