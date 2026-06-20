"use client";

import { useEffect, useState, useCallback } from "react";
import { Patient } from "@/lib/schema";
import {
  Plus, Search, Pencil, Trash2, X, Check,
  Users, Phone, Mail, Droplet, MapPin,
} from "lucide-react";

const EMPTY_FORM = {
  firstName: "", lastName: "", phone: "", email: "",
  dateOfBirth: "", gender: "male", address: "",
  bloodType: "", allergies: "", notes: "",
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientsPage() {
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPatients = useCallback(async () => {
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatientList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleOpen = (patient?: Patient) => {
    if (patient) {
      setEditing(patient);
      setForm({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
        email: patient.email || "",
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "male",
        address: patient.address || "",
        bloodType: patient.bloodType || "",
        allergies: patient.allergies || "",
        notes: patient.notes || "",
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.phone) return;
    setSaving(true);

    try {
      if (editing) {
        const res = await fetch(`/api/patients/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setPatientList(patientList.map((p) => p.id === updated.id ? updated : p));
      } else {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setPatientList([created, ...patientList]);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bemorni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
    setPatientList(patientList.filter((p) => p.id !== id));
  };

  const filtered = patientList.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bemorlar</h1>
          <p className="text-gray-500 text-sm mt-1">{patientList.length} ta bemor</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-200"
        >
          <Plus size={16} />
          Bemor qo'shish
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki telefon raqami..."
          className={`${inputClass} pl-10`}
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Bemor topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-50">
            {filtered.map((patient) => (
              <div key={patient.id} className="bg-white p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {patient.gender === "male" ? "Erkak" : patient.gender === "female" ? "Ayol" : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpen(patient)} className="p-1.5 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(patient.id)} className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} />
                    {patient.phone}
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} />
                      {patient.email}
                    </div>
                  )}
                  {patient.bloodType && (
                    <div className="flex items-center gap-1.5">
                      <Droplet size={12} />
                      {patient.bloodType}
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {patient.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">
                {editing ? "Bemorni tahrirlash" : "Yangi bemor"}
              </h2>
              <button onClick={handleClose} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Ism *"
                  className={inputClass}
                />
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Familiya *"
                  className={inputClass}
                />
              </div>

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Telefon *"
                className={inputClass}
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className={inputClass}
                >
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
              </div>

              <select
                value={form.bloodType}
                onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                className={inputClass}
              >
                <option value="">Qon guruhi</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>

              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Manzil"
                className={inputClass}
              />

              <textarea
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="Allergiyalar"
                rows={2}
                className={`${inputClass} resize-none`}
              />

              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Izohlar"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                Bekor
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.firstName || !form.lastName || !form.phone}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl disabled:opacity-50"
              >
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