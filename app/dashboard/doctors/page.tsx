"use client";

import { useEffect, useState, useCallback } from "react";
import { Staff } from "@/lib/schema";
import { Plus, X, Check, Trash2, Stethoscope, Phone, Mail } from "lucide-react";

const EMPTY_FORM = { name: "", email: "", password: "", specialization: "", phone: "" };

export default function DoctorsPage() {
  const [doctorList, setDoctorList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    const res = await fetch("/api/doctors");
    const data = await res.json();
    setDoctorList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setDoctorList([...doctorList, created]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Shifokorni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    setDoctorList(doctorList.filter((d) => d.id !== id));
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Shifokorlar</h1>
          <p className="text-gray-500 text-sm mt-1">{doctorList.length} ta shifokor</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-200"
        >
          <Plus size={16} />
          Shifokor qo'shish
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctorList.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{doctor.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{doctor.specialization}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(doctor.id)} className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Mail size={12} />
                  {doctor.email}
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} />
                    {doctor.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Yangi shifokor</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="To'liq ism *" className={inputClass} />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *" className={inputClass} />
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Parol (default: doctor123)" className={inputClass} />
              <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Mutaxassislik" className={inputClass} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon" className={inputClass} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Bekor</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.email} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl disabled:opacity-50">
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