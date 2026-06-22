import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prescriptions, patients, staff } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select({
      id: prescriptions.id,
      diagnosis: prescriptions.diagnosis,
      medications: prescriptions.medications,
      instructions: prescriptions.instructions,
      createdAt: prescriptions.createdAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorName: staff.name,
    })
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patientId, patients.id))
    .innerJoin(staff, eq(prescriptions.doctorId, staff.id))
    .orderBy(desc(prescriptions.createdAt));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [prescription] = await db.insert(prescriptions).values({
    appointmentId: body.appointmentId,
    patientId: body.patientId,
    doctorId: session.user.id,
    diagnosis: body.diagnosis,
    medications: body.medications,
    instructions: body.instructions || null,
  }).returning();

  return NextResponse.json(prescription);
}