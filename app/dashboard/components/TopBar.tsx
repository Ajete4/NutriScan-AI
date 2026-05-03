"use client";

import React, { useState } from "react";
import type { Profile } from "@/types/profile";
import { Settings, X, Bell, CalendarDays } from "lucide-react";
import ProfilesCRUD from "./ProfilesCRUD";

interface TopBarProps {
  profile: Profile | null;
  onProfileUpdated?: (profile: Profile) => void;
}

export default function TopBar({ profile, onProfileUpdated }: TopBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = () => {
    if (!profile?.full_name?.trim()) return "U";

    return profile.full_name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const displayName = profile?.full_name?.trim() || "User";

  return (
    <>
      <nav className="sticky top-16 lg:top-0 z-40 bg-[#fffaf0]/82 backdrop-blur-2xl border-b border-[#dcebd1] shadow-[0_14px_36px_rgba(37,51,34,0.06)]">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#71806b]">
              <CalendarDays size={13} />
              Today
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-950">
              Welcome back, {displayName.split(" ")[0]}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="relative p-3 rounded-2xl border border-[#dcebd1] bg-white/90 text-[#71806b] shadow-md shadow-[#5f7f3a]/10 hover:bg-[#fff3e2] hover:text-[#bd625c] hover:border-[#f8d5c9] hover:-translate-y-0.5 transition focus-ring"
              aria-label="Notifications coming soon"
              title="Notifications coming soon"
              type="button"
            >
              <Bell size={18} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 sm:gap-3 rounded-[1.35rem] border border-[#dcebd1] bg-white/90 px-2 py-2 sm:px-3 shadow-md shadow-[#5f7f3a]/10 hover:shadow-xl hover:shadow-[#5f7f3a]/15 hover:border-[#bcd3b1] hover:-translate-y-0.5 transition focus-ring"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3b4f23] via-[#5f7f3a] to-[#f28f7c] flex items-center justify-center text-white font-black shadow-md shadow-[#5f7f3a]/20 ring-1 ring-white/80">
                {getInitials()}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                  {displayName}
                </p>
                <p className="text-[11px] font-bold text-[#5f7f3a] uppercase tracking-wide">
                  Profile
                </p>
              </div>

              <Settings size={16} className="text-slate-400 hidden sm:block" />
            </button>
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-t-[2rem] sm:rounded-[2rem] border border-[#dcebd1] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-[#dcebd1] bg-gradient-to-r from-[#dff5df] to-white">
              <h2 className="text-lg font-black text-slate-900">
                Account Settings
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 focus-ring"
                aria-label="Close account settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[78vh] overflow-y-auto">
              <ProfilesCRUD onProfileUpdated={onProfileUpdated} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
