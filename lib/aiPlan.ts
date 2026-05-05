import type { AIPlan, AIPlanData } from "@/types/ai";

export type AIPlanRow = {
  id: string;
  user_id: string;
  created_at: string;
  plan_data?: AIPlanData | null;
  daily_plan?: unknown;
  weekly_plan?: unknown;
  monthly_tips?: unknown;
  explanation?: unknown;
};

export type RawAIPlanData = {
  daily_plan?: unknown;
  weekly_plan?: unknown;
  monthly_tips?: unknown;
  explanation?: unknown;
};

export type NormalizedAIPlanData = Omit<AIPlanData, "explanation"> & {
  explanation: string[];
};

export function parseJsonValue(value: unknown) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function normalizeStringArray(value: unknown): string[] {
  const parsed = parseJsonValue(value);

  if (Array.isArray(parsed)) {
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return [parsed.trim()];
  }

  return [];
}

export function normalizeDailyPlan(value: unknown): AIPlanData["daily_plan"] {
  const parsed = parseJsonValue(value);

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const mealItem = item as { meal?: unknown; description?: unknown };
    const meal = typeof mealItem.meal === "string" ? mealItem.meal : "";
    const description =
      typeof mealItem.description === "string" ? mealItem.description.trim() : "";

    if (
      !["Breakfast", "Lunch", "Dinner", "Snack"].includes(meal) ||
      !description
    ) {
      return [];
    }

    return [{ meal: meal as AIPlanData["daily_plan"][number]["meal"], description }];
  });
}

export function normalizeWeeklyPlan(value: unknown): AIPlanData["weekly_plan"] {
  const parsed = parseJsonValue(value);
  const weeklyItems =
    Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as { days?: unknown }).days)
        ? (parsed as { days: unknown[] }).days
        : [];

  return weeklyItems.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const dayPlan = item as { day?: unknown; meals?: unknown };
    const day =
      typeof dayPlan.day === "number"
        ? dayPlan.day
        : typeof dayPlan.day === "string"
          ? Number(dayPlan.day)
          : NaN;

    if (!Number.isInteger(day) || !Array.isArray(dayPlan.meals)) return [];

    const meals = dayPlan.meals.flatMap((mealValue) => {
      if (!mealValue || typeof mealValue !== "object") return [];

      const meal = mealValue as Record<string, unknown>;
      const mealName =
        typeof meal.meal === "string" ? meal.meal.toLowerCase() : "";
      const name = typeof meal.name === "string" ? meal.name.trim() : "";
      const calories = Number(meal.calories);
      const protein = Number(meal.protein);
      const carbs = Number(meal.carbs);
      const fats = Number(meal.fats);

      if (
        !["breakfast", "lunch", "dinner", "snack"].includes(mealName) ||
        !name ||
        !Number.isFinite(calories) ||
        !Number.isFinite(protein) ||
        !Number.isFinite(carbs) ||
        !Number.isFinite(fats)
      ) {
        return [];
      }

      return [
        {
          meal: mealName as AIPlanData["weekly_plan"][number]["meals"][number]["meal"],
          name,
          calories,
          protein,
          carbs,
          fats,
        },
      ];
    });

    return meals.length > 0 ? [{ day, meals }] : [];
  });
}

export function normalizeAIPlanData(
  planData: RawAIPlanData | null | undefined
): NormalizedAIPlanData {
  return {
    daily_plan: normalizeDailyPlan(planData?.daily_plan),
    weekly_plan: normalizeWeeklyPlan(planData?.weekly_plan),
    monthly_tips: normalizeStringArray(planData?.monthly_tips),
    explanation: normalizeStringArray(planData?.explanation),
  };
}

export function normalizeAIPlanRow(row: AIPlanRow): AIPlan {
  const fallbackPlan = normalizeAIPlanData(row.plan_data);
  const splitPlan = normalizeAIPlanData({
    daily_plan: row.daily_plan,
    weekly_plan: row.weekly_plan,
    monthly_tips: row.monthly_tips,
    explanation: row.explanation,
  });

  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    daily_plan:
      splitPlan.daily_plan.length > 0 ? splitPlan.daily_plan : fallbackPlan.daily_plan,
    weekly_plan:
      splitPlan.weekly_plan.length > 0 ? splitPlan.weekly_plan : fallbackPlan.weekly_plan,
    monthly_tips:
      splitPlan.monthly_tips.length > 0
        ? splitPlan.monthly_tips
        : fallbackPlan.monthly_tips,
    explanation:
      splitPlan.explanation.length > 0
        ? splitPlan.explanation
        : fallbackPlan.explanation,
  };
}
