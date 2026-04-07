"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile, Goal, DietType, Gender, ActivityLevel } from "@/types/profile";
import { Save, RefreshCw, User, Scale, Ruler, Activity, Utensils, HeartPulse, Sparkles } from "lucide-react";

export default function ProfilesCRUD() {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({
    full_name: "",
    gender: "Mashkull" as Gender,
    age: 0,
    height: 0,
    weight: 0,
    diet_type: "Gjithçka" as DietType,
    goal: "Mirëmbajtje" as Goal,
    activity_level: "moderate" as ActivityLevel,
    meal_frequency: 3,
    chronic_conditions: "",
  });

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setForm(data);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").upsert([{ id: user.id, ...form, updated_at: new Date().toISOString() }]);
      if (!error) window.location.reload();
    }
    setLoading(false);
  }

  const inputWrapper = (id: string) => `relative group transition-all duration-300 ${activeField === id ? 'scale-[1.02]' : 'scale-100'}`;
  
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-800 font-semibold focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none placeholder:text-gray-300 shadow-sm";
  
  const labelClasses = "flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-[0.1em] group-focus-within:text-emerald-600 transition-colors";

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-4">
      {/* Header Vizual i Vogël brenda Modalit */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
        <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-200">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-emerald-900 tracking-tight">Personalizimi i AI</h3>
          <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Optimizoni algoritmin për rezultate precize</p>
        </div>
      </div>

      {/* Emri i Plotë */}
      <div className={inputWrapper("name")}>
        <label className={labelClasses}><User size={14} /> Identiteti</label>
        <input 
          type="text" 
          onFocus={() => setActiveField("name")}
          onBlur={() => setActiveField(null)}
          className={inputClasses} 
          value={form.full_name || ""} 
          onChange={e => setForm({ ...form, full_name: e.target.value })} 
          placeholder="Emri dhe Mbiemri"
        />
      </div>

      {/* Grid për Fizikun */}
      <div className="grid grid-cols-2 gap-5">
        <div className={inputWrapper("weight")}>
          <label className={labelClasses}><Scale size={14} /> Pesha <span className="lowercase text-[9px] opacity-60">(kg)</span></label>
          <input 
            type="number" 
            onFocus={() => setActiveField("weight")}
            onBlur={() => setActiveField(null)}
            className={inputClasses} 
            value={form.weight || ""} 
            onChange={e => setForm({ ...form, weight: Number(e.target.value) })} 
          />
        </div>
        <div className={inputWrapper("height")}>
          <label className={labelClasses}><Ruler size={14} /> Gjatësia <span className="lowercase text-[9px] opacity-60">(cm)</span></label>
          <input 
            type="number" 
            onFocus={() => setActiveField("height")}
            onBlur={() => setActiveField(null)}
            className={inputClasses} 
            value={form.height || ""} 
            onChange={e => setForm({ ...form, height: Number(e.target.value) })} 
          />
        </div>
      </div>

      {/* Grid për Preferencat */}
      <div className="grid grid-cols-2 gap-5">
        <div className={inputWrapper("diet")}>
          <label className={labelClasses}>Regjimi</label>
          <select 
            className={inputClasses} 
            value={form.diet_type} 
            onChange={e => setForm({ ...form, diet_type: e.target.value as DietType })}
          >
            <option value="Gjithçka">Gjithçka</option>
            <option value="Vegan">🌱 Vegan</option>
            <option value="Vegetarian">🥗 Vegetarian</option>
            <option value="Keto">🥩 Keto</option>
          </select>
        </div>
        <div className={inputWrapper("goal")}>
          <label className={labelClasses}>Objektivi</label>
          <select 
            className={inputClasses} 
            value={form.goal} 
            onChange={e => setForm({ ...form, goal: e.target.value as Goal })}
          >
            <option value="Humbje peshe">Humbje peshe</option>
            <option value="Mirëmbajtje">Mirëmbajtje</option>
            <option value="Shtim muskulor">Shtim muskulor</option>
          </select>
        </div>
      </div>

      {/* Niveli i Aktivitetit me Card-style Select */}
      <div className={inputWrapper("activity")}>
        <label className={labelClasses}><Activity size={14} /> Intensiteti i Jetës</label>
        <select 
          className={inputClasses} 
          value={form.activity_level} 
          onChange={e => setForm({ ...form, activity_level: e.target.value as ActivityLevel })}
        >
          <option value="sedentary">Sedentar (Pak lëvizje)</option>
          <option value="moderate">Aktiv (Ushtrime 3-5 ditë)</option>
          <option value="very_active">Shumë Aktiv (Sportist)</option>
        </select>
      </div>

      {/* Vaktet - Slider i personalizuar */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-100">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-4 tracking-widest opacity-80">
          <Utensils size={14} /> Frekuenca e ushqimit
        </label>
        <input 
          type="range" min="1" max="8" 
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white mb-4"
          value={form.meal_frequency || 3}
          onChange={e => setForm({ ...form, meal_frequency: Number(e.target.value) })}
        />
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold opacity-60">1 VAKT</span>
          <div className="bg-white/20 px-4 py-1 rounded-full text-xs font-black">
            {form.meal_frequency} VAKTE NË DITË
          </div>
          <span className="text-[10px] font-bold opacity-60">8 VAKTE</span>
        </div>
      </div>

      {/* Shënime Shëndetësore */}
      <div className={inputWrapper("notes")}>
        <label className={labelClasses}><HeartPulse size={14} /> Kushte Shëndetësore</label>
        <textarea 
          rows={2} 
          className={`${inputClasses} resize-none py-4`} 
          value={form.chronic_conditions || ""} 
          onChange={e => setForm({ ...form, chronic_conditions: e.target.value })}
          placeholder="Alergji ose shënime tjera..."
        />
      </div>

      {/* Butoni Ruaj - Ultra Estetik */}
      <button 
        type="submit" 
        disabled={loading}
        className="group relative w-full h-16 overflow-hidden rounded-2xl bg-gray-900 font-black text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Save size={20} />
          <span>PËRDITËSO PROFILIN</span>
        </div>
        <div className="flex items-center justify-center gap-3 transition-all duration-300 group-hover:translate-y-10">
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          <span>RUANI NDRYSHIMET</span>
        </div>
      </button>
    </form>
  );
}
