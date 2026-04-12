"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

import {
  Droplets,
  Plus,
  Minus,
  Trophy,
  Waves,
  Sparkles,
  CheckCircle2,
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

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

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
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-7 shadow-sm"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold">
                  <Droplets size={14} />
                  Hydration Tracker
                </div>

                <h3 className="text-2xl font-black text-slate-900 mt-3">
                  Water Intake
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Stay hydrated and track your daily water goal
                </p>
              </div>

              <div
                className={`rounded-2xl px-5 py-4 text-right min-w-[160px] border ${
                  isGoalReached
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-sky-50 border-sky-100"
                }`}
              >
                <p
                  className={`text-2xl font-black ${
                    isGoalReached ? "text-emerald-700" : "text-sky-700"
                  }`}
                >
                  {totalMl}
                  <span
                    className={`text-xs ml-1 font-bold ${
                      isGoalReached ? "text-emerald-500" : "text-sky-500"
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
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Current: {totalMl} ml</span>
                <span>Goal: {targetMl} ml</span>
              </div>

              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isGoalReached
                      ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500"
                      : "bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500"
                  }`}
                />
              </div>

              <p className="text-sm text-slate-500 font-medium mt-3">
                You’ve reached{" "}
                <span
                  className={`font-bold ${
                    isGoalReached ? "text-emerald-700" : "text-sky-700"
                  }`}
                >
                  {progress}%
                </span>{" "}
                of today’s hydration goal.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[...Array(goalGlasses)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-12 rounded-xl border-2 overflow-hidden flex items-end transition ${
                    i < glasses
                      ? isGoalReached
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-sky-400 bg-sky-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: i < glasses ? "100%" : "0%" }}
                    className={`w-full ${
                      isGoalReached
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                        : "bg-gradient-to-t from-sky-600 to-sky-400"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRemoveGlass}
                disabled={saving || glasses === 0}
                className="p-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <Minus size={20} />
              </button>

              <button
                onClick={handleAddGlass}
                disabled={saving}
                className={`flex-1 py-4 rounded-2xl text-white font-bold transition disabled:opacity-70 inline-flex items-center justify-center gap-2 ${
                  isGoalReached
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
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

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2rem] p-5 shadow-sm border ${
              isGoalReached
                ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
                : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 border ${
                isGoalReached
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}
            >
              {isGoalReached ? <CheckCircle2 size={20} /> : <Trophy size={20} />}
            </div>

            <h4 className="text-lg font-black text-slate-900">
              {isGoalReached ? "Hydration Complete" : "Today’s Status"}
            </h4>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {isGoalReached
                ? "Great job. You reached your hydration goal today and kept your routine on track."
                : "You are making progress. Keep going and try to spread your water intake evenly throughout the day."}
            </p>

            <div
              className={`mt-5 rounded-2xl px-4 py-3 border ${
                isGoalReached
                  ? "bg-emerald-100/60 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <p className="text-[11px] uppercase tracking-wide font-bold text-slate-400">
                Glasses
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
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
            className={`rounded-[2rem] p-5 shadow-sm border ${
              isGoalReached
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100"
                : "bg-gradient-to-br from-lime-50 to-emerald-50 border-lime-100"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 border ${
                isGoalReached
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-lime-100 text-lime-700 border-lime-200"
              }`}
            >
              <Sparkles size={20} />
            </div>

            <h4 className="text-lg font-black text-slate-900">Daily Tip</h4>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {isGoalReached
                ? "Excellent consistency. Since you reached your target, keep this rhythm tomorrow as well to build a strong hydration habit."
                : "A simple habit is to drink one glass of water after waking up, one before lunch, and one in the afternoon to stay more consistent."}
            </p>

            <div
              className={`mt-5 rounded-2xl px-4 py-3 border ${
                isGoalReached
                  ? "bg-white/70 border-emerald-200"
                  : "bg-white/70 border-lime-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  isGoalReached ? "text-emerald-700" : "text-lime-700"
                }`}
              >
                {isGoalReached
                  ? "You completed today’s hydration goal. Keep the streak going."
                  : `${Math.max(targetMl - totalMl, 0)} ml left to reach your target.`}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}