import {
  pgTable, uuid, text, integer,
  boolean, timestamp, pgEnum, date,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "doctor", "receptionist"]);
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending", "confirmed", "in_progress", "completed", "cancelled"
]);
export const bloodTypeEnum = pgEnum("blood_type", [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
]);

// Staff (shifokor, registrator, admin)
export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("receptionist").notNull(),
  specialization: text("specialization"),
  phone: text("phone"),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bemorlar
export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: genderEnum("gender"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  bloodType: bloodTypeEnum("blood_type"),
  allergies: text("allergies"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Qabullar
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => staff.id).notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: appointmentStatusEnum("status").default("pending").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reseptlar
export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => staff.id).notNull(),
  diagnosis: text("diagnosis").notNull(),
  medications: text("medications").notNull(),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type Staff = typeof staff.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;