import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// Signed, stateless session token: base64url(payload) + "." + hex HMAC-SHA256.
// The HMAC is keyed by SESSION_SECRET, so the client cannot forge or tamper with
// the role without knowing the server secret.

export const SESSION_COOKIE = "mc_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  email: string;
  role: "admin" | "customer";
}

interface SessionPayload extends SessionData {
  exp: number; // unix seconds
}

function secret(): string | null {
  return process.env.SESSION_SECRET || null;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("hex");
}

export function signSession(data: SessionData): string | null {
  const key = secret();
  if (!key) return null;
  const payload: SessionPayload = {
    email: data.email,
    role: data.role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body, key)}`;
}

export function verifySession(token: string | undefined | null): SessionData | null {
  const key = secret();
  if (!key || !token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(body, key);
  // Constant-time compare; lengths must match for timingSafeEqual.
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    if (payload.role !== "admin" && payload.role !== "customer") return null;
    return { email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): SessionData | null {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

export function isAdmin(req: NextRequest): boolean {
  return getSession(req)?.role === "admin";
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
