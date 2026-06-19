import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { patients, appointments, staff } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { Users, Calendar, CheckCircle, Clock, Stethoscope, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const today = new Date().toISOString().split("T")[0];

  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    allAppointments,
  ] = await Promise.all([
    db.select().from(patients),
    db.select().from(staff).where(eq(staff.role, "doctor")),
    db.select({
      id: appointments.id,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
      reason: appointments.reason,
      patientId: appointments.patientId,
    }).from(appointments).where(eq(appointments.appointmentDate, today)),
    db.select().from(appointments).where(
      and(eq(appointments.appointmentDate, today), eq(appointments.status, "pending"))
    ),
    db.select().from(appointments).where(
      and(eq(appointments.appointmentDate, today), eq(appointments.status, "completed"))
    ),
    db.select().from(appointments),
  ]);

  const stats = [
    { label: "Jami bemorlar", value: totalPatients.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Shifokorlar", value: totalDoctors.length, icon: Stethoscope, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
    { label: "Bugungi qabullar", value: todayAppointments.length, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Kutmoqda", value: pendingAppointments.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Tugadi", value: completedAppointments.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Jami qabullar", value: allAppointments.length, icon: Activity, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-orange-50 text-orange-600 border-orange-100",
    confirmed: "bg-blue-50 text-blue-600 border-blue-100",
    in_progress: "bg-purple-50 text-purple-600 border-purple-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "Kutmoqda",
    confirmed: "Tasdiqlangan",
    in_progress: "Qabulda",
    completed: "Tugadi",
    cancelled: "Bekor",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Salom, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-5`}>
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bugungi qabullar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Bugungi qabullar</h2>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {today}
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Bugun qabul yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{apt.appointmentTime}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {apt.reason || "Umumiy ko'rik"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[apt.status]}`}>
                  {STATUS_LABELS[apt.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}