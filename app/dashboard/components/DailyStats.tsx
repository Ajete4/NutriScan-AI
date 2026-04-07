"use client";
import React from "react";
import { Profile } from "@/types/profile";
import { calculateCalories, calculateMacros } from "@/lib/health";
import { motion } from "framer-motion";
import { Zap, Flame, Target } from "lucide-react";

interface DailyStatsProps {
  profile: Profile;
}

interface MacroCardProps {
  label: string;
  value: number;
  unit: string;
  colorHex: string;
  bgClass: string;
  icon: string;
  percentage: number;
}

const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, colorHex, bgClass, icon, percentage }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 ${bgClass} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-widest">
        {percentage}%
      </span>
    </div>
    
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">
        {value}<span className="text-sm font-bold text-slate-300 ml-1">{unit}</span>
      </p>
    </div>
    
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" 
        style={{ backgroundColor: colorHex }} 
      />
    </div>
  </motion.div>
);

export default function DailyStats({ profile }: DailyStatsProps) {
  const targetCalories = Number(calculateCalories(profile)) || 2000;
  const macros = calculateMacros(targetCalories) || { protein: 0, carbs: 0, fats: 0 };
  
  const consumed = 900; 
  const progress = Math.min((consumed / targetCalories) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Main Calorie Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-500/5 border border-gray-50 relative overflow-hidden group"
      >
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Flame size={18} fill="currentColor" />
              </div>
              <h3 className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">Energy Goal</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black text-slate-900 tracking-tighter">{consumed}</span>
                <span className="text-slate-300 font-bold text-2xl tracking-tight">/ {targetCalories} kcal</span>
              </div>
              <p className="text-slate-500 font-medium text-lg">
                You are  consumed <span className="text-emerald-600 font-black">{Math.round(progress)}%</span> of your daily limit.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="relative">
               <div className="h-8 w-full bg-slate-50 rounded-[1rem] overflow-hidden p-1.5 border border-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 rounded-[0.6rem] shadow-lg shadow-emerald-200 relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-20" />
                </motion.div>
              </div>
              <div className="absolute -top-10 right-0 flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                <Target size={12} /> {targetCalories - consumed} kcal left
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">
              <span>Current: {consumed} kcal</span>
              <span>Goal: {targetCalories} kcal</span>
            </div>
          </div>
        </div>
        
        {/* Visual Decoration */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      </motion.div>

      {/* Macros Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MacroCard 
          label="Protein" 
          value={macros.protein} 
          unit="g" 
          colorHex="#10b981" 
          bgClass="bg-emerald-50 text-emerald-600" 
          icon="🥩" 
          percentage={65} 
        />
        <MacroCard 
          label="Carbs" 
          value={macros.carbs} 
          unit="g" 
          colorHex="#3b82f6" 
          bgClass="bg-blue-50 text-blue-600" 
          icon="🍞" 
          percentage={40} 
        />
        <MacroCard 
          label="Fats" 
          value={macros.fats} 
          unit="g" 
          colorHex="#f59e0b" 
          bgClass="bg-amber-50 text-amber-600" 
          icon="🥑" 
          percentage={55} 
        />
      </div>
    </div>
  );
}