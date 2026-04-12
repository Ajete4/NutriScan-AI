"use client";

import React, { useState } from "react";
import type { Profile } from "@/types/profile";
import { Settings, X, Bell } from "lucide-react";
import ProfilesCRUD from "./ProfilesCRUD";

interface TopBarProps {
  profile: Profile | null;
}

export default function TopBar({ profile }: TopBarProps) {
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
      {/* TOPBAR */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between">

          {/* LEFT */}
          <div>
            <h1 className="text-lg sm:text-1xl font-black tracking-tight text-slate-800">
              Welcome back,
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {displayName}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notifications */}
            <button className="relative p-3 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-2 sm:px-3 hover:shadow-sm hover:border-slate-300 transition"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-bold">
                {getInitials()}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 uppercase">
                  Profile
                </p>
              </div>

              <Settings size={16} className="text-slate-400 hidden sm:block" />
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                Account Settings
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              <ProfilesCRUD />
            </div>
          </div>
        </div>
      )}
    </>
  );
}