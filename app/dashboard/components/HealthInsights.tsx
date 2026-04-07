import { Profile } from "@/types/profile";
import { Activity, Heart, Info } from "lucide-react";

export default function HealthInsights({ profile }: { profile: Profile }) {
  const heightInMeters = (profile.height || 0) / 100;
  const bmi = heightInMeters > 0 ? ((profile.weight || 0) / (heightInMeters * heightInMeters)).toFixed(1) : 0;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Nënpeshë", color: "text-blue-500", bg: "bg-blue-50" };
    if (bmi < 25) return { label: "Normal", color: "text-emerald-500", bg: "bg-emerald-50" };
    if (bmi < 30) return { label: "Mbipeshë", color: "text-orange-500", bg: "bg-orange-50" };
    return { label: "Obezitet", color: "text-red-500", bg: "bg-red-50" };
  };

  const category = getBMICategory(Number(bmi));

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Analiza e Trupit</h3>
        <Info size={16} className="text-gray-300" />
      </div>
      
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
        <div className={`w-12 h-12 ${category.bg} rounded-xl flex items-center justify-center text-xl`}>
          <Activity className={category.color} />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase">BMI Juaj</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{bmi}</span>
            <span className={`text-xs font-bold ${category.color}`}>{category.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}