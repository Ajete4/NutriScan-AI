"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart3, CalendarDays, Flame, TrendingUp } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "yearly";

type MealLog = {
  id: string;
  calories: number;
  logged_at: string;
};

type ChartItem = {
  label: string;
  calories: number;
};

export default function ProgressChart() {
  const { user } = useAuth();

  const [period, setPeriod] = useState<Period>("daily");
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodOptions: { id: Period; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const startDate = new Date();

        if (period === "daily") {
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
        }

        if (period === "weekly") {
          startDate.setDate(now.getDate() - 7 * 7);
          startDate.setHours(0, 0, 0, 0);
        }

        if (period === "monthly") {
          startDate.setMonth(now.getMonth() - 5);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        }

        if (period === "yearly") {
          startDate.setFullYear(now.getFullYear() - 4);
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
        }

        const { data, error } = await supabase
          .from("meal_logs")
          .select("id, calories, logged_at")
          .eq("user_id", user.id)
          .gte("logged_at", startDate.toISOString())
          .order("logged_at", { ascending: true });

        if (error) {
          setError(error.message);
          return;
        }

        setMealLogs((data || []) as MealLog[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load progress data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, period]);

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "daily") {
      const days: ChartItem[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const next = new Date(date);
        next.setDate(date.getDate() + 1);

        const total = mealLogs
          .filter((log) => {
            const logDate = new Date(log.logged_at);
            return logDate >= date && logDate < next;
          })
          .reduce((sum, log) => sum + Number(log.calories || 0), 0);

        days.push({
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          calories: Math.round(total),
        });
      }

      return days;
    }

    if (period === "weekly") {
      const weeks: ChartItem[] = [];

      for (let i = 7; i >= 0; i--) {
        const start = new Date();
        start.setDate(now.getDate() - i * 7);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 7);

        const total = mealLogs
          .filter((log) => {
            const logDate = new Date(log.logged_at);
            return logDate >= start && logDate < end;
          })
          .reduce((sum, log) => sum + Number(log.calories || 0), 0);

        weeks.push({
          label: `W${8 - i}`,
          calories: Math.round(total),
        });
      }

      return weeks;
    }

    if (period === "monthly") {
      const months: ChartItem[] = [];

      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const total = mealLogs
          .filter((log) => {
            const logDate = new Date(log.logged_at);
            return logDate >= start && logDate < end;
          })
          .reduce((sum, log) => sum + Number(log.calories || 0), 0);

        months.push({
          label: start.toLocaleDateString("en-US", { month: "short" }),
          calories: Math.round(total),
        });
      }

      return months;
    }

    const years: ChartItem[] = [];

    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);

      const total = mealLogs
        .filter((log) => {
          const logDate = new Date(log.logged_at);
          return logDate >= start && logDate < end;
        })
        .reduce((sum, log) => sum + Number(log.calories || 0), 0);

      years.push({
        label: String(year),
        calories: Math.round(total),
      });
    }

    return years;
  }, [mealLogs, period]);

  const summary = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.calories, 0);
    const average = chartData.length > 0 ? Math.round(total / chartData.length) : 0;

    const highest =
      chartData.length > 0
        ? chartData.reduce((max, item) =>
          item.calories > max.calories ? item : max
        )
        : { label: "-", calories: 0 };

    return { total, average, highest };
  }, [chartData]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <p className="text-slate-500 font-medium">Loading progress...</p>
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
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                <BarChart3 size={14} />
                Progress Analytics
              </div>

              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Nutrition Progress
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Track your calorie intake over time
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPeriod(option.id)}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition ${period === option.id
                      ? "bg-gradient-to-r from-emerald-50 to-sky-50 text-slate-900 border-emerald-100 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Flame size={16} className="text-orange-500" />
                Total
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {summary.total}
              </p>
              <p className="text-sm text-slate-400">kcal</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <CalendarDays size={16} className="text-sky-500" />
                Average
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {summary.average}
              </p>
              <p className="text-sm text-slate-400">kcal</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <TrendingUp size={16} className="text-emerald-500" />
                Highest
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {summary.highest.calories}
              </p>
              <p className="text-sm text-slate-400">{summary.highest.label}</p>
            </div>
          </div>

          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                    backgroundColor: "#ffffff",
                  }}
                  formatter={(value) => [`${Number(value ?? 0)} kcal`, "Calories"]}
                />

                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#progressFill)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}