"use client";

import type { AIPlan, AIPlanData } from "@/types/ai";

type MealPlanProps = {
  plan: AIPlan | AIPlanData | null;
};

export default function MealPlan({ plan }: MealPlanProps) {
  if (!plan) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-gray-500">AI meal plan is being generated...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">AI Meal Plan (Daily)</h3>
        <ul className="space-y-3">
          {plan.daily_plan.map((mealItem, index) => (
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
        <ul className="space-y-2">
          {plan.weekly_plan.map((dayPlan, index) => (
            <li key={index} className="text-gray-700">
              <span className="font-semibold">Day {index + 1}:</span> {dayPlan}
            </li>
          ))}
        </ul>
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