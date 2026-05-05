"use client";

import { Profile } from "@/types/profile";
import { Activity, Info, Ruler, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthInsights({ profile }: { profile: Profile }) {
  const heightInMeters = (profile.height || 0) / 100;
  const weight = profile.weight || 0;
  const bmi =
    heightInMeters > 0
      ? (weight / (heightInMeters * heightInMeters)).toFixed(1)
      : "0";
  const bmiNum = Number(bmi);

  const getBMICategory = (val: number) => {
    if (val < 18.5) {
      return {
        label: "Underweight",
        color: "text-[#6f8fa0]",
        bg: "bg-[#6f8fa0]",
        border: "border-[#d9e5e1]",
        tip: "Focus on nutrient-dense meals.",
      };
    }

    if (val < 25) {
      return {
        label: "Healthy",
        color: "text-[#5f7f3a]",
        bg: "bg-[#5f7f3a]",
        border: "border-[#dcebd1]",
        tip: "Great job. Keep maintaining your balance.",
      };
    }

    if (val < 30) {
      return {
        label: "Overweight",
        color: "text-[#c06f45]",
        bg: "bg-[#f28f7c]",
        border: "border-[#f8d5c9]",
        tip: "Increase daily activity and watch macros.",
      };
    }

    return {
      label: "Obese",
      color: "text-[#bd625c]",
      bg: "bg-[#e9776f]",
      border: "border-[#f4cbc4]",
      tip: "Consult with a specialist for a plan.",
    };
  };

  const category = getBMICategory(bmiNum);
  const percentage = Math.min(
    Math.max(((bmiNum - 15) / (35 - 15)) * 100, 0),
    100
  );

  return (
    <div className="wellness-surface premium-hover min-w-0 p-4 sm:p-6 lg:p-7 rounded-[2rem] space-y-5 sm:space-y-6 relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 w-48 h-48 ${category.bg} opacity-[0.07] rounded-full -mr-20 -mt-20 blur-2xl transition-all group-hover:scale-110`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${category.color} bg-white border ${category.border} shadow-lg shadow-slate-900/5`}
          >
            <Activity size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-slate-950 text-lg sm:text-xl tracking-tight">
              Body Analysis
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              BMI and baseline metrics
            </p>
          </div>
        </div>

        <Info
          size={16}
          className="text-slate-300 hover:text-[#5f7f3a] cursor-help transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-center">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
            Current BMI
          </p>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-950 tracking-tighter">
              {bmi}
            </span>
            <div
              className={`px-3 py-1 rounded-full bg-white text-[10px] font-black uppercase tracking-widest border ${category.border} ${category.color}`}
            >
              {category.label}
            </div>
          </div>

          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md break-words">
            {category.tip}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative w-full h-4 bg-white/80 rounded-full overflow-hidden shadow-inner border border-[#edf1e8]">
            <div className="absolute inset-0 flex">
              <div className="h-full w-[18%] bg-[#d9e5e1]" />
              <div className="h-full w-[32%] bg-[#dff5df]" />
              <div className="h-full w-[25%] bg-[#f8d5c9]" />
              <div className="h-full w-[25%] bg-[#efaaa0]" />
            </div>

            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${percentage}%` }}
              transition={{ type: "spring", stiffness: 50 }}
              className="absolute top-0 z-10 h-full w-4 rounded-full border-2 border-white bg-slate-950 shadow-lg"
            />
          </div>

          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
            <span>35+</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 pt-4 border-t border-[#dcebd1]">
        <div className="min-w-0 flex items-center gap-3 rounded-2xl border border-[#e4eadc] bg-white/80 p-3 shadow-sm">
          <div className="w-9 h-9 bg-[#dff5df] rounded-xl flex items-center justify-center text-[#5f7f3a]">
            <Scale size={15} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Weight
            </p>
            <p className="text-sm font-bold text-slate-900">
              {profile.weight} kg
            </p>
          </div>
        </div>

        <div className="min-w-0 flex items-center gap-3 rounded-2xl border border-[#e4eadc] bg-white/80 p-3 shadow-sm">
          <div className="w-9 h-9 bg-[#e5ecdf] rounded-xl flex items-center justify-center text-[#71806b]">
            <Ruler size={15} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Height
            </p>
            <p className="text-sm font-bold text-slate-900">
              {profile.height} cm
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
