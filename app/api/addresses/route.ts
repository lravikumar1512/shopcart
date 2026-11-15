import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If marked as default, unset other addresses
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    }

    // If first address for user, automatically make default
    const existingCount = await db.address.count({
      where: { userId: user.userId },
    });

    const isDefault = data.isDefault || existingCount === 0;

    const address = await db.address.create({
      data: {
        userId: user.userId,
        name: data.name,
        phone: data.phone,
        street: data.street,
        locality: data.locality || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark || null,
        addressType: data.addressType as any,
        isDefault,
      },
    });

    return NextResponse.json({ address, message: "Address added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Address POST error:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}
