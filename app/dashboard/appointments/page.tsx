"use client";

import { useEffect, useState, useCallback } from "react";
import { Patient, Staff } from "@/lib/schema";
import {
  Plus, X, Check, Trash2, Calendar,
  Clock, User, Stethoscope,
} from "lucide-react";

type AppointmentItem = {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason: string | null;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Kutmoqda", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { value: "confirmed", label: "Tasdiqlangan", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { value: "in_progress", label: "Qabulda", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { value: "completed", label: "Tugadi", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { value: "cancelled", label: "Bekor qilindi", color: "bg-red-50 text-red-600 border-red-100" },
];

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  appointmentDate: new Date().toISOString().split("T")[0],
  appointmentTime: "09:00",
  reason: "",
};

export default function AppointmentsPage() {
  const [appointmentList, setAppointmentList] = useState<AppointmentItem[]>([]);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [doctorList, setDoctorList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    const [aptRes, patRes, docRes] = await Promise.all([
      fetch("/api/appointments"),
      fetch("/api/patients"),
      fetch("/api/doctors"),
    ]);
    setAppointmentList(await aptRes.json());
    setPatientList(await patRes.json());
    setDoctorList(await docRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!form.patientId || !form.doctorId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await res.json();
      await fetchData();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setAppointmentList(appointmentList.map((a) => a.id === id ? { ...a, status } : a));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Qabulni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setAppointmentList(appointmentList.filter((a) => a.id !== id));
  };

  const filtered = appointmentList.filter((a) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchDate = !filterDate || a.appointmentDate === filterDate;
    return matchStatus && matchDate;
  });

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Qabullar</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} ta qabul</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-200"
        >
          <Plus size={16} />
          Qabul belgilash
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={`${inputClass} w-auto`}
        />
        <div className="flex gap-2 flex-wrap">
          {[{ value: "all", label: "Hammasi" }, ...STATUS_OPTIONS].map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === s.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Qabul topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((apt) => {
              const statusConfig = STATUS_OPTIONS.find((s) => s.value === apt.status);
              return (
                <div key={apt.id} className="flex items-center justify-between px-6 py-4 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-blue-50 rounded-xl px-3 py-2 min-w-[70px]">
                      <p className="text-xs text-blue-400 font-medium">{apt.appointmentDate.slice(5)}</p>
                      <p className="text-sm font-bold text-blue-600">{apt.appointmentTime}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {apt.patientFirstName} {apt.patientLastName}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Stethoscope size={11} />
                        {apt.doctorName} {apt.doctorSpecialization && `· ${apt.doctorSpecialization}`}
                      </p>
                      {apt.reason && (
                        <p className="text-xs text-gray-500 mt-0.5">{apt.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer ${statusConfig?.color}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Qabul belgilash</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bemor *</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Tanlang...</option>
                  {patientList.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Shifokor *</label>
                <select
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Tanlang...</option>
                  {doctorList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} {d.specialization && `(${d.specialization})`}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.appointmentDate}
                  onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="time"
                  value={form.appointmentTime}
                  onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                  className={inputClass}
                />
              </div>

              <input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Sabab (masalan: Bosh og'riq)"
                className={inputClass}
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                Bekor
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.patientId || !form.doctorId}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? "Saqlanmoqda..." : "Belgilash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}