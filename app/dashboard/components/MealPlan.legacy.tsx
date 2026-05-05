"use client";

import type {
  AIPlan,
  AIPlanData,
  DailyMealItem,
  WeeklyDayPlan,
  WeeklyMealItem,
} from "@/types/ai";

type MealPlanProps = {
  plan: AIPlan | AIPlanData | null;
};

function isWeeklyMealItem(value: unknown): value is WeeklyMealItem {
  if (!value || typeof value !== "object") return false;

  const meal = value as Partial<WeeklyMealItem>;

  return (
    typeof meal.meal === "string" &&
    typeof meal.name === "string" &&
    typeof meal.calories === "number" &&
    typeof meal.protein === "number" &&
    typeof meal.carbs === "number" &&
    typeof meal.fats === "number"
  );
}

function parseJsonValue(value: unknown) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeDailyPlan(value: unknown): DailyMealItem[] {
  const parsed = parseJsonValue(value);

  return Array.isArray(parsed)
    ? parsed.filter(
        (item): item is DailyMealItem =>
          item &&
          typeof item === "object" &&
          typeof (item as Partial<DailyMealItem>).meal === "string" &&
          typeof (item as Partial<DailyMealItem>).description === "string"
      )
    : [];
}

function normalizeWeeklyPlan(value: unknown): WeeklyDayPlan[] {
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
      if (isWeeklyMealItem(mealValue)) return [mealValue];
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
          meal: mealName as WeeklyMealItem["meal"],
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

export default function MealPlan({ plan }: MealPlanProps) {
  if (!plan) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-gray-500">AI meal plan is being generated...</p>
      </div>
    );
  }

  const dailyPlan = normalizeDailyPlan(plan.daily_plan);
  const weeklyPlan = normalizeWeeklyPlan(plan.weekly_plan);

  return (
    <div className="bg-white p-6 rounded-2xl shadow space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">AI Meal Plan (Daily)</h3>
        <ul className="space-y-3">
          {dailyPlan.map((mealItem, index) => (
            <li key={index} className="text-gray-700">
              <span className="font-semibold">
                {mealItem.meal}:
              </span>{" "}
              {mealItem.description}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">AI Meal Plan (Weekly)</h3>
        {weeklyPlan.length === 0 ? (
          <p className="text-gray-500">No structured weekly meals found.</p>
        ) : (
          <div className="space-y-4">
            {weeklyPlan.map((dayPlan) => (
              <div key={dayPlan.day}>
                <p className="font-semibold text-gray-700">Day {dayPlan.day}</p>
                <ul className="mt-2 space-y-2">
                  {dayPlan.meals.map((meal, index) => (
                    <li key={`${dayPlan.day}-${meal.meal}-${index}`} className="text-gray-700">
                      <span className="font-semibold capitalize">{meal.meal}:</span>{" "}
                      {meal.name} ({meal.calories} cal, {meal.protein}g protein,{" "}
                      {meal.carbs}g carbs, {meal.fats}g fats)
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Monthly Tips</h3>
        <ul className="space-y-2">
          {plan.monthly_tips.map((tip, index) => (
            <li key={index} className="text-gray-700">
              • {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
