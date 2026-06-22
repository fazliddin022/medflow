import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const doctors = await db.select().from(staff).where(eq(staff.role, "doctor"));
  return NextResponse.json(doctors);
}