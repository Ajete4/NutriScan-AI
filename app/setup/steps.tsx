"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  User, Scale, UtensilsCrossed, Activity, 
  Target, FileText, Check, Plus, LucideIcon 
} from "lucide-react";

import { DIET_TYPES, ACTIVITY_LEVELS, GOALS } from "./data";
import type { Gender, DietType, ActivityLevel, Goal } from "@/types/profile";
import type { FormProfile, FormUpdater } from "@/types/formTypes";

interface StepProps {
  formData: FormProfile;
  update: FormUpdater;
}

const cardStyles = {
  base: "relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
  inactive: "border-white/10 bg-white/5 backdrop-blur-xl text-slate-300 hover:bg-white/10 hover:scale-[1.02]",
  active: "border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]",
};

/* -------- HEADER COMPONENT -------- */
// Zëvendësuar 'any' me 'LucideIcon' për të shmangur gabimin Unexpected any
function StepTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
  );
}

/* -------- 1. GENDER -------- */
export function GenderStep({ formData, update }: StepProps) {
  const options: { label: Gender; emoji: string }[] = [
    { label: "Male", emoji: "👨" },
    { label: "Female", emoji: "👩" },
  ];

  return (
    <div>
      <StepTitle icon={User} title="Select Gender" />
      <div className="grid grid-cols-2 gap-4">
        {options.map((g) => (
          <motion.div
            key={g.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => update("gender", g.label)}
            className={`${cardStyles.base} text-center ${
              formData.gender === g.label ? cardStyles.active : cardStyles.inactive
            }`}
          >
            <div className="text-4xl mb-2">{g.emoji}</div>
            <p className="font-bold text-lg">{g.label}</p>
            {formData.gender === g.label && (
              <Check className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* -------- 2. DIET TYPE -------- */
const dietDetails: Record<DietType, { icon: string; desc: string }> = {
  Omnivore: { icon: "🍽️", desc: "No restrictions, includes all food groups." },
  Vegan: { icon: "🌱", desc: "Plant-based only, no animal products." },
  Vegetarian: { icon: "🥚", desc: "No meat, but includes dairy and eggs." },
  Keto: { icon: "🥑", desc: "High fat, very low carb intake." },
  Paleo: { icon: "🍖", desc: "Whole foods: meat, fish, and veggies." },
  "Gluten-Free": { icon: "🌾", desc: "Strictly avoids wheat, barley, and rye." },
};

export function DietStep({ formData, update }: StepProps) {
  return (
    <div>
      <StepTitle icon={UtensilsCrossed} title="Dietary Preference" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DIET_TYPES.map((d) => (
          <motion.div
            key={d}
            whileTap={{ scale: 0.95 }}
            onClick={() => update("diet_type", d)}
            className={`${cardStyles.base} flex items-start gap-4 ${
              formData.diet_type === d ? cardStyles.active : cardStyles.inactive
            }`}
          >
            <span className="text-3xl mt-1">{dietDetails[d].icon}</span>
            <div className="text-left">
              <p className="font-bold text-sm">{d}</p>
              <p className="text-[11px] opacity-60 leading-tight">{dietDetails[d].desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* -------- 3. ACTIVITY LEVEL -------- */
const activityDetails: Record<ActivityLevel, { icon: string; desc: string }> = {
  sedentary: { icon: "🪑", desc: "Minimal movement, desk-bound job." },
  lightly_active: { icon: "🚶", desc: "Light exercise 1-3 days/week." },
  moderate: { icon: "🏃", desc: "Moderate exercise 3-5 days/week." },
  very_active: { icon: "🏋️", desc: "Hard exercise 6-7 days/week." },
  athlete: { icon: "🏆", desc: "Physical job or intense training daily." },
};

export function ActivityStep({ formData, update }: StepProps) {
  return (
    <div>
      <StepTitle icon={Activity} title="Activity Level" />
      <div className="space-y-3">
        {ACTIVITY_LEVELS.map((a) => (
          <motion.div
            key={a}
            whileTap={{ scale: 0.98 }}
            onClick={() => update("activity_level", a)}
            className={`${cardStyles.base} flex items-center gap-4 ${
              formData.activity_level === a ? cardStyles.active : cardStyles.inactive
            }`}
          >
            <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl">
              {activityDetails[a].icon}
            </div>
            <div className="flex-1">
              <p className="font-bold capitalize text-sm">{a.replace("_", " ")}</p>
              <p className="text-[11px] opacity-60">{activityDetails[a].desc}</p>
            </div>
            {formData.activity_level === a && <Check className="w-5 h-5 text-emerald-400" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* -------- 4. ALLERGIES -------- */
const COMMON_ALLERGIES = ["Peanuts", "Dairy", "Eggs", "Gluten", "Soy", "Shellfish", "Tree Nuts"];

export function AllergiesStep({ formData, update }: StepProps) {
  const toggleAllergy = (item: string) => {
    const current = formData.allergies || "";
    const list = current.split(", ").filter(Boolean);
    const newList = list.includes(item) 
      ? list.filter((i) => i !== item) 
      : [...list, item];
    update("allergies", newList.join(", "));
  };

  return (
    <div>
      <StepTitle icon={FileText} title="Allergies" />

      {/* Common allergy buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {COMMON_ALLERGIES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => toggleAllergy(a)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
              formData.allergies?.split(", ").includes(a)
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            {a} {formData.allergies?.split(", ").includes(a) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Custom allergies textarea */}
      <textarea
        placeholder="Type any other specific allergies..."
        value={formData.allergies ?? ""}
        onChange={(e) => update("allergies", e.target.value)}
        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 min-h-[120px] focus:border-emerald-500/50 outline-none resize-none"
      />
    </div>
  );
}

/* -------- 5. FITNESS GOALS -------- */
const goalIcons: Record<Goal, string> = {
  "Weight Loss": "🔥",
  Maintenance: "⚖️",
  "Muscle Gain": "💪",
  "Sports Performance": "🏅",
};

export function GoalsStep({ formData, update }: StepProps) {
  return (
    <div>
      <StepTitle icon={Target} title="Fitness Goal" />
      <div className="grid grid-cols-2 gap-4">
        {GOALS.map((g) => (
          <motion.div
            key={g}
            whileTap={{ scale: 0.95 }}
            onClick={() => update("goal", g)}
            className={`${cardStyles.base} flex flex-col items-center justify-center p-6 text-center ${
              formData.goal === g ? cardStyles.active : cardStyles.inactive
            }`}
          >
            <span className="text-3xl mb-3">{goalIcons[g]}</span>
            <span className="font-bold text-xs uppercase tracking-wider">{g}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* -------- 6. PHYSICAL METRICS -------- */
export function BodyStep({ formData, update }: StepProps) {
  const fields: { key: keyof FormProfile; label: string; icon: string }[] = [
    { key: "age", label: "Age", icon: "🎂" },
    { key: "height", label: "Height (cm)", icon: "📏" },
    { key: "weight", label: "Weight (kg)", icon: "⚖️" },
  ];

  return (
    <div>
      <StepTitle icon={Scale} title="Physical Metrics" />
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-50">{field.icon}</span>
            <input
              type="number"
              placeholder={field.label}
              value={(formData[field.key] as string | number) ?? ""}
              onChange={(e) => update(field.key, Number(e.target.value))}
              className="w-full p-5 pl-14 rounded-2xl bg-white/5 border border-white/10 text-white text-lg focus:border-emerald-500/50 transition-all outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- 7. NOTES -------- */
export function NotesStep({ formData, update }: StepProps) {
  return (
    <div>
      <StepTitle icon={FileText} title="Medical Conditions" />
      <textarea
        placeholder="List any chronic conditions or health notes..."
        value={formData.chronic_conditions ?? ""}
        onChange={(e) => update("chronic_conditions", e.target.value)}
        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white min-h-[150px] focus:border-emerald-500/50 outline-none resize-none"
      />
    </div>
  );
}

/* -------- 8. MEAL FREQUENCY -------- */
export function MealFrequencyStep({ formData, update }: StepProps) {
  return (
    <div>
      <StepTitle icon={UtensilsCrossed} title="Daily Meals" />
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-50">🍽️</span>
        <input
          type="number"
          placeholder="Number of meals per day"
          value={formData.meal_frequency ?? ""}
          onChange={(e) => update("meal_frequency", Number(e.target.value))}
          className="w-full p-5 pl-14 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 outline-none"
        />
      </div>
    </div>
  );
}

/* -------- EXPORTS -------- */
export type StepComponent = (props: StepProps) => React.JSX.Element;

export const STEPS: StepComponent[] = [
  GenderStep,
  BodyStep,
  DietStep,
  ActivityStep,
  GoalsStep,
  AllergiesStep,
  NotesStep,
  MealFrequencyStep,
];

