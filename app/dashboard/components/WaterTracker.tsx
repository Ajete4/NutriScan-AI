"use client";
import { useState } from "react";
import { Droplets, Plus, Minus, Waves, Trophy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const goal = 10;
  const progress = (glasses / goal) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Header Info - Made more compact */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
            <Droplets size={28} className="fill-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Hydration</h2>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.15em]">
              Daily Intake Tracker
            </p>
          </div>
        </div>

        <div className="text-right bg-blue-50/50 p-3 rounded-2xl px-6 border border-blue-100/50">
          <p className="text-2xl font-black text-blue-600 italic">
            {glasses * 250}<span className="text-xs ml-1 text-blue-400 not-italic">ml</span>
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Goal: {goal * 250}ml</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Tracker Card - Smaller scale */}
        <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [10, 12, 10] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute bottom-[-30px] right-[-30px] opacity-10 pointer-events-none"
          >
            <Waves size={180} />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/30">
                Live Stats
              </span>
              <span className="font-black text-xl">{Math.round(progress)}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-white/10 rounded-full mb-8 overflow-hidden p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full rounded-full ${progress >= 100 ? 'bg-green-400' : 'bg-blue-500'}`}
                style={{ boxShadow: progress > 0 ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none' }}
              />
            </div>

            {/* Smaller Glasses Grid */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[...Array(goal)].map((_, i) => (
                <motion.div 
                  key={i}
                  className={`w-8 h-12 rounded-lg border-2 transition-all flex items-end overflow-hidden ${
                    i < glasses ? 'border-blue-400' : 'border-white/10'
                  }`}
                >
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: i < glasses ? '100%' : '0%' }}
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400"
                   />
                </motion.div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setGlasses(prev => Math.max(prev - 1, 0))}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all"
              >
                <Minus size={20} />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={() => setGlasses(prev => Math.min(prev + 1, goal))}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all shadow-lg ${
                  progress >= 100 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                <Plus size={20} /> {progress >= 100 ? "GOAL REACHED!" : "ADD GLASS"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Side Info - Compact */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex-grow">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-4">
                <Trophy size={20} />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2">Daily Tip</h4>
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                Drinking water helps maintain energy levels and brain function throughout the day.
              </p>
            </div>
            
            <div className={`mt-6 p-4 rounded-xl ${progress >= 100 ? 'bg-green-50' : 'bg-gray-50'}`}>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-sm font-bold ${progress >= 100 ? 'text-green-600' : 'text-gray-900'}`}>
                {progress >= 100 ? "Fully Hydrated! 🏆" : "Stay focused!"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
