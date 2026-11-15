import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, Role, RoleType } from "./constants";

const JWT_SECRET = process.env.JWT_SECRET || "shopkart-fallback-dev-secret-key-32chars!";
const BCRYPT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  email: string;
  role: RoleType;
  name: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_ROUNDS);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  const opts = getAuthCookieOptions();
  response.cookies.set({
    name: opts.name,
    value: token,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
}

export function clearAuthCookie(response: NextResponse) {
  const opts = getAuthCookieOptions();
  response.cookies.set({
    name: opts.name,
    value: "",
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: 0,
  });
}

/**
 * Extracts and verifies the current session user from request cookies or Authorization header
 */
export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // In non-request context
    }
  }

  if (!token) return null;
  return verifyToken(token);
}
