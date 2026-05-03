"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import {
  Apple,
  Beef,
  ChevronRight,
  Clock,
  Coffee,
  Loader2,
  Salad,
  Soup,
  Trash2,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

type MealLog = {
  id: string;
  meal_name: string;
  meal_type: string | null;
  calories: number;
  logged_at: string;
  image_url?: string | null;
};

type RecentLogsProps = {
  refreshKey?: number;
};

export default function RecentLogs({ refreshKey = 0 }: RecentLogsProps) {
  const { user } = useAuth();

  const [logs, setLogs] = useState<MealLog[]>([]);
  const [historyLogs, setHistoryLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

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
          .limit(3);

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
  }, [user, refreshKey]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMealIcon = (mealType: string | null, mealName: string) => {
    const type = mealType?.toLowerCase() || "";
    const name = mealName.toLowerCase();

    if (name.includes("salad")) return Salad;
    if (name.includes("coffee") || name.includes("latte")) return Coffee;
    if (name.includes("chicken") || name.includes("beef")) return Beef;
    if (name.includes("soup")) return Soup;
    if (type === "snack") return Apple;

    return Utensils;
  };

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const { data, error } = await supabase
        .from("meal_logs")
        .select("id, meal_name, meal_type, calories, logged_at, image_url")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(50);

      if (error) {
        setHistoryError(error.message);
        return;
      }

      setHistoryLogs((data || []) as MealLog[]);
    } catch (err) {
      console.error(err);
      setHistoryError("Failed to load meal history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    setHistoryOpen(true);

    if (historyLogs.length === 0) {
      await fetchHistory();
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      setDeletingId(id);

      const { error } = await supabase
        .from("meal_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      setLogs((prev) => prev.filter((log) => log.id !== id));
      setHistoryLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const hasLogs = useMemo(() => logs.length > 0, [logs]);

  if (loading) {
    return (
      <div className="wellness-surface rounded-[2rem] p-6">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3 px-1 pt-2">
        <div>
          <h3 className="font-black text-slate-950 text-xl sm:text-2xl tracking-tight flex items-center gap-2">
            Recent Scans
            <span className="bg-[#dff5df] text-[#5f7f3a] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">
              Live
            </span>
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Your latest AI meal recognitions
          </p>
        </div>

        <button
          onClick={handleOpenHistory}
          className="text-xs font-bold text-[#5f7f3a] hover:text-[#4d6b2f] flex items-center gap-1 shrink-0 focus-ring rounded-full"
        >
          View History <ChevronRight size={14} />
        </button>
      </div>

      {hasLogs ? (
        <div className="space-y-3">
          {logs.map((log, index) => {
            const MealIcon = getMealIcon(log.meal_type, log.meal_name);

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group bg-white/95 p-4 sm:p-5 rounded-[1.75rem] border border-[#e4eadc] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-[#bcd3b1] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#5f7f3a]/15 transition-all duration-300"
              >
                <div className="flex items-center gap-3 sm:gap-5 min-w-0 w-full">
                  <div className="relative shrink-0">
                    {log.image_url ? (
                      <div className="relative w-14 h-14 overflow-hidden rounded-2xl border border-slate-100 shadow-md">
                        <Image
                          src={log.image_url}
                          alt={log.meal_name}
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#dff5df] rounded-2xl flex items-center justify-center text-[#5f7f3a] shadow-sm group-hover:scale-105 transition-all duration-300">
                        <MealIcon size={24} />
                      </div>
                    )}

                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                      <Zap size={10} className="text-[#f28f7c] fill-[#f28f7c]" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="font-black text-slate-950 group-hover:text-[#5f7f3a] transition-colors truncate">
                      {log.meal_name}
                    </p>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide bg-[#fff8ea] border border-[#eee5d3] px-2 py-0.5 rounded-md">
                        {log.meal_type || "Meal"}
                      </span>

                      <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                        <Clock size={12} className="text-slate-300" />
                        {formatTime(log.logged_at)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 w-full sm:w-auto pl-16 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <p className="font-black text-lg text-slate-950 group-hover:text-[#5f7f3a] transition-colors">
                      +{Math.round(Number(log.calories || 0))}{" "}
                      <span className="text-[10px] text-slate-400 uppercase">
                        kcal
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="p-3 rounded-xl text-slate-400 sm:text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-100 focus-ring"
                    aria-label={`Delete ${log.meal_name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="wellness-surface rounded-[2rem] p-6">
          <p className="text-slate-500 font-medium">No meals scanned yet.</p>
        </div>
      )}

      <div className="p-5 sm:p-6 rounded-[1.75rem] bg-gradient-to-r from-[#dff5df] to-[#fff3e2] border border-dashed border-[#bcd3b1] flex items-center justify-center shadow-lg shadow-[#5f7f3a]/10">
        <p className="text-xs font-black text-[#5f7f3a] text-center uppercase tracking-widest opacity-80">
          Scan your next meal to keep the streak alive
        </p>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />

          <div className="relative w-full max-w-3xl max-h-[86vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] border border-[#dcebd1] bg-[#fffaf0] shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4 border-b border-[#dcebd1] bg-gradient-to-r from-[#dff5df] via-white to-[#fff3e2] px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-950">
                  Meal History
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  Your latest saved AI meal scans.
                </p>
              </div>

              <button
                onClick={() => setHistoryOpen(false)}
                className="rounded-2xl border border-[#dcebd1] bg-white p-2.5 text-slate-500 transition hover:bg-[#fff3e2] hover:text-[#bd625c] focus-ring"
                aria-label="Close meal history"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-4 sm:p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-2 rounded-[1.5rem] border border-[#dcebd1] bg-white/80 p-8 text-sm font-bold text-[#5f7f3a]">
                  <Loader2 size={18} className="animate-spin" />
                  Loading meal history...
                </div>
              ) : historyError ? (
                <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600">
                  {historyError}
                </div>
              ) : historyLogs.length > 0 ? (
                <div className="space-y-3">
                  {historyLogs.map((log, index) => {
                    const MealIcon = getMealIcon(log.meal_type, log.meal_name);

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.025, 0.25) }}
                        className="group flex flex-col gap-4 rounded-[1.5rem] border border-[#e4eadc] bg-white/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bcd3b1] hover:shadow-xl hover:shadow-[#5f7f3a]/10 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative shrink-0">
                            {log.image_url ? (
                              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 shadow-md">
                                <Image
                                  src={log.image_url}
                                  alt={log.meal_name}
                                  fill
                                  sizes="56px"
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff5df] text-[#5f7f3a] shadow-sm">
                                <MealIcon size={24} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-950">
                              {log.meal_name}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-md border border-[#eee5d3] bg-[#fff8ea] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                {log.meal_type || "Meal"}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">
                                {formatDate(log.logged_at)} at {formatTime(log.logged_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <p className="font-black text-slate-950">
                            +{Math.round(Number(log.calories || 0))}{" "}
                            <span className="text-[10px] uppercase text-slate-400">
                              kcal
                            </span>
                          </p>

                          <button
                            onClick={() => handleDelete(log.id)}
                            disabled={deletingId === log.id}
                            className="rounded-xl p-3 text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-60 focus-ring"
                            aria-label={`Delete ${log.meal_name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-[#dcebd1] bg-white/80 p-8 text-center">
                  <p className="font-bold text-slate-600">No meal history yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
