"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { STEPS } from "./steps";
import type { FormProfile, FormUpdater } from "@/types/formTypes";
import { supabase } from "@/lib/supabaseClient";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  useEffect(() => {
    const ensureAuthenticated = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) {
        router.replace("/login");
      }
    };

    ensureAuthenticated();
  }, [router]);

  const update: FormUpdater = (field, value) => {
    setFormError(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isNumberInRange = (value: unknown, min: number, max: number) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max;

  const getStepError = (stepIndex: number) => {
    if (stepIndex === 0 && !formData.gender) {
      return "Please select your gender.";
    }

    if (stepIndex === 1) {
      if (!isNumberInRange(formData.age, 13, 100)) {
        return "Please enter an age between 13 and 100.";
      }

      if (!isNumberInRange(formData.height, 50, 250)) {
        return "Please enter a height between 50 and 250 cm.";
      }

      if (!isNumberInRange(formData.weight, 20, 300)) {
        return "Please enter a weight between 20 and 300 kg.";
      }
    }

    if (stepIndex === 2 && !formData.diet_type) {
      return "Please select your dietary preference.";
    }

    if (stepIndex === 3 && !formData.activity_level) {
      return "Please select your activity level.";
    }

    if (stepIndex === 4 && !formData.goal) {
      return "Please select your fitness goal.";
    }

    if (stepIndex === 7) {
      if (
        typeof formData.meal_frequency !== "number" ||
        !Number.isFinite(formData.meal_frequency) ||
        formData.meal_frequency < 1 ||
        formData.meal_frequency > 6
      ) {
        return "Please enter a meal frequency between 1 and 6.";
      }
    }

    return null;
  };

  const getFormError = () => {
    for (let i = 0; i < STEPS.length; i += 1) {
      const error = getStepError(i);

      if (error) {
        return { error, stepIndex: i };
      }
    }

    return { error: null, stepIndex: step };
  };

  const normalizeText = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };

  const handleNext = () => {
    const error = getStepError(step);

    if (error) {
      setFormError(error);
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    const validation = getFormError();

    if (validation.error) {
      setStep(validation.stepIndex);
      setFormError(validation.error);
      return;
    }

    setLoading(true);
    setFormError(null);

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) {
      setFormError("You must be logged in.");
      router.replace("/login");
      setLoading(false);
      return;
    }

    const fullName =
      typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : user.email?.split("@")[0] || "User";

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        gender: formData.gender,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        diet_type: formData.diet_type,
        activity_level: formData.activity_level,
        goal: formData.goal,
        allergies: formData.allergies ? [formData.allergies] : [],
        intolerances: formData.intolerances ? [formData.intolerances] : [],
        chronic_conditions: formData.chronic_conditions ? [formData.chronic_conditions] : [],
        meal_frequency: formData.meal_frequency,
        updated_at: new Date().toISOString(),
        
      });

      if (error) {
        console.error("Profile save error:", error.message, error.details);
        setFormError("Error while saving your profile. Please try again.");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error("Unknown save error:", err);
      setFormError("Unknown error while saving your profile.");
      setLoading(false);
    }
  };

  const CurrentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_12%_8%,rgba(95,127,58,0.22),transparent_28rem),radial-gradient(circle_at_88%_12%,rgba(242,143,124,0.18),transparent_26rem),linear-gradient(135deg,#fffaf0,#edf7e8_45%,#fff8ea)] p-3 sm:p-6">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="wellness-surface rounded-[2rem] p-4 sm:p-8"
        >
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Setup your profile
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Step {step + 1} of {STEPS.length}
            </p>

            <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#5f7f3a] to-[#f28f7c]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

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

          {formError && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {formError}
            </div>
          )}

          <div className="flex justify-between gap-3 mt-8">
            <button
              onClick={() => {
                setFormError(null);
                setStep((s) => Math.max(s - 1, 0));
              }}
              disabled={step === 0}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-50 transition focus-ring"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-2xl bg-[#5f7f3a] text-white font-bold hover:bg-[#4d6b2f] transition shadow-lg shadow-[#5f7f3a]/20 focus-ring"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-[#5f7f3a] text-white font-bold hover:bg-[#4d6b2f] transition disabled:opacity-60 shadow-lg shadow-[#5f7f3a]/20 focus-ring"
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
