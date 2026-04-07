"use client";

import { AIPlan } from "@/types/ai";

interface Props {
  plan?: AIPlan | null;
}

export default function AIRecommendations({ plan }: Props) {
  // SAFETY CHECK
  if (!plan) {
    return (
      <div className="bg-gray-50 p-6 rounded-2xl border text-gray-500">
        No AI plan available yet...
      </div>
    );
  }

  // FALLBACK (nëse AI kthen data jo valide)
  const daily = Array.isArray(plan.daily_plan) ? plan.daily_plan : [];
  const weekly = Array.isArray(plan.weekly_plan) ? plan.weekly_plan : [];
  const monthly = Array.isArray(plan.monthly_tips) ? plan.monthly_tips : [];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">

      {/* HEADER */}
      <h4 className="text-indigo-900 font-black text-sm uppercase mb-6 tracking-wide">
        🤖 AI Nutrition Plan
      </h4>

      {/* DAILY PLAN */}
      <Section title="Daily Plan" items={daily} />

      {/* WEEKLY PLAN */}
      <Section title="Weekly Plan" items={weekly} />

      {/* MONTHLY TIPS */}
      <Section title="Monthly Tips" items={monthly} />
    </div>
  );
}

// 🔥 Reusable Section Component
function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-6 last:mb-0">
      <h5 className="font-bold text-indigo-800 mb-2">{title}</h5>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No data available
        </p>
      ) : (
        <ul className="space-y-2 text-sm text-indigo-700">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-indigo-50"
            >
              <span className="text-indigo-400 mt-[2px]">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}