"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

import TopBar from "./components/TopBar";
import DailyStats from "./components/DailyStats"; // path i ri
import { Profile } from "@/types/profile";
import RecentLogs from "./components/RecentLogs";
import HealthInsights from "./components/HealthInsights";
import WaterTracker from "./components/WaterTracker";



export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Kontrolli i login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Nxjerrja e profile nga Supabase
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Gabim duke marrë profile:", error);
      }
      setProfile(data || null);
      setLoadingProfile(false);
    }

    if (user) fetchProfile();
  }, [user]);

  if (loading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-lg">Profile not found. Please complete setup.</p>
      </div>
    );
  }

  return (
  <main className="bg-gray-50 min-h-screen text-gray-900 pb-20">
    <TopBar profile={profile} />

    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header-i me Mirëseardhje */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Mirë se vini, {profile.full_name?.split(' ')[0] || "Përdorues"}! 👋
        </h1>
        <p className="text-gray-500 font-medium">Sot është një ditë e shkëlqyer për të ngrënë shëndetshëm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolona Kryesore (E Majta - 8/12 rreshta) */}
        <div className="lg:col-span-8 space-y-8">
          <DailyStats profile={profile} />
          <RecentLogs />
        </div>

        {/* Kolona Anësore (E Djathta - 4/12 rreshta) */}
        <div className="lg:col-span-4 space-y-8">
          <HealthInsights profile={profile} />
          <WaterTracker />
          
          {/* Quick Tip Card */}
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
            <h4 className="text-emerald-900 font-black text-xs uppercase mb-2">Këshilla e ditës</h4>
            <p className="text-emerald-700 text-sm font-medium italic">
              Konsumimi i fibrave në mëngjes ndihmon në mbajtjen e energjisë stabile gjatë gjithë ditës.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
);
}
