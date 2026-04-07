"use client";
import { useState } from "react";
import { Droplets, Plus } from "lucide-react";

export default function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const goal = 8;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Hidratimi</p>
          <h3 className="text-xl font-black">{glasses * 250}ml <span className="text-sm opacity-60">/ {goal * 250}ml</span></h3>
        </div>
        <Droplets className="opacity-50" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[...Array(goal)].map((_, i) => (
          <div key={i} className={`w-6 h-8 rounded-md border-2 transition-all ${i < glasses ? 'bg-white border-white' : 'border-white/30'}`} />
        ))}
      </div>

      <button 
        onClick={() => setGlasses(prev => Math.min(prev + 1, goal))}
        className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
      >
        <Plus size={18} /> Shto Gotë
      </button>
    </div>
  );
}