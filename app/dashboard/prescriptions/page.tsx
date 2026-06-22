"use client";

import { useEffect, useState, useCallback } from "react";
import { Patient } from "@/lib/schema";
import { Plus, X, Check, FileText, Pill } from "lucide-react";

type PrescriptionItem = {
  id: string;
  diagnosis: string;
  medications: string;
  instructions: string | null;
  createdAt: string;
  patientFirstName: string;
  patientLastName: string;
  doctorName: string;
};

type AppointmentOption = {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
};

const EMPTY_FORM = { appointmentId: "", patientId: "", diagnosis: "", medications: "", instructions: "" };

export default function PrescriptionsPage() {
  const [list, setList] = useState<PrescriptionItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [presRes, aptRes] = await Promise.all([
      fetch("/api/prescriptions"),
      fetch("/api/appointments"),
    ]);
    setList(await presRes.json());
    setAppointments(await aptRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAppointmentChange = (aptId: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    setForm({ ...form, appointmentId: aptId, patientId: apt?.patientId || "" });
  };

  const handleSave = async () => {
    if (!form.diagnosis || !form.medications || !form.patientId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/prescriptions", {
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

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reseptlar</h1>
          <p className="text-gray-500 text-sm mt-1">{list.length} ta resept</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-200"
        >
          <Plus size={16} />
          Resept yozish
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Resept yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {list.map((p) => (
              <div key={p.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Pill size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {p.patientFirstName} {p.patientLastName}
                      </p>
                      <p className="text-xs text-gray-400">Shifokor: {p.doctorName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <div className="mt-3 pl-12 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tashxis:</span> {p.diagnosis}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Dorilar:</span> {p.medications}
                  </p>
                  {p.instructions && (
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Ko'rsatma:</span> {p.instructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Yangi resept</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <select
                value={form.appointmentId}
                onChange={(e) => handleAppointmentChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Qabulni tanlang *</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.patientFirstName} {a.patientLastName}
                  </option>
                ))}
              </select>
              <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Tashxis *" rows={2} className={`${inputClass} resize-none`} />
              <textarea value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} placeholder="Dorilar *" rows={2} className={`${inputClass} resize-none`} />
              <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Ko'rsatmalar" rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Bekor</button>
              <button onClick={handleSave} disabled={saving || !form.diagnosis || !form.medications} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                <Check size={16} />
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}