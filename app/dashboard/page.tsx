"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Leaf,
  Sparkles,
  Crown,
  Target,
  Activity,
} from "lucide-react";


import { supabase } from "@/lib/supabaseClient";
import {
  normalizeAIPlanData,
  normalizeAIPlanRow,
  type AIPlanRow,
} from "@/lib/aiPlan";
import { useAuth } from "../context/AuthContext";

import TopBar from "./components/TopBar";
import DailyStats from "./components/DailyStats";
import RecentLogs from "./components/RecentLogs";
import WaterTracker from "./components/WaterTracker";
import AIRecommendations from "./components/AIRecommendations";
import ProgressChart from "./components/ProgressChart";
import MealScanner from "./components/MealScanner";
import HealthInsights from "./components/HealthInsights";

import type { Profile } from "@/types/profile";
import type { AIPlan, AIPlanData } from "@/types/ai";
import { useUserProfile } from "../hooks/UseUserProfile";

type TabId = "dashboard" | "progress" | "water" | "ai";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    setProfile,
  } = useUserProfile();

  const [plan, setPlan] = useState<AIPlan | AIPlanData | null>(null);
  const [plansHistory, setPlansHistory] = useState<AIPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mealRefreshKey, setMealRefreshKey] = useState(0);

  const hasInitializedRef = useRef(false);
  const hasRedirectedToSetupRef = useRef(false);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const initializeDashboard = useCallback(async () => {
    setLoadingPage(true);
    setError(null);

    try {
      if (!profile) {
        setError("Profile not found.");
        return;
      }

      if (!profile.gender || !profile.goal || !profile.activity_level) {
        setError("Your profile is incomplete. Please update your information first.");
        return;
      }

      const { data: existingPlans, error: planError } = await supabase
        .from("ai_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (planError) {
        console.error("Error loading AI plans:", planError);
        setError("We couldn't load your AI plans. Please try again.");
        return;
      }

      if (existingPlans && existingPlans.length > 0) {
        const typedPlans = (existingPlans as AIPlanRow[]).map(normalizeAIPlanRow);
        setPlansHistory(typedPlans);
        setPlan(typedPlans[0]);
        setSelectedPlanId(typedPlans[0].id);
        return;
      }

      setPlan(null);
      setPlansHistory([]);
      setSelectedPlanId(null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Something went wrong while loading your dashboard.");
    } finally {
      setLoadingPage(false);
    }
  }, [profile, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (profileError) {
      setLoadingPage(false);
      return;
    }
    if (!user || profile || profileError || hasRedirectedToSetupRef.current) return;

    hasRedirectedToSetupRef.current = true;
    router.replace("/setup");
  }, [authLoading, profileLoading, profileError, profile, router, user]);

  useEffect(() => {
    if (!user?.id) {
      hasInitializedRef.current = false;
      hasRedirectedToSetupRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user || !profile || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    initializeDashboard();
  }, [user, profile, initializeDashboard]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const generateAIPlan = async (
    profile: Profile
  ): Promise<AIPlanData | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Your session expired. Please log in again.");
        router.push("/login");
        return null;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      });

      if (res.status === 401) {
        setError("Your session expired. Please log in again.");
        router.push("/login");
        return null;
      }

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After") || "60";
        setError(`Too many requests. Please wait ${retryAfter} seconds.`);
        return null;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error("AI error:", errText);
        setError("The AI service did not respond correctly.");
        return null;
      }

      return (await res.json()) as AIPlanData;
    } catch (err) {
      console.error("AI fetch failed:", err);
      setError("No internet connection or AI service unavailable. Please try again.");
      return null;
    }
  };

  const handleGenerateNewPlan = async () => {
    if (!profile || generatingPlan) return;

    try {
      setGeneratingPlan(true);
      setError(null);
      setSuccessMessage(null);

      const aiData = await generateAIPlan(profile);

      if (!aiData) {
        setError((currentError) => currentError || "We couldn't generate a new AI plan right now.");
        return;
      }

      setPlan(normalizeAIPlanData(aiData));
      setSelectedPlanId(null);
      showSuccessMessage("New AI plan generated successfully.");
    } catch (err) {
      console.error("Generate plan error:", err);
      setError("Something went wrong while generating your AI plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleSavePlan = async () => {
    if (savingPlan || selectedPlanId) return;

    if (!plan) return;

    try {
      setSavingPlan(true);
      setError(null);
      setSuccessMessage(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        setError("Your session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const normalizedPlan = normalizeAIPlanData(plan);

      const insertPayload = {
        user_id: session.user.id,
        daily_plan: normalizedPlan.daily_plan,
        weekly_plan: normalizedPlan.weekly_plan,
        monthly_tips: normalizedPlan.monthly_tips,
        explanation: normalizedPlan.explanation,
      };

      const { data, error: insertError } = await supabase
        .from("ai_plans")
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "42501") {
          setError("Permission denied. Please re-login.");
          return;
        }

        if (insertError.code === "PGRST204") {
          const missingColumn = insertError.message.match(/'([^']+)' column/)?.[1];
          setError(
            missingColumn
              ? `Database schema mismatch. Missing column: ${missingColumn}.`
              : "Database schema mismatch. Contact admin."
          );
          return;
        }

        throw insertError;
      }

      if (!data) {
        throw new Error("Save plan returned no row after insert/select.");
      }

      const savedPlan = normalizeAIPlanRow(data as AIPlanRow);

      setPlan(savedPlan);
      setSelectedPlanId(savedPlan.id);
      setPlansHistory((prev) => [savedPlan, ...prev]);
      showSuccessMessage("AI plan saved successfully.");
    } catch (err) {
      console.error("Unexpected save plan error:", err);
      setError("Something went wrong while saving your AI plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSelectPlan = (selectedPlan: AIPlan) => {
    setPlan(selectedPlan);
    setSelectedPlanId(selectedPlan.id);
    setSuccessMessage(null);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!user) return;

    try {
      setDeletingPlanId(planId);
      setError(null);
      setSuccessMessage(null);

      const { error: deleteError } = await supabase
        .from("ai_plans")
        .delete()
        .eq("id", planId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Delete plan error:", deleteError);
        setError("We couldn't delete your AI plan. Please try again.");
        return;
      }

      const nextPlans = plansHistory.filter((p) => p.id !== planId);
      setPlansHistory(nextPlans);

      if (selectedPlanId === planId) {
        if (nextPlans.length > 0) {
          setPlan(nextPlans[0]);
          setSelectedPlanId(nextPlans[0].id);
        } else {
          setPlan(null);
          setSelectedPlanId(null);
        }
      }

      showSuccessMessage("AI plan deleted successfully.");
    } catch (err) {
      console.error("Delete plan exception:", err);
      setError("Something went wrong while deleting your AI plan.");
    } finally {
      setDeletingPlanId(null);
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
      color: "text-[#5f7f3a]",
    },
    {
      id: "progress",
      label: "Progress",
      icon: BarChart3,
      color: "text-[#f28f7c]",
    },
    {
      id: "water",
      label: "Hydration",
      icon: Droplets,
      color: "text-[#8fa58a]",
    },
    {
      id: "ai",
      label: "AI Coach",
      icon: Brain,
      color: "text-[#bd625c]",
    },
  ];

  if (authLoading || profileLoading || (!profileError && loadingPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8ea] px-6">
        <div className="wellness-surface rounded-[2rem] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-[#dff5df] text-[#5f7f3a] flex items-center justify-center">
              <Leaf size={18} />
            </div>
            <p className="text-[#3b4f23] font-bold">Loading NutriScan AI...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8ea] px-6">
        <div className="w-full max-w-md bg-white/95 border border-red-100 rounded-[2rem] p-6 shadow-xl shadow-red-950/5 text-center">
          <p className="text-red-600 font-semibold">
            {profileError || error || "No profile found."}
          </p>

          <button
            onClick={() => {
              hasInitializedRef.current = false;
              initializeDashboard();
            }}
            className="mt-4 px-5 py-3 rounded-2xl bg-[#5f7f3a] text-white font-bold hover:bg-[#4d6b2f] transition focus-ring"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(95,127,58,0.14),transparent_26rem),radial-gradient(circle_at_90%_8%,rgba(242,143,124,0.14),transparent_24rem),linear-gradient(180deg,#fffaf0_0%,#edf7e8_58%,#fff8ea_100%)] text-slate-900">
      <div className="lg:hidden sticky top-0 z-50 bg-[#fffaf0]/90 backdrop-blur-2xl border-b border-[#dcebd1] shadow-[0_12px_30px_rgba(37,51,34,0.08)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-[1.35rem] bg-gradient-to-br from-[#3b4f23] via-[#5f7f3a] to-[#f28f7c] flex items-center justify-center text-white shadow-xl shadow-[#5f7f3a]/25 ring-1 ring-white/70">
              <Leaf size={21} />
              <Sparkles size={11} className="absolute right-2 top-2" />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                NutriScan <span className="text-[#5f7f3a]">AI</span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2.5 rounded-2xl border border-[#dcebd1] bg-[#fffaf0]/90 shadow-sm hover:bg-[#dff5df] transition focus-ring"
            aria-label="Toggle navigation"
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
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl border text-sm font-bold transition focus-ring ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#dff5df] to-[#fff3e2] text-slate-950 border-[#bcd3b1] shadow-sm"
                    : "bg-white/85 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={item.color} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0">
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[19rem] bg-[#fffaf0]/88 backdrop-blur-2xl border-r border-[#dcebd1] shadow-[18px_0_60px_rgba(37,51,34,0.07)] flex-col px-5 py-7">
          <div className="flex items-center gap-3 mb-7 px-2">
            <div className="relative h-[3.25rem] w-[3.25rem] rounded-[1.6rem] bg-gradient-to-br from-[#3b4f23] via-[#5f7f3a] to-[#f28f7c] flex items-center justify-center text-white shadow-2xl shadow-[#5f7f3a]/25 ring-1 ring-white/80">
              <Leaf size={23} />
              <Sparkles size={12} className="absolute right-2.5 top-2.5" />
            </div>

            <div>
              <h2 className="text-[1.35rem] leading-tight font-black tracking-tight text-slate-950">
                NutriScan <span className="text-[#5f7f3a]">AI</span>
              </h2>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#bd625c]">
                <Crown size={11} />
                Premium
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-[#dcebd1] bg-white/70 px-3 py-3 shadow-sm">
              <div className="mb-2 h-7 w-7 rounded-xl bg-[#dff5df] text-[#5f7f3a] flex items-center justify-center">
                <Target size={14} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Goal
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-900">
                {profile.goal}
              </p>
            </div>

            <div className="rounded-2xl border border-[#f8d5c9] bg-[#fff3e2]/70 px-3 py-3 shadow-sm">
              <div className="mb-2 h-7 w-7 rounded-xl bg-white text-[#bd625c] flex items-center justify-center">
                <Activity size={14} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Mode
              </p>
              <p className="mt-1 truncate text-sm font-black capitalize text-slate-900">
                {profile.activity_level?.replace("_", " ")}
              </p>
            </div>
          </div>

          <nav className="space-y-2.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-bold premium-hover focus-ring ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#3b4f23] via-[#5f7f3a] to-[#8fa58a] text-white border-[#5f7f3a] shadow-xl shadow-[#5f7f3a]/25"
                    : "text-slate-500 hover:bg-white/90 hover:text-slate-950 border border-transparent"
                }`}
              >
                <span className={`h-9 w-9 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${activeTab === item.id ? "bg-white/20 text-white" : "bg-white border border-[#dcebd1]"}`}>
                  <item.icon size={18} className={activeTab === item.id ? "text-white" : item.color} />
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() =>
              supabase.auth.signOut().then(() => router.push("/login"))
            }
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition focus-ring"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1 lg:ml-[19rem] min-h-screen">
          <TopBar profile={profile} onProfileUpdated={setProfile} />

          <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-5 md:px-7 lg:px-8 xl:px-10 lg:py-8">
            {successMessage && (
              <div className="mb-4 rounded-2xl border border-[#bcd3b1] bg-[#dff5df]/90 px-4 py-3 text-sm text-[#3b4f23] font-bold shadow-sm">
                {successMessage}
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12 xl:gap-8 items-start"
                >
                  <div className="xl:col-span-8 space-y-4 sm:space-y-6 min-w-0">
                    <DailyStats profile={profile} refreshKey={mealRefreshKey} />
                    <HealthInsights profile={profile} />
                    <RecentLogs
                      refreshKey={mealRefreshKey}
                      onMealDeleted={() =>
                        setMealRefreshKey((current) => current + 1)
                      }
                    />
                  </div>

                  <div className="xl:col-span-4 min-w-0">
                    <div className="xl:sticky xl:top-24">
                      <MealScanner
                        onMealSaved={() =>
                          setMealRefreshKey((current) => current + 1)
                        }
                      />
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
                  <AIRecommendations
                    plan={plan}
                    plansHistory={plansHistory}
                    selectedPlanId={selectedPlanId}
                    generating={generatingPlan}
                    saving={savingPlan}
                    deletingPlanId={deletingPlanId}
                    mealFrequency={profile.meal_frequency}
                    onGenerateNew={handleGenerateNewPlan}
                    onSavePlan={handleSavePlan}
                    onSelectPlan={handleSelectPlan}
                    onDeletePlan={handleDeletePlan}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
