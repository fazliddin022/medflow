"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Activity, LayoutDashboard, Users,
  Calendar, FileText, Stethoscope,
  LogOut, Globe,
} from "lucide-react";
import { t, Lang } from "@/lib/i18n";

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("uz");
  const T = t[lang];

  const links = [
    { href: "/dashboard", label: T.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/patients", label: T.patients, icon: Users },
    { href: "/dashboard/appointments", label: T.appointments, icon: Calendar },
    { href: "/dashboard/doctors", label: T.doctors, icon: Stethoscope, adminOnly: true },
    { href: "/dashboard/prescriptions", label: T.prescriptions, icon: FileText },
  ].filter((l) => !l.adminOnly || role === "admin");

  return (
    <aside className="w-64 bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">MedFlow</p>
            <p className="text-xs text-gray-400">{T.tagline}</p>
          </div>
        </div>

        {/* User info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-blue-600 font-medium mt-0.5">
            {role === "admin" ? T.admin : role === "doctor" ? T.doctor : T.receptionist}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Lang + Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* Lang toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["uz", "ru", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === l ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          {T.logout}
        </button>
      </div>
    </aside>
  );
}