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
  Coffee,
  Salad,
  Soup,
  Apple,
  LucideIcon,
} from "lucide-react";
import type { AIPlan, AIPlanData, DailyMealItem } from "@/types/ai";

interface Props {
  plan: AIPlan | AIPlanData | null;
  plansHistory: AIPlan[];
  selectedPlanId?: string | null;
  generating?: boolean;
  saving?: boolean;
  deletingPlanId?: string | null;
  mealFrequency?: number | null;
  onGenerateNew?: () => void;
  onSavePlan?: () => void;
  onSelectPlan?: (plan: AIPlan) => void;
  onDeletePlan?: (id: string) => void;
}

const mealIcons: Record<DailyMealItem["meal"], LucideIcon> = {
  Breakfast: Coffee,
  Lunch: Salad,
  Dinner: Soup,
  Snack: Apple,
};

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
  mealFrequency,
  onGenerateNew,
  onSavePlan,
  onSelectPlan,
  onDeletePlan,
}: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dailyTarget =
    typeof mealFrequency === "number" &&
    Number.isFinite(mealFrequency) &&
    mealFrequency >= 1 &&
    mealFrequency <= 6
      ? mealFrequency
      : 3;

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
      Math.round((plan.daily_plan.length / dailyTarget) * 100),
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
  }, [dailyTarget, plan]);

  if (!plan) {
    return (
      <div className="wellness-surface premium-card rounded-[2.25rem] p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-[1.35rem] bg-[#fff3e2] flex items-center justify-center text-[#bd625c] mb-4 shadow-lg shadow-[#f28f7c]/10">
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
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#f28f7c] text-white font-semibold hover:bg-[#df7b69] hover:-translate-y-0.5 shadow-xl shadow-[#f28f7c]/20 transition disabled:opacity-70"
        >
          <RefreshCcw size={18} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : "Generate Your First Plan"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="premium-card relative overflow-hidden bg-gradient-to-br from-[#fff3e2] via-white to-[#dff5df] border border-[#f8d5c9] rounded-[2.25rem] p-4 sm:p-7 shadow-sm">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f8d5c9]/60 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-[#dff5df]/65 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 border border-[#f8d5c9] text-[#bd625c] px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.14em]">
              <Sparkles size={14} />
              AI Nutrition Coach
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-3 tracking-tight">
              Personalized Nutrition Plan
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Generate, save, review, and manage your nutrition plans
            </p>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3">
            <button
              onClick={onGenerateNew}
              disabled={generating || !!deletingPlanId}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#f28f7c] text-white font-semibold hover:bg-[#df7b69] hover:-translate-y-0.5 shadow-xl shadow-[#f28f7c]/20 transition disabled:opacity-70 focus-ring"
            >
              <RefreshCcw size={18} className={generating ? "animate-spin" : ""} />
              {generating ? "Generating..." : "Generate New Plan"}
            </button>

            <button
              onClick={onSavePlan}
              disabled={!plan || saving || !!selectedPlanId || !!deletingPlanId}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-[#f8d5c9] text-[#bd625c] font-semibold hover:bg-[#fff3e2] hover:-translate-y-0.5 transition disabled:opacity-70 focus-ring"
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
        className="wellness-surface premium-hover rounded-[2rem] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#dff5df] flex items-center justify-center text-[#5f7f3a]">
            <Target size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Plan Progress</h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white/85 border border-[#e4eadc] rounded-2xl p-4 shadow-lg shadow-slate-900/5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Daily Meals
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {plan.daily_plan.length}
              <span className="text-sm ml-1 text-slate-400">/ {dailyTarget}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#5f7f3a] rounded-full"
                style={{ width: `${progress.dailyPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white/85 border border-[#e4eadc] rounded-2xl p-4 shadow-lg shadow-slate-900/5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Weekly Days
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {plan.weekly_plan.length}
              <span className="text-sm ml-1 text-slate-400">/ {WEEKLY_TARGET}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#8fa58a] rounded-full"
                style={{ width: `${progress.weeklyPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white/85 border border-[#e4eadc] rounded-2xl p-4 shadow-lg shadow-slate-900/5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Monthly Tips
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {plan.monthly_tips.length}
              <span className="text-sm ml-1 text-slate-400">/ {MONTHLY_TARGET}</span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#f28f7c] rounded-full"
                style={{ width: `${progress.monthlyPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#fff3e2] border border-[#f8d5c9] px-4 py-3">
          <p className="text-sm font-semibold text-[#bd625c]">
            Plan completeness: {progress.totalPercent}%
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="wellness-surface premium-hover rounded-[2rem] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#dff5df] flex items-center justify-center text-[#5f7f3a]">
            <Sparkles size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Daily Plan</h3>
        </div>

        <div className="grid gap-3">
          {plan.daily_plan.length === 0 ? (
            <p className="text-slate-500 font-medium">No daily meals found in this plan.</p>
          ) : (
            plan.daily_plan.map((item, i) => {
              const MealIcon = mealIcons[item.meal];

              return (
                <div
                  key={`${item.meal}-${i}`}
                className="bg-white/90 border border-[#e4eadc] rounded-2xl p-4 flex items-start gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#dff5df] border border-[#bcd3b1] text-[#5f7f3a] flex items-center justify-center shrink-0">
                    <MealIcon size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#5f7f3a] uppercase tracking-wide">
                      {item.meal}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="wellness-surface premium-hover rounded-[2rem] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#e5ecdf] flex items-center justify-center text-[#71806b]">
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
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 px-3 py-3 rounded-2xl bg-white/90 border border-[#e4eadc] hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <span className="text-xs font-bold text-[#71806b] mt-1">
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
        className="wellness-surface premium-hover rounded-[2rem] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#fff3e2] flex items-center justify-center text-[#bd625c]">
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
                className="bg-[#fff8ea] border border-[#f8d5c9] rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition"
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
        className="wellness-surface premium-hover rounded-[2rem] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#fff3e2] flex items-center justify-center text-[#bd625c]">
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
                      ? "bg-[#fff3e2] border-[#f8d5c9]"
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8d5c9] text-[#bd625c]">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Saved on {formatPlanDate(historyPlan.created_at)}
                      </p>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
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
                        <div className="flex flex-wrap items-center gap-2">
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
