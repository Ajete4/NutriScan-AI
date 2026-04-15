"use client";
import { Profile } from "@/types/profile";
import { Activity, Info, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthInsights({ profile }: { profile: Profile }) {
  const heightInMeters = (profile.height || 0) / 100;
  const weight = profile.weight || 0;
  const bmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : "0";
  const bmiNum = Number(bmi);

  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-500", border: "border-blue-100", tip: "Focus on nutrient-dense meals." };
    if (val < 25) return { label: "Healthy", color: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-100", tip: "Great job! Keep maintaining your balance." };
    if (val < 30) return { label: "Overweight", color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-100", tip: "Increase daily activity & watch macros." };
    return { label: "Obese", color: "text-red-500", bg: "bg-red-500", border: "border-red-100", tip: "Consult with a specialist for a plan." };
  };

  const category = getBMICategory(bmiNum);
  
  // Kalkulojmë pozicionin në shirit (nga 15 deri në 35 BMI)
  const percentage = Math.min(Math.max(((bmiNum - 15) / (35 - 15)) * 100, 0), 100);

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${category.bg} opacity-[0.03] rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110`} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${category.color} bg-opacity-10`}>
            <Activity size={18} />
          </div>
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Body Analysis</h3>
        </div>
        <Info size={16} className="text-gray-300 hover:text-emerald-500 cursor-help transition-colors" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* BMI Score Display */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Your Current BMI</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{bmi}</span>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${category.border} ${category.color}`}>
              {category.label}
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[200px]">
             {category.tip}
          </p>
        </div>

        {/* BMI Visual Scale */}
        <div className="space-y-4">
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            {/* Shkalla e ngjyrave në sfond */}
            <div className="absolute inset-0 flex">
              <div className="h-full w-[18%] bg-blue-200" />
              <div className="h-full w-[32%] bg-emerald-200" />
              <div className="h-full w-[25%] bg-orange-200" />
              <div className="h-full w-[25%] bg-red-200" />
            </div>
            
            {/* Treguesi (Indicator) */}
            <motion.div 
              initial={{ left: 0 }}
              animate={{ left: `${percentage}%` }}
              transition={{ type: "spring", stiffness: 50 }}
              className="absolute top-0 w-3 h-full bg-slate-900 border-2 border-white rounded-full shadow-lg z-10"
            />
          </div>
          
          <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
            <span>35+</span>
          </div>
        </div>
      </div>

      {/* Mini Stats Footer */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <TrendingUp size={14} />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Weight</p>
            <p className="text-sm font-bold text-gray-900">{profile.weight} kg</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <Target size={14} />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Height</p>
            <p className="text-sm font-bold text-gray-900">{profile.height} cm</p>
          </div>
        </div>
      </div>
    </div>
  );
}


