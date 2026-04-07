"use client";
import { Clock, Trash2, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function RecentLogs() {
  const logs = [
    { id: 1, name: "Caesar Salad", cal: 350, time: "12:30 PM", emoji: "🥗", type: "Lunch" },
    { id: 2, name: "Caffe Latte", cal: 120, time: "09:15 AM", emoji: "☕", type: "Breakfast" },
    { id: 3, name: "Grilled Chicken", cal: 450, time: "07:45 PM", emoji: "🍗", type: "Dinner" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-2">
          Recent Scans
          <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>
        </h3>
        <button className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
          View History <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {logs.map((log, index) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center justify-between hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              {/* Icon Container */}
              <div className="relative">
                <div className="w-14 h-14 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-500">
                  {log.emoji}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-gray-50">
                   <Zap size={10} className="text-emerald-500 fill-emerald-500" />
                </div>
              </div>

              <div>
                <p className="font-black text-gray-900 group-hover:text-emerald-700 transition-colors">{log.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded-md">
                    {log.type}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
                    <Clock size={12} className="text-gray-300" /> {log.time}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-black text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                  +{log.cal} <span className="text-[10px] text-gray-400 uppercase">kcal</span>
                </p>
              </div>
              
              <button className="p-3 rounded-xl text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Empty State / Quick Tip */}
      <div className="p-6 rounded-[2rem] bg-emerald-50 border border-dashed border-emerald-200 flex items-center justify-center">
        <p className="text-xs font-bold text-emerald-700 text-center uppercase tracking-widest opacity-70">
          Scan your next meal to keep the streak alive 🔥
        </p>
      </div>
    </div>
  );
}