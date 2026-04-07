"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "./steps";
import type { FormProfile, FormUpdater } from "@/types/formTypes";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormProfile>({
    gender: undefined,
    age: undefined,
    height: undefined,
    weight: undefined,
    diet_type: undefined,
    activity_level: undefined,
    goal: undefined,
    allergies: null,
    intolerances: null,
    chronic_conditions: null,
    meal_frequency: null,
  });

  const update: FormUpdater = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

 const handleSubmit = async () => {
  setLoading(true);

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) {
    alert("Duhet të jeni të loguar.");
    router.push("/login");
    setLoading(false);
    return;
  }

  // Konverto undefined → null për kolonat nullable
  const payload = Object.fromEntries(
    Object.entries(formData).map(([key, value]) => [key, value === undefined ? null : value])
  );

  try {
    const { error } = await supabase.from("profiles").insert({
      id: user.id, // UUID nga Supabase user
      ...payload,
      // Konverto allergies dhe intolerances nga string → array vetem per insert
      allergies: formData.allergies ? formData.allergies.split(",").map((s) => s.trim()) : [],
      intolerances: formData.intolerances ? formData.intolerances.split(",").map((s) => s.trim()) : [],
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Gabim gjatë ruajtjes:", error.message, error.details);
      alert("Gabim gjatë ruajtjes.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  } catch (err) {
    console.error("Gabim i panjohur:", err);
    alert("Gabim i panjohur gjatë ruajtjes.");
    setLoading(false);
  }
};
  const CurrentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6">
      <div className="w-full max-w-2xl">
        {/* 🌿 CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Setup your profile</h1>
            <p className="text-slate-400 text-sm">
              Step {step + 1} of {STEPS.length}
            </p>

            {/* PROGRESS BAR */}
            <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* STEP CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStep formData={formData} update={update} />
            </motion.div>
          </AnimatePresence>

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
              className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-30"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:scale-105 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:scale-105 transition"
              >
                {loading ? "Saving..." : "Finish"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}