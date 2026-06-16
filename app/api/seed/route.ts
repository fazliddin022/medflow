import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff, patients, appointments } from "@/lib/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  await db.delete(appointments);
  await db.delete(patients);
  await db.delete(staff);

  const adminPass = await bcrypt.hash("admin123", 10);
  const doctorPass = await bcrypt.hash("doctor123", 10);
  const receptionPass = await bcrypt.hash("reception123", 10);

  const [admin] = await db.insert(staff).values({
    name: "Admin Adminov",
    email: "admin@medflow.uz",
    password: adminPass,
    role: "admin",
    phone: "+998901111111",
  }).returning();

  const [doctor1] = await db.insert(staff).values({
    name: "Dr. Alisher Karimov",
    email: "doctor@medflow.uz",
    password: doctorPass,
    role: "doctor",
    specialization: "Terapevt",
    phone: "+998902222222",
  }).returning();

  const [doctor2] = await db.insert(staff).values({
    name: "Dr. Malika Yusupova",
    email: "doctor2@medflow.uz",
    password: doctorPass,
    role: "doctor",
    specialization: "Kardiolog",
    phone: "+998903333333",
  }).returning();

  await db.insert(staff).values({
    name: "Registrator Holiqov",
    email: "reception@medflow.uz",
    password: receptionPass,
    role: "receptionist",
    phone: "+998904444444",
  });

  // Demo bemorlar
  const patientData = [
    { firstName: "Bobur", lastName: "Toshmatov", phone: "+998901234567", gender: "male" as const, bloodType: "A+" as const, dateOfBirth: "1990-05-15", address: "Toshkent, Chilonzor" },
    { firstName: "Nilufar", lastName: "Rahimova", phone: "+998902345678", gender: "female" as const, bloodType: "B+" as const, dateOfBirth: "1985-08-22", address: "Toshkent, Yunusobod" },
    { firstName: "Jasur", lastName: "Mirzayev", phone: "+998903456789", gender: "male" as const, bloodType: "O+" as const, dateOfBirth: "1995-03-10", address: "Toshkent, Mirzo Ulug'bek" },
    { firstName: "Zulfiya", lastName: "Xasanova", phone: "+998904567890", gender: "female" as const, bloodType: "AB+" as const, dateOfBirth: "1978-11-30", address: "Samarqand" },
    { firstName: "Ulugbek", lastName: "Nazarov", phone: "+998905678901", gender: "male" as const, bloodType: "A-" as const, dateOfBirth: "2000-07-18", address: "Toshkent, Shayxontohur" },
  ];

  const insertedPatients = await db.insert(patients).values(patientData).returning();

  // Demo qabullar
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  await db.insert(appointments).values([
    { patientId: insertedPatients[0].id, doctorId: doctor1.id, appointmentDate: today, appointmentTime: "09:00", status: "confirmed", reason: "Bosh og'riq" },
    { patientId: insertedPatients[1].id, doctorId: doctor1.id, appointmentDate: today, appointmentTime: "10:00", status: "in_progress", reason: "Nazorat ko'rigi" },
    { patientId: insertedPatients[2].id, doctorId: doctor2.id, appointmentDate: today, appointmentTime: "11:00", status: "pending", reason: "Yurak tekshiruvi" },
    { patientId: insertedPatients[3].id, doctorId: doctor1.id, appointmentDate: today, appointmentTime: "14:00", status: "completed", reason: "Bosim o'lchash" },
    { patientId: insertedPatients[4].id, doctorId: doctor2.id, appointmentDate: tomorrow, appointmentTime: "09:30", status: "pending", reason: "EKG" },
  ]);

  return NextResponse.json({ success: true });
}