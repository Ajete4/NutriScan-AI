"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Droplets,
  Brain,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

import TopBar from "./components/TopBar";
import DailyStats from "./components/DailyStats";
import RecentLogs from "./components/RecentLogs";
import WaterTracker from "./components/WaterTracker";
import AIRecommendations from "./components/AIRecommendations";
import ProgressChart from "./components/ProgressChart";
import MealScanner from "./components/MealScanner";

import type { Profile } from "@/types/profile";
import type { AIPlan } from "@/types/ai";
import { useUserProfile } from "../hooks/UseUserProfile";

type AIResponse = {
  daily_plan: string[];
  weekly_plan: string[];
  monthly_tips: string[];
};

type TabId = "dashboard" | "progress" | "water" | "ai";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();

  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !profile) return;
    initializeDashboard();
  }, [user, profile]);

  const initializeDashboard = async () => {
    setLoadingPage(true);
    setError(null);

    try {
      if (!profile) {
        setError("Profile not found.");
        return;
      }

      if (!profile.gender || !profile.goal || !profile.activity_level) {
        setError("Profile is incomplete. Please update your information.");
        return;
      }

      const { data: existingPlan, error: planError } = await supabase
        .from("ai_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) {
        setError("Error loading AI plan.");
        return;
      }

      if (existingPlan) {
        setPlan(existingPlan as AIPlan);
        return;
      }

      const aiData = await generateAIPlan(profile);
      if (!aiData) {
        setError("AI plan could not be generated.");
        return;
      }

      const { data: savedPlan, error: insertError } = await supabase
        .from("ai_plans")
        .insert({
          user_id: user!.id,
          daily_plan: aiData.daily_plan,
          weekly_plan: aiData.weekly_plan,
          monthly_tips: aiData.monthly_tips,
        })
        .select()
        .single();

      if (insertError) {
        setError("Error saving AI plan.");
        return;
      }

      setPlan(savedPlan as AIPlan);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unexpected dashboard error.");
    } finally {
      setLoadingPage(false);
    }
  };

  const generateAIPlan = async (
    profile: Profile
  ): Promise<AIResponse | null> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        router.push("/login");
        return null;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error("AI error:", errText);
        setError("Server did not respond correctly.");
        return null;
      }

      return (await res.json()) as AIResponse;
    } catch (err) {
      console.error("AI fetch failed:", err);
      setError("No internet connection. Please try again.");
      return null;
    }
  };

  const menuItems: {
    id: TabId;
    label: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      color: "text-emerald-600",
    },
    {
      id: "progress",
      label: "Progress",
      icon: BarChart3,
      color: "text-orange-500",
    },
    {
      id: "water",
      label: "Hydration",
      icon: Droplets,
      color: "text-sky-500",
    },
    {
      id: "ai",
      label: "AI Coach",
      icon: Brain,
      color: "text-violet-500",
    },
  ];

  if (authLoading || profileLoading || loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf8]">
        <div className="bg-white border border-slate-200 rounded-3xl px-6 py-4 shadow-sm">
          <p className="text-emerald-700 font-semibold">Loading NutriScan...</p>
        </div>
      </div>
    );
  }

  if (profileError || error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf8] px-6">
        <div className="w-full max-w-md bg-white border border-red-100 rounded-3xl p-6 shadow-sm text-center">
          <p className="text-red-600 font-semibold">
            {profileError || error || "No profile found."}
          </p>

          <button
            onClick={() => initializeDashboard()}
            className="mt-4 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-black shadow-md">
              N
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                NutriScan <span className="text-emerald-600">AI</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Smart nutrition
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-2xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-emerald-50 to-sky-50 text-slate-900 border-emerald-100 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={item.color} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 shadow-sm flex-col px-6 py-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-black shadow-md">
              N
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                NutriScan <span className="text-emerald-600">AI</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Smart nutrition
              </p>
            </div>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-emerald-50 to-sky-50 text-slate-900 border-emerald-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <item.icon size={18} className={item.color} />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-h-screen">
          <TopBar profile={profile} />

          <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
                >
                  <div className="xl:col-span-8 space-y-6">
                    <DailyStats profile={profile} />
                    <RecentLogs />
                  </div>

                  <div className="xl:col-span-4">
                    <div className="xl:sticky xl:top-24">
                      <MealScanner />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "progress" && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <ProgressChart />
                </motion.div>
              )}

              {activeTab === "water" && (
                <motion.div
                  key="water"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <WaterTracker />
                </motion.div>
              )}

              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {plan ? (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-[2rem] p-4 sm:p-6 shadow-sm">
                      <AIRecommendations plan={plan} />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-[2rem] p-6 shadow-sm">
                      <p className="text-violet-700 font-medium">
                        AI plan is being generated or unavailable.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}