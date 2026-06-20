import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, patients, staff } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      patientId: appointments.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientPhone: patients.phone,
      doctorId: appointments.doctorId,
      doctorName: staff.name,
      doctorSpecialization: staff.specialization,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(staff, eq(appointments.doctorId, staff.id))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [appointment] = await db.insert(appointments).values({
    patientId: body.patientId,
    doctorId: body.doctorId,
    appointmentDate: body.appointmentDate,
    appointmentTime: body.appointmentTime,
    reason: body.reason || null,
    notes: body.notes || null,
  }).returning();

  return NextResponse.json(appointment);
}