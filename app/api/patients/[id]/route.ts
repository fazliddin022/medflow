import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const [patient] = await db
    .update(patients)
    .set({
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      phone: body.phone,
      email: body.email || null,
      address: body.address || null,
      bloodType: body.bloodType || null,
      allergies: body.allergies || null,
      notes: body.notes || null,
    })
    .where(eq(patients.id, id))
    .returning();

  return NextResponse.json(patient);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(patients).where(eq(patients.id, id));

  return NextResponse.json({ success: true });
}