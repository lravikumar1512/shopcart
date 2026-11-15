import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Role } from "@/lib/constants";
import { bannerSchema } from "@/lib/validators";

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Banners GET error:", error);
    return NextResponse.json(
      { error: "Failed to load banners" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: parsed.data,
    });

    return NextResponse.json({ banner, message: "Banner created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Banner create error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    await db.banner.delete({ where: { id } });
    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    console.error("Banner delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}
