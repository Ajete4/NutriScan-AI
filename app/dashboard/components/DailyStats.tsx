"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/types/profile";
import { supabase } from "@/lib/supabaseClient";
import { calculateCalories, calculateMacros } from "@/lib/health";
import { motion } from "framer-motion";
import { Flame, Target, UtensilsCrossed } from "lucide-react";

interface DailyStatsProps {
  profile: Profile;
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
  icon: string;
  tone: "emerald" | "sky" | "amber";
}

const toneStyles = {
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    progress: "bg-emerald-500",
    soft: "bg-emerald-100",
    text: "text-emerald-700",
  },
  sky: {
    badge: "bg-sky-50 text-sky-700 border border-sky-100",
    progress: "bg-sky-500",
    soft: "bg-sky-100",
    text: "text-sky-700",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    progress: "bg-amber-500",
    soft: "bg-amber-100",
    text: "text-amber-700",
  },
};

const MacroCard: React.FC<MacroCardProps> = ({
  label,
  consumed,
  target,
  unit,
  icon,
  tone,
}) => {
  const percentage =
    target > 0 ? Math.min(Math.round((consumed / target) * 100), 100) : 0;

  const styles = toneStyles[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${styles.badge}`}>
          {icon}
        </div>

        <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
          {percentage}%
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900">
            {Math.round(consumed)}
          </span>
          <span className="text-sm font-semibold text-slate-400 mb-1">
            {unit}
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Goal:{" "}
          <span className={`font-semibold ${styles.text}`}>
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

export default function DailyStats({ profile }: DailyStatsProps) {
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
  }, [profile.id]);

  const targetCalories = useMemo(() => {
    return Math.round(Number(calculateCalories(profile)) || 2000);
  }, [profile]);

  const macroTargets = useMemo(() => {
    return calculateMacros(targetCalories) || {
      protein: 0,
      carbs: 0,
      fats: 0,
    };
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
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-7 shadow-sm"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                <Flame size={14} />
                Daily Energy
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-3xl md:text-3xl font-semibold tracking-tight text-slate-900">
                  {consumedCalories}
                </span>
                <span className="text-3xl md:text-3xl font-semibold tracking-tight text-slate-900">
                  / {targetCalories} kcal
                </span>
              </div>

              <p className="mt-2 text-sm md:text-base text-slate-500 font-medium">
                You’ve reached{" "}
                <span className="text-emerald-900 font-bold">{progress}%</span>{" "}
                of today’s calorie target.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[130px]">
                <p className="text-[11px] uppercase tracking-wide font-bold text-slate-400">
                  Meals
                </p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {mealLogs.length}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 min-w-[130px]">
                <p className="text-[11px] uppercase tracking-wide font-bold text-emerald-600">
                  Left
                </p>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  {caloriesLeft}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Current: {consumedCalories} kcal</span>
              <span>Goal: {targetCalories} kcal</span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-emerald-500 to-teal-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MacroCard
          label="Protein"
          consumed={totals.protein}
          target={macroTargets.protein}
          unit="g"
          icon="🥩"
          tone="emerald"
        />

        <MacroCard
          label="Carbs"
          consumed={totals.carbs}
          target={macroTargets.carbs}
          unit="g"
          icon="🍞"
          tone="sky"
        />

        <MacroCard
          label="Fats"
          consumed={totals.fats}
          target={macroTargets.fats}
          unit="g"
          icon="🥑"
          tone="amber"
        />
      </div>

    </div>
  );
}