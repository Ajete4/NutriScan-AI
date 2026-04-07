"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import { LayoutDashboard, BarChart3, Droplets, Brain, LogOut } from "lucide-react";

// Components
import TopBar from "./components/TopBar";
import DailyStats from "./components/DailyStats";
import RecentLogs from "./components/RecentLogs";
import WaterTracker from "./components/WaterTracker";
import AIRecommendations from "./components/AIRecommendations";
import ProgressChart from "./components/ProgressChart";

import { Profile } from "@/types/profile";
import { AIPlan } from "@/types/ai";

type AIResponse = {
  daily_plan: string[];
  weekly_plan: string[];
  monthly_tips: string[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) initializeDashboard();
  }, [user, loading]);

  const initializeDashboard = async () => {
    try {
      // FETCH PROFILE
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error("Profile error:", profileError);
        return;
      }
      setProfile(profileData);

      // CHECK EXISTING PLAN
      const { data: existingPlan } = await supabase
        .from("ai_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<AIPlan>();

      if (existingPlan) {
        setPlan(existingPlan);
        setLoadingPage(false);
        return;
      }

      // GENERATE AI PLAN
      const aiData = await generateAIPlan(profileData);
      if (!aiData) return;

      // SAVE PLAN
      const { data: savedPlan, error: insertError } = await supabase
        .from("ai_plans")
        .insert({
          user_id: user!.id,
          daily_plan: aiData.daily_plan,
          weekly_plan: aiData.weekly_plan,
          monthly_tips: aiData.monthly_tips,
        })
        .select()
        .single<AIPlan>();

      if (insertError) {
        console.error("Insert error:", insertError);
        return;
      }

      setPlan(savedPlan);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoadingPage(false);
    }
  };

  const generateAIPlan = async (profile: Profile): Promise<AIResponse | null> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("AI error:", errText);
        return null;
      }
      return (await res.json()) as AIResponse;
    } catch (err) {
      console.error("AI fetch failed:", err);
      return null;
    }
  };

  // MENU (larguam Meal Plan)
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "progress", label: "Analytics", icon: BarChart3 },
    { id: "water", label: "Hydration", icon: Droplets },
    { id: "ai", label: "AI Insights", icon: Brain },
  ];

  if (loading || loadingPage) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-emerald-600">
        Loading NutriScan...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col p-8 z-50">
        <div className="mb-12 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tighter">
            NUTRISCAN<span className="text-emerald-600 italic">AI</span>
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() =>
            supabase.auth.signOut().then(() => router.push("/login"))
          }
          className="flex items-center gap-4 px-5 py-4 text-gray-400 font-bold hover:text-red-500 transition-colors mt-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        <TopBar profile={profile!} />

        <div className="p-6 md:p-10 max-w-[1200px] mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DailyStats profile={profile!} />
                <RecentLogs />
              </motion.div>
            )}

            {activeTab === "progress" && (
              <motion.div key="progress">
                <ProgressChart /> {/* nuk i kalojmë plan, përdor mock data */}
              </motion.div>
            )}
            {activeTab === "water" && (
              <motion.div key="water">
                <WaterTracker />
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div key="ai">
                {plan ? (
                  <AIRecommendations plan={plan} />
                ) : (
                  <p className="text-gray-500">
                    AI plan is being generated or unavailable...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
