"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile, Goal, DietType, Gender, ActivityLevel } from "@/types/profile";
import {
  Save, RefreshCw, User, Scale, Ruler,
  Activity, Utensils, HeartPulse, Sparkles, Check
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const cardStyles = {
  base: "relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
  inactive: "border-gray-100 bg-gray-50/50 text-gray-400 hover:bg-gray-100",
  active: "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm",
};

export default function ProfilesCRUD() {
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<Partial<Profile>>({
    full_name: "",
    gender: "Male" as Gender,
    age: 0,
    height: 0,
    weight: 0,
    diet_type: "Omnivore" as DietType,
    goal: "Maintenance" as Goal,
    activity_level: "moderate" as ActivityLevel,
    meal_frequency: 3,
    chronic_conditions: "",
  });

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setForm(data);
    }
    loadProfile();
  }, []);

  // Handle Save
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Edge Case: Incomplete profile
    if (!form.full_name || !form.age || !form.height || !form.weight) {
      toast.error("Profile is incomplete. Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Edge Case: Chronic conditions too long
    if (form.chronic_conditions && form.chronic_conditions.length > 500) {
      toast.error("Allergies / medical conditions input is too long. Max 500 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      const { error } = await supabase.from("profiles").upsert([{
        id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Error saving profile. Please try again.");
    }

    setLoading(false);
  }

  const labelClasses = "flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest";
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-800 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all";

  return (
    <>
      {/* Toaster for alerts */}
      <Toaster position="top-right" reverseOrder={false} />

      <form onSubmit={handleSave} className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-[2rem] text-white">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight">AI Personalization</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Optimize algorithms for precision results</p>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className={labelClasses}><User size={14} /> Full Name</label>
          <input
            type="text"
            className={inputClasses}
            value={form.full_name || ""}
            onChange={e => {
              const value = e.target.value;
              if (!value) toast.error("Full Name cannot be empty.");
              setForm({ ...form, full_name: value });
            }}
            placeholder="John Doe"
          />
        </div>

        {/* Physical Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {/* Weight */}
          <div>
            <label className={labelClasses}><Scale size={14} /> Weight (kg)</label>
            <input
              type="number"
              className={inputClasses}
              value={form.weight || ""}
              onChange={e => {
                let weight = Number(e.target.value);
                if (weight <= 0) {
                  toast.error("Weight must be greater than 0.");
                  weight = 1;
                }
                setForm({ ...form, weight });
              }}
            />
          </div>

          {/* Height */}
          <div>
            <label className={labelClasses}><Ruler size={14} /> Height (cm)</label>
            <input
              type="number"
              className={inputClasses}
              value={form.height || ""}
              onChange={e => {
                let height = Number(e.target.value);
                if (height <= 0) {
                  toast.error("Height must be greater than 0.");
                  height = 50;
                }
                setForm({ ...form, height });
              }}
            />
          </div>

          {/* Age */}
          <div>
            <label className={labelClasses}><User size={14} /> Age</label>
            <input
              type="number"
              className={inputClasses}
              value={form.age || ""}
              onChange={e => {
                const inputValue = e.target.value;
                let age = Number(inputValue);
                if (!inputValue || isNaN(age)) {
                  setForm({ ...form, age: 0 });
                  return;
                }
                if (age < 1) {
                  toast.error("Age must be at least 1 year.");
                  age = 1;
                } else if (age > 120) {
                  toast.error("Age cannot exceed 120 years.");
                  age = 120;
                }
                setForm({ ...form, age });
              }}
              placeholder="Enter your age"
            />
          </div>
        </div>

        {/* Diet Selection */}
        <div>
          <label className={labelClasses}><Utensils size={14} /> Dietary Regime</label>
          <div className="grid grid-cols-2 gap-3">
            {(["Omnivore", "Vegan", "Vegetarian", "Keto"] as DietType[]).map(type => (
              <div
                key={type}
                onClick={() => setForm({ ...form, diet_type: type })}
                className={`${cardStyles.base} ${form.diet_type === type ? cardStyles.active : cardStyles.inactive}`}
              >
                <span className="font-bold text-sm">{type}</span>
                {form.diet_type === type && <Check size={14} className="absolute right-3 top-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className={labelClasses}><Activity size={14} /> Primary Goal</label>
          <div className="grid grid-cols-1 gap-3">
            {(["Weight Loss", "Maintenance", "Muscle Gain"] as Goal[]).map(g => (
              <div
                key={g}
                onClick={() => setForm({ ...form, goal: g })}
                className={`${cardStyles.base} flex items-center justify-between ${form.goal === g ? cardStyles.active : cardStyles.inactive}`}
              >
                <span className="font-bold text-sm">{g}</span>
                {form.goal === g && <Check size={14} />}
              </div>
            ))}
          </div>
        </div>

        {/* Meal Frequency */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-100">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-6 tracking-[0.2em] opacity-80">
            <Utensils size={14} /> Meal Frequency
          </label>
          <input
            type="range" min="1" max="8"
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white mb-6"
            value={form.meal_frequency || 3}
            onChange={e => setForm({ ...form, meal_frequency: Number(e.target.value) })}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold opacity-60 uppercase">1 Meal</span>
            <div className="bg-white/20 px-6 py-2 rounded-2xl text-xs font-black tracking-widest uppercase">
              {form.meal_frequency} Meals Per Day
            </div>
            <span className="text-[10px] font-bold opacity-60 uppercase">8 Meals</span>
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <label className={labelClasses}><HeartPulse size={14} /> Medical Conditions</label>
          <textarea
            rows={3}
            className={`${inputClasses} resize-none`}
            value={form.chronic_conditions || ""}
            onChange={e => {
              let value = e.target.value;
              if (value.length > 500) {
                toast.error("Allergies / medical conditions input is too long. Max 500 characters.");
                value = value.slice(0, 500);
              }
              setForm({ ...form, chronic_conditions: value });
            }}
            placeholder="Allergies, chronic conditions, etc."
          />
          <p className="text-right text-xs text-gray-400 mt-1">
            {form.chronic_conditions ? form.chronic_conditions.length : 0} / 500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full h-20 overflow-hidden rounded-[2rem] bg-slate-900 font-black text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Save size={20} />
            <span className="tracking-widest uppercase text-xs">Update Profile</span>
          </div>
          <div className="flex items-center justify-center gap-3 transition-all duration-300 group-hover:translate-y-12">
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="tracking-widest uppercase text-xs">Save Changes</span>
          </div>
        </button>
      </form>
    </>
  );
}