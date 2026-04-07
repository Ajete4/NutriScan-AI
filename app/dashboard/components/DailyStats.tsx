"use client";
import React from "react";
import { Profile } from "@/types/profile";
import { calculateCalories, calculateMacros } from "@/lib/health";

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
}

const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, colorHex, bgClass, icon }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-3">
    <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center text-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{label}</p>
      <p className="text-2xl font-black text-gray-900">
        {value}<span className="text-sm font-medium text-gray-400 ml-0.5">{unit}</span>
      </p>
    </div>
    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: colorHex }} />
    </div>
  </div>
);

export default function DailyStats({ profile }: DailyStatsProps) {
  // Sigurohemi që vlerat janë gjithmonë numra
  const targetCalories = Number(calculateCalories(profile)) || 2000;
  const macros = calculateMacros(targetCalories) || { protein: 0, carbs: 0, fats: 0 };
  
  const consumed = 900; 
  const progress = Math.min((consumed / targetCalories) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Main Calorie Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-emerald-600 font-black text-sm uppercase tracking-widest mb-4">Objektivi i Energjisë</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black text-gray-900 tracking-tighter">{consumed}</span>
              <span className="text-gray-400 font-bold text-2xl tracking-tight">/ {targetCalories} kcal</span>
            </div>
            <p className="text-gray-500 font-medium mt-2">Keni konsumuar {Math.round(progress)}% të limitit ditor.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="h-6 w-full bg-gray-100 rounded-2xl overflow-hidden p-1 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl transition-all duration-1000 shadow-md shadow-emerald-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-black text-gray-400 px-1">
              <span>0 KCAL</span>
              <span>{targetCalories} KCAL</span>
            </div>
          </div>
        </div>
        
        {/* Dekorim Vizual */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-40 -z-0" />
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MacroCard label="Proteina" value={macros.protein} unit="g" colorHex="#ef4444" bgClass="bg-red-50" icon="🥩" />
        <MacroCard label="Karbo" value={macros.carbs} unit="g" colorHex="#3b82f6" bgClass="bg-blue-50" icon="🍞" />
        <MacroCard label="Yndyrna" value={macros.fats} unit="g" colorHex="#f59e0b" bgClass="bg-amber-50" icon="🥑" />
      </div>
    </div>
  );
}