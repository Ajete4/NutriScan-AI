"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/profile";
import { Settings, X, Bell, Search } from "lucide-react";
import ProfilesCRUD from "./ProfilesCRUD"; 

interface TopBarProps {
  profile: Profile;
}

export default function TopBar({ profile }: TopBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-24 flex items-center justify-between">
          
          {/* Left Side: Search Bar (Premium UI Touch) */}
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl w-72 transition-all focus-within:ring-2 ring-emerald-500/10 focus-within:bg-white">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="bg-transparent border-none outline-none ml-3 text-sm font-medium text-gray-600 placeholder:text-gray-400 w-full"
            />
          </div>

          {/* Mobile Logo (Only shows when sidebar is hidden) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              N
            </div>
            <span className="font-black text-sm tracking-tighter">NUTRISCAN</span>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Notifications */}
            <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-emerald-600 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden md:block"></div>

            {/* Profile Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">
                {getInitials()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-gray-900 leading-tight">
                  {profile.full_name || "User Account"}
                </p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  {profile.diet_type || "Member"}
                </p>
              </div>
              <Settings size={16} className="text-gray-300 ml-2 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* PROFILE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header of Modal */}
            <div className="bg-gray-50/50 px-10 py-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Account Settings</h2>
                <p className="text-sm text-gray-500 font-medium">Update your physical metrics and goals</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-gray-400 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <ProfilesCRUD />
            </div>
          </div>
        </div>
      )}
    </>
  );
}