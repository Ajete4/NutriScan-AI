"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/profile";
import { LogOut, Settings, X } from "lucide-react";
import ProfilesCRUD from "./ProfilesCRUD"; // Importojmë komponentin e formës

interface TopBarProps {
  profile: Profile;
}

export default function TopBar({ profile }: TopBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-100">
              {getInitials()}
            </div>
            <h1 className="text-sm font-bold text-gray-900 hidden sm:block">
              NutriScan <span className="text-emerald-600">AI</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Butoni i Konfigurimit */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all border border-gray-100"
            >
              <Settings size={18} />
              <span className="hidden md:inline">Profili</span>
            </button>

            {/* Butoni Dil */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL I PROFILIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (e bën sfondin e errët) */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Përmbajtja e Modalit */}
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">Cilësimet e Profilit</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Thërrasim komponentin tënd të formës këtu */}
              <ProfilesCRUD />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
