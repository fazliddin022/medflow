import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db.select().from(patients).orderBy(desc(patients.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [patient] = await db.insert(patients).values({
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
  }).returning();

  return NextResponse.json(patient);
}