"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import {
  CheckCircle2,
  Droplets,
  Minus,
  Plus,
  Sparkles,
  Trophy,
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserProfile } from "../../hooks/UseUserProfile";

type WaterLog = {
  id: string;
  user_id: string;
  glasses: number;
  total_ml: number;
  log_date: string;
  created_at: string;
  updated_at: string;
};

const ML_PER_GLASS = 250;

export default function WaterTracker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const targetMl = useMemo(() => {
    if (profile?.weight && profile.weight > 0) {
      return Math.round(profile.weight * 35);
    }
    return 2500;
  }, [profile?.weight]);

  const goalGlasses = useMemo(() => {
    return Math.max(1, Math.ceil(targetMl / ML_PER_GLASS));
  }, [targetMl]);

  const glasses = waterLog?.glasses ?? 0;
  const totalMl = waterLog?.total_ml ?? 0;
  const progress = Math.min(Math.round((totalMl / targetMl) * 100), 100);
  const isGoalReached = progress >= 100;

  useEffect(() => {
    const fetchTodayWater = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("water_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("log_date", today)
          .maybeSingle();

        if (error) {
          setError(error.message);
          return;
        }

        setWaterLog((data as WaterLog | null) ?? null);
      } catch (err) {
        console.error(err);
        setError("Failed to load water data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayWater();
  }, [user, today]);

  const saveWaterLog = async (nextGlasses: number) => {
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const nextTotalMl = nextGlasses * ML_PER_GLASS;

      const payload = {
        user_id: user.id,
        log_date: today,
        glasses: nextGlasses,
        total_ml: nextTotalMl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("water_logs")
        .upsert(payload, {
          onConflict: "user_id,log_date",
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setWaterLog(data as WaterLog);
    } catch (err) {
      console.error(err);
      setError("Failed to save water log.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddGlass = async () => {
    await saveWaterLog(glasses + 1);
  };

  const handleRemoveGlass = async () => {
    await saveWaterLog(Math.max(glasses - 1, 0));
  };

  if (loading) {
    return (
      <div className="wellness-surface rounded-[2rem] p-6">
        <p className="text-slate-500 font-medium">Loading hydration data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-100 rounded-[2rem] p-6 shadow-sm">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl min-w-0 space-y-4 sm:space-y-6">
      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-6 lg:gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="wellness-surface premium-card rounded-[2rem] sm:rounded-[2.25rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#e5ecdf]/90 blur-3xl" />
          <div className="absolute -left-20 bottom-10 h-52 w-52 rounded-full bg-[#dff5df]/70 blur-3xl" />

          <div className="relative min-w-0 space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 bg-[#e5ecdf] border border-[#cfdac8] text-[#71806b] px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.14em]">
                  <Droplets size={14} />
                  Hydration Tracker
                </div>

                <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-950 mt-3 tracking-tight">
                  Water Intake
                </h3>

                <p className="text-sm text-slate-500 mt-1 break-words">
                  Stay hydrated and track your daily water goal.
                </p>
              </div>

              <div
                className={`rounded-[1.35rem] px-5 py-4 text-left sm:text-right w-full sm:w-auto min-w-0 sm:min-w-[170px] border shadow-xl shadow-slate-900/5 ${
                  isGoalReached
                    ? "bg-[#dff5df] border-[#bcd3b1]"
                    : "bg-[#e5ecdf] border-[#cfdac8]"
                }`}
              >
                <p
                  className={`text-2xl font-black ${
                    isGoalReached ? "text-[#5f7f3a]" : "text-[#71806b]"
                  }`}
                >
                  {totalMl}
                  <span
                    className={`text-xs ml-1 font-bold ${
                      isGoalReached ? "text-[#5f7f3a]" : "text-[#71806b]"
                    }`}
                  >
                    ml
                  </span>
                </p>
                <p className="text-[11px] uppercase tracking-wide font-bold text-slate-400 mt-1">
                  Goal: {targetMl} ml
                </p>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500 mb-2">
                <span>Current: {totalMl} ml</span>
                <span>Goal: {targetMl} ml</span>
              </div>

              <div className="h-4 w-full rounded-full bg-white/80 overflow-hidden shadow-inner border border-[#edf1e8]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isGoalReached
                      ? "bg-gradient-to-r from-[#8fa58a] via-[#5f7f3a] to-[#3b4f23]"
                      : "bg-gradient-to-r from-[#cfdac8] via-[#8fa58a] to-[#5f7f3a]"
                  }`}
                />
              </div>

              <p className="text-sm text-slate-500 font-medium mt-3">
                You have reached{" "}
                <span
                  className={`font-bold ${
                    isGoalReached ? "text-[#5f7f3a]" : "text-[#71806b]"
                  }`}
                >
                  {progress}%
                </span>{" "}
                of today&apos;s hydration goal.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] sm:flex sm:flex-wrap gap-2.5">
              {[...Array(goalGlasses)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-12 rounded-xl border-2 overflow-hidden flex items-end shadow-sm transition hover:-translate-y-0.5 ${
                    i < glasses
                      ? isGoalReached
                        ? "border-[#5f7f3a] bg-[#dff5df]"
                        : "border-[#8fa58a] bg-[#e5ecdf]"
                      : "border-slate-200 bg-white/70"
                  }`}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: i < glasses ? "100%" : "0%" }}
                    className={`w-full ${
                      isGoalReached
                        ? "bg-gradient-to-t from-[#5f7f3a] to-[#8fa58a]"
                        : "bg-gradient-to-t from-[#71806b] to-[#cfdac8]"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRemoveGlass}
                disabled={saving || glasses === 0}
                className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 transition disabled:opacity-50 focus-ring"
                aria-label="Remove glass"
              >
                <Minus size={20} />
              </button>

              <button
                onClick={handleAddGlass}
                disabled={saving}
                className={`flex-1 py-4 rounded-2xl text-white font-bold transition hover:-translate-y-0.5 disabled:opacity-70 inline-flex items-center justify-center gap-2 shadow-xl ${
                  isGoalReached
                    ? "bg-[#5f7f3a] hover:bg-[#4d6b2f] shadow-[#5f7f3a]/20"
                    : "bg-[#8fa58a] hover:bg-[#71806b] shadow-[#8fa58a]/20"
                } focus-ring`}
              >
                {saving ? (
                  <>
                    <Waves size={18} className="animate-pulse" />
                    Saving...
                  </>
                ) : isGoalReached ? (
                  <>
                    <Trophy size={18} />
                    Goal Reached
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Glass
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="min-w-0 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2rem] p-4 sm:p-5 shadow-lg shadow-slate-900/5 border premium-hover ${
              isGoalReached
                ? "bg-gradient-to-br from-[#dff5df] to-[#edf7e8] border-[#bcd3b1]"
                : "bg-white/90 border-slate-200"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 border ${
                isGoalReached
                  ? "bg-[#dff5df] text-[#5f7f3a] border-[#bcd3b1]"
                  : "bg-[#fff3e2] text-[#bd625c] border-[#f8d5c9]"
              }`}
            >
              {isGoalReached ? (
                <CheckCircle2 size={20} />
              ) : (
                <Trophy size={20} />
              )}
            </div>

            <h4 className="text-lg font-black text-slate-950">
              {isGoalReached ? "Hydration Complete" : "Today's Status"}
            </h4>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed break-words">
              {isGoalReached
                ? "Great job. You reached your hydration goal today and kept your routine on track."
                : "You are making progress. Keep going and try to spread your water intake evenly throughout the day."}
            </p>

            <div
              className={`mt-5 rounded-2xl px-4 py-3 border ${
                isGoalReached
                  ? "bg-[#dff5df]/80 border-[#bcd3b1]"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <p className="text-[11px] uppercase tracking-wide font-bold text-slate-400">
                Glasses
              </p>
              <p className="text-2xl font-black text-slate-950 mt-1">
                {glasses}
                <span className="text-sm ml-1 text-slate-400 font-semibold">
                  / {goalGlasses}
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2rem] p-4 sm:p-5 shadow-lg shadow-slate-900/5 border premium-hover ${
              isGoalReached
                ? "bg-gradient-to-br from-[#edf7e8] to-[#dff5df] border-[#bcd3b1]"
                : "bg-gradient-to-br from-[#fff8ea] to-[#dff5df] border-[#dcebd1]"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 border ${
                isGoalReached
                  ? "bg-[#dff5df] text-[#5f7f3a] border-[#bcd3b1]"
                  : "bg-[#e5ecdf] text-[#71806b] border-[#cfdac8]"
              }`}
            >
              <Sparkles size={20} />
            </div>

            <h4 className="text-lg font-black text-slate-950">Daily Tip</h4>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed break-words">
              {isGoalReached
                ? "Excellent consistency. Since you reached your target, keep this rhythm tomorrow as well to build a strong hydration habit."
                : "A simple habit is to drink one glass of water after waking up, one before lunch, and one in the afternoon to stay more consistent."}
            </p>

            <div
              className={`mt-5 rounded-2xl px-4 py-3 border ${
                isGoalReached
                  ? "bg-white/70 border-[#bcd3b1]"
                  : "bg-white/70 border-[#cfdac8]"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  isGoalReached ? "text-[#5f7f3a]" : "text-[#71806b]"
                }`}
              >
                {isGoalReached
                  ? "You completed today's hydration goal. Keep the streak going."
                  : `${Math.max(targetMl - totalMl, 0)} ml left to reach your target.`}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
