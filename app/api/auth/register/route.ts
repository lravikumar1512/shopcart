import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { Role } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Input validation
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    // 3. Unique email check
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // 4. Password hashing with bcrypt cost 12
    const hashedPassword = await hashPassword(password);

    // 5. Create user & initialize cart
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: Role.CUSTOMER,
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    // 6. Sign JWT & set secure httpOnly cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Registration successful",
      user,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
