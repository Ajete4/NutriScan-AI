// components/ProgressChart.tsx
"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ProgressChart() {
  // Vetëm mock data për testim
  const data = [
    { day: "Mon", calories: 2100 },
    { day: "Tue", calories: 1950 },
    { day: "Wed", calories: 2200 },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="text-lg font-bold mb-4">Weekly Progress</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={(value) => value?.toString()} />
          <Bar dataKey="calories" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}