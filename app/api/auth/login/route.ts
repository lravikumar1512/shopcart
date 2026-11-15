import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    // 2. Validate request
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid login credentials", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 3. Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Sign token & set cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: safeUser,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
