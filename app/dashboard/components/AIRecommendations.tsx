"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  Lightbulb,
  RefreshCcw,
  Save,
  Trash2,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";
import type { AIPlan, AIPlanData, DailyMealItem } from "@/types/ai";

interface Props {
  plan: AIPlan | AIPlanData | null;
  plansHistory: AIPlan[];
  selectedPlanId?: string | null;
  generating?: boolean;
  saving?: boolean;
  deletingPlanId?: string | null;
  onGenerateNew?: () => void;
  onSavePlan?: () => void;
  onSelectPlan?: (plan: AIPlan) => void;
  onDeletePlan?: (id: string) => void;
}

const mealIcons: Record<DailyMealItem["meal"], string> = {
  Breakfast: "🍳",
  Lunch: "🍽️",
  Dinner: "🍲",
  Snack: "🍎",
};

const DAILY_TARGET = 4;
const WEEKLY_TARGET = 7;
const MONTHLY_TARGET = 6;

function formatPlanDate(dateString?: string) {
  if (!dateString) return "Unsaved plan";

  return new Date(dateString).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AIRecommendations({
  plan,
  plansHistory,
  selectedPlanId,
  generating = false,
  saving = false,
  deletingPlanId,
  onGenerateNew,
  onSavePlan,
  onSelectPlan,
  onDeletePlan,
}: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (!plan) {
      return {
        dailyPercent: 0,
        weeklyPercent: 0,
        monthlyPercent: 0,
        totalPercent: 0,
      };
    }

    const dailyPercent = Math.min(
      Math.round((plan.daily_plan.length / DAILY_TARGET) * 100),
      100
    );

    const weeklyPercent = Math.min(
      Math.round((plan.weekly_plan.length / WEEKLY_TARGET) * 100),
      100
    );

    const monthlyPercent = Math.min(
      Math.round((plan.monthly_tips.length / MONTHLY_TARGET) * 100),
      100
    );

    const totalPercent = Math.round(
      (dailyPercent + weeklyPercent + monthlyPercent) / 3
    );

    return { dailyPercent, weeklyPercent, monthlyPercent, totalPercent };
  }, [plan]);

  if (!plan) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 mb-4">
          <Sparkles size={24} />
        </div>

        <h3 className="text-lg font-black text-slate-900">
          No AI plan available yet
        </h3>

        <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">
          Generate your first personalized nutrition plan to see daily meals,
          weekly guidance, and monthly health tips.
        </p>

        <button
          onClick={onGenerateNew}
          disabled={generating}
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-70"
        >
          <RefreshCcw size={18} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : "Generate Your First Plan"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-[2rem] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 border border-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles size={14} />
              AI Nutrition Coach
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-3">
              Personalized Nutrition Plan
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Generate, save, review, and manage your nutrition plans
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onGenerateNew}
              disabled={generating || !!deletingPlanId}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-70"
            >
              <RefreshCcw size={18} className={generating ? "animate-spin" : ""} />
              {generating ? "Generating..." : "Generate New Plan"}
            </button>

            <button
              onClick={onSavePlan}
              disabled={!plan || saving || !!selectedPlanId || !!deletingPlanId}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-violet-200 text-violet-700 font-semibold hover:bg-violet-50 transition disabled:opacity-70"
            >
              <Save size={18} />
              {saving ? "Saving..." : selectedPlanId ? "Saved" : "Save Plan"}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Target size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Plan Progress</h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Daily Meals
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {plan.daily_plan.length}
              <span className="text-sm ml-1 text-slate-400">/ {DAILY_TARGET}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${progress.dailyPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Weekly Days
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {plan.weekly_plan.length}
              <span className="text-sm ml-1 text-slate-400">/ {WEEKLY_TARGET}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${progress.weeklyPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Monthly Tips
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {plan.monthly_tips.length}
              <span className="text-sm ml-1 text-slate-400">/ {MONTHLY_TARGET}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-lime-500 rounded-full"
                style={{ width: `${progress.monthlyPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
          <p className="text-sm font-semibold text-violet-700">
            Plan completeness: {progress.totalPercent}%
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Sparkles size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Daily Plan</h3>
        </div>

        <div className="grid gap-3">
          {plan.daily_plan.length === 0 ? (
            <p className="text-slate-500 font-medium">No daily meals found in this plan.</p>
          ) : (
            plan.daily_plan.map((item, i) => (
              <div
                key={`${item.meal}-${i}`}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">
                  {mealIcons[item.meal]}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                    {item.meal}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <CalendarDays size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Weekly Plan</h3>
        </div>

        <div className="space-y-2">
          {plan.weekly_plan.length === 0 ? (
            <p className="text-slate-500 font-medium">No weekly guidance found in this plan.</p>
          ) : (
            plan.weekly_plan.map((day, i) => (
              <div
                key={`day-${i}`}
                className="flex items-start gap-3 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <span className="text-xs font-bold text-sky-600 mt-1">
                  Day {i + 1}
                </span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {day}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lime-600">
            <Lightbulb size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Monthly Tips</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {plan.monthly_tips.length === 0 ? (
            <p className="text-slate-500 font-medium">No monthly tips found in this plan.</p>
          ) : (
            plan.monthly_tips.map((tip, i) => (
              <div
                key={`tip-${i}`}
                className="bg-lime-50 border border-lime-100 rounded-2xl p-4"
              >
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {tip}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Clock3 size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Plan History</h3>
        </div>

        {plansHistory.length === 0 ? (
          <p className="text-slate-500 font-medium">No saved plans yet.</p>
        ) : (
          <div className="space-y-3">
            {plansHistory.map((historyPlan, index) => {
              const isSelected = selectedPlanId === historyPlan.id;
              const isConfirming = confirmDeleteId === historyPlan.id;

              return (
                <div
                  key={historyPlan.id}
                  className={`rounded-2xl border p-4 transition ${
                    isSelected
                      ? "bg-violet-50 border-violet-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      onClick={() => onSelectPlan?.(historyPlan)}
                      className="text-left flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {index === 0 ? "Most Recent Saved Plan" : `Saved Plan #${plansHistory.length - index}`}
                        </p>

                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Saved on {formatPlanDate(historyPlan.created_at)}
                      </p>
                    </button>

                    <div className="flex items-center gap-2">
                      {!isConfirming ? (
                        <button
                          onClick={() => setConfirmDeleteId(historyPlan.id)}
                          disabled={!!deletingPlanId}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition disabled:opacity-70"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => onDeletePlan?.(historyPlan.id)}
                            disabled={deletingPlanId === historyPlan.id}
                            className="px-3 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-70"
                          >
                            {deletingPlanId === historyPlan.id
                              ? "Deleting..."
                              : "Confirm"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}