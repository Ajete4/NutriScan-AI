"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import { Clock, Trash2, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

type MealLog = {
  id: string;
  meal_name: string;
  meal_type: string | null;
  calories: number;
  logged_at: string;
  image_url?: string | null;
};

export default function RecentLogs() {
  const { user } = useAuth();

  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("meal_logs")
          .select("id, meal_name, meal_type, calories, logged_at, image_url")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(6);

        if (error) {
          setError(error.message);
          return;
        }

        setLogs((data || []) as MealLog[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load recent scans.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmoji = (mealType: string | null, mealName: string) => {
    const type = mealType?.toLowerCase() || "";
    const name = mealName.toLowerCase();

    if (name.includes("salad")) return "🥗";
    if (name.includes("coffee") || name.includes("latte")) return "☕";
    if (name.includes("chicken")) return "🍗";
    if (name.includes("toast")) return "🍞";
    if (name.includes("avocado")) return "🥑";
    if (name.includes("rice")) return "🍚";
    if (name.includes("fish") || name.includes("salmon") || name.includes("tuna")) return "🐟";

    if (type === "breakfast") return "🍳";
    if (type === "lunch") return "🍽️";
    if (type === "dinner") return "🍲";
    if (type === "snack") return "🍎";

    return "🍴";
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      const { error } = await supabase
        .from("meal_logs")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(error);
        return;
      }

      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const hasLogs = useMemo(() => logs.length > 0, [logs]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <p className="text-slate-500 font-medium">Loading recent scans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-100 rounded-[2rem] p-6 shadow-sm">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
          Recent Scans
          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">
            Live
          </span>
        </h3>

        <button className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
          View History <ChevronRight size={14} />
        </button>
      </div>

      {hasLogs ? (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group bg-white p-5 rounded-[2.5rem] border border-slate-200 flex items-center justify-between hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
                    {getEmoji(log.meal_type, log.meal_name)}
                  </div>

                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                    <Zap size={10} className="text-emerald-500 fill-emerald-500" />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {log.meal_name}
                  </p>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-md">
                      {log.meal_type || "Meal"}
                    </span>

                    <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                      <Clock size={12} className="text-slate-300" />
                      {formatTime(log.logged_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div className="text-right">
                  <p className="font-black text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                    +{Math.round(Number(log.calories || 0))}{" "}
                    <span className="text-[10px] text-slate-400 uppercase">
                      kcal
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={deletingId === log.id}
                  className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <p className="text-slate-500 font-medium">
            No meals scanned yet.
          </p>
        </div>
      )}

      <div className="p-6 rounded-[2rem] bg-emerald-50 border border-dashed border-emerald-200 flex items-center justify-center">
        <p className="text-xs font-bold text-emerald-700 text-center uppercase tracking-widest opacity-80">
          Scan your next meal to keep the streak alive 🔥
        </p>
      </div>
    </div>
  );
}