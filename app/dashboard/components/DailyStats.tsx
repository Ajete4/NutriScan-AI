"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/types/profile";
import { supabase } from "@/lib/supabaseClient";
import { calculateCalories, calculateMacros } from "@/lib/health";
import { motion } from "framer-motion";
import { Beef, Flame, Leaf, LucideIcon, Sparkles, Sprout, Wheat } from "lucide-react";

interface DailyStatsProps {
  profile: Profile;
  refreshKey?: number;
}

interface MealLog {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  logged_at: string;
  created_at: string;
}

interface MacroCardProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  icon: LucideIcon;
  tone: "avocado" | "sage" | "coral";
}

const toneStyles = {
  avocado: {
    badge: "bg-[#dff5df] text-[#5f7f3a] border border-[#bcd3b1]",
    progress: "bg-[#5f7f3a]",
    text: "text-[#5f7f3a]",
  },
  sage: {
    badge: "bg-[#e5ecdf] text-[#71806b] border border-[#cfdac8]",
    progress: "bg-[#8fa58a]",
    text: "text-[#71806b]",
  },
  coral: {
    badge: "bg-[#fff3e2] text-[#bd625c] border border-[#f8d5c9]",
    progress: "bg-[#f28f7c]",
    text: "text-[#bd625c]",
  },
};

const MacroCard: React.FC<MacroCardProps> = ({
  label,
  consumed,
  target,
  unit,
  icon: Icon,
  tone,
}) => {
  const percentage =
    target > 0 ? Math.min(Math.round((consumed / target) * 100), 100) : 0;

  const styles = toneStyles[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="wellness-surface premium-hover min-w-0 rounded-[1.75rem] p-4 sm:p-5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${styles.badge}`}
        >
          <Icon size={20} />
        </div>

        <span className="text-[11px] font-black text-slate-500 bg-white/80 border border-slate-100 px-2.5 py-1 rounded-full">
          {percentage}%
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            {Math.round(consumed)}
          </span>
          <span className="text-sm font-semibold text-slate-400 mb-1">
            {unit}
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1 break-words">
          Goal:{" "}
          <span className={`font-bold ${styles.text}`}>
            {Math.round(target)} {unit}
          </span>
        </p>
      </div>

      <div className="mt-4">
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${styles.progress}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function DailyStats({ profile, refreshKey = 0 }: DailyStatsProps) {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealError, setMealError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayMeals = async () => {
      try {
        setLoadingMeals(true);
        setMealError(null);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from("meal_logs")
          .select("*")
          .eq("user_id", profile.id)
          .gte("logged_at", startOfDay.toISOString())
          .lte("logged_at", endOfDay.toISOString())
          .order("logged_at", { ascending: false });

        if (error) {
          setMealError(error.message);
          return;
        }

        setMealLogs((data || []) as MealLog[]);
      } catch (err) {
        console.error("Error fetching meal logs:", err);
        setMealError("Failed to load today's meals.");
      } finally {
        setLoadingMeals(false);
      }
    };

    fetchTodayMeals();
  }, [profile.id, refreshKey]);

  const targetCalories = useMemo(() => {
    return Math.round(Number(calculateCalories(profile)) || 2000);
  }, [profile]);

  const macroTargets = useMemo(() => {
    return (
      calculateMacros(targetCalories) || {
        protein: 0,
        carbs: 0,
        fats: 0,
      }
    );
  }, [targetCalories]);

  const totals = useMemo(() => {
    return mealLogs.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories || 0);
        acc.protein += Number(meal.protein || 0);
        acc.carbs += Number(meal.carbs || 0);
        acc.fats += Number(meal.fats || 0);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [mealLogs]);

  const consumedCalories = Math.round(totals.calories);
  const caloriesLeft = Math.max(targetCalories - consumedCalories, 0);
  const progress =
    targetCalories > 0
      ? Math.min(Math.round((consumedCalories / targetCalories) * 100), 100)
      : 0;

  if (loadingMeals) {
    return (
      <div className="wellness-surface rounded-[2rem] p-6">
        <p className="text-slate-500 font-medium">
          Loading daily nutrition stats...
        </p>
      </div>
    );
  }

  if (mealError) {
    return (
      <div className="bg-white border border-red-100 rounded-[2rem] p-6 shadow-sm">
        <p className="text-red-500 font-medium">{mealError}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="wellness-surface premium-card rounded-[2rem] sm:rounded-[2.25rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-[#dff5df]/80 blur-3xl" />
        <div className="absolute -bottom-20 left-12 h-56 w-56 rounded-full bg-[#fff3e2]/80 blur-3xl" />
        <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-[2rem] border border-white/60 bg-white/30 rotate-12 lg:block" />

        <div className="relative flex min-w-0 flex-col gap-5 sm:gap-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3e2] border border-[#f8d5c9] px-3 py-1 text-xs font-black text-[#bd625c] uppercase tracking-[0.14em]">
                <Flame size={14} />
                Daily Energy
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-2 sm:gap-3">
                <span className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-950">
                  {consumedCalories}
                </span>
                <span className="pb-1 text-xl sm:text-3xl xl:text-4xl font-black tracking-tight text-slate-900">
                  / {targetCalories} kcal
                </span>
              </div>

              <p className="mt-2 text-sm md:text-base text-slate-500 font-medium break-words">
                You have reached{" "}
                <span className="text-[#5f7f3a] font-bold">{progress}%</span>{" "}
                of today&apos;s calorie target.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto min-w-0">
              <div className="min-w-0 bg-white/85 border border-[#e4eadc] rounded-[1.35rem] px-4 py-3 shadow-lg shadow-slate-900/5">
                <div className="mb-2 h-8 w-8 rounded-xl bg-[#fff8ea] text-[#71806b] flex items-center justify-center">
                  <Leaf size={15} />
                </div>
                <p className="text-[11px] uppercase tracking-wide font-bold text-slate-400">
                  Meals
                </p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {mealLogs.length}
                </p>
              </div>

              <div className="min-w-0 bg-[#dff5df] border border-[#bcd3b1] rounded-[1.35rem] px-4 py-3 shadow-lg shadow-[#5f7f3a]/10">
                <div className="mb-2 h-8 w-8 rounded-xl bg-white/70 text-[#5f7f3a] flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <p className="text-[11px] uppercase tracking-wide font-bold text-[#5f7f3a]">
                  Left
                </p>
                <p className="text-xl font-black text-[#5f7f3a] mt-1">
                  {caloriesLeft}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500 mb-2">
              <span>Current: {consumedCalories} kcal</span>
              <span>Goal: {targetCalories} kcal</span>
            </div>

            <div className="h-4 w-full rounded-full bg-white/80 overflow-hidden shadow-inner border border-[#edf1e8]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#f28f7c] via-[#8fa58a] to-[#5f7f3a] shadow-[0_0_22px_rgba(95,127,58,0.28)]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <MacroCard
          label="Protein"
          consumed={totals.protein}
          target={macroTargets.protein}
          unit="g"
          icon={Beef}
          tone="avocado"
        />

        <MacroCard
          label="Carbs"
          consumed={totals.carbs}
          target={macroTargets.carbs}
          unit="g"
          icon={Wheat}
          tone="sage"
        />

        <MacroCard
          label="Fats"
          consumed={totals.fats}
          target={macroTargets.fats}
          unit="g"
          icon={Sprout}
          tone="coral"
        />
      </div>
    </div>
  );
}
