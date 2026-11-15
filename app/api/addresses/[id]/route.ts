import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const parsed = addressSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await db.address.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    if (parsed.data.isDefault) {
      await db.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id },
      data: {
        ...(parsed.data as any),
      },
    });

    return NextResponse.json({ address: updated, message: "Address updated successfully" });
  } catch (error) {
    console.error("Address PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existing = await db.address.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.address.delete({ where: { id } });

    // If deleted address was default, promote another address to default
    if (existing.isDefault) {
      const remaining = await db.address.findFirst({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await db.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
