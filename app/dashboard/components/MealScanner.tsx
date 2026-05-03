"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import {
  Camera,
  Upload,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Brain,
  Save,
  X,
} from "lucide-react";

type MealAnalysis = {
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MealScannerProps = {
  onMealSaved?: () => void;
};

export default function MealScanner({ onMealSaved }: MealScannerProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const clearScannerState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setAnalysis(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChooseImage = () => {
    if (uploading || analyzing || saving) return;
    inputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (uploading || analyzing || saving) return;

    clearScannerState();
    resetMessages();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    resetMessages();
    setUploadedImageUrl(null);
    setAnalysis(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!user) {
      setError("You must be logged in to upload a meal photo.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose an image first.");
      return;
    }

    if (uploading || analyzing || saving) return;

    try {
      setUploading(true);
      resetMessages();
      setAnalysis(null);

      const fileExt = selectedFile.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("meal-images")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message || "Image upload failed.");
        return;
      }

      const { data } = supabase.storage
        .from("meal-images")
        .getPublicUrl(fileName);

      setUploadedImageUrl(data.publicUrl);
      setSuccessMessage("Image uploaded successfully. You can now analyze it.");
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImageUrl) {
      setError("Please upload the image before analyzing.");
      return;
    }

    if (analyzing || uploading || saving) return;

    try {
      setAnalyzing(true);
      resetMessages();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Your session expired. Please log in again.");
        return;
      }

      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
        }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After") || "60";
        setError(`Too many requests. Please wait ${retryAfter} seconds.`);
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: "AI service returned an unreadable response." }));

      if (!res.ok) {
        setError(
          data.error ||
            "We couldn't analyze this meal right now. Please try another photo."
        );
        return;
      }

      setAnalysis(data as MealAnalysis);
      setSuccessMessage("AI analysis completed successfully.");
    } catch (err) {
      console.error("Analyze error:", err);
      setError("Network issue while analyzing the meal. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!user) {
      setError("You must be logged in to save a meal.");
      return;
    }

    if (!analysis || !uploadedImageUrl) {
      setError("Please analyze the meal before saving.");
      return;
    }

    if (saving || uploading || analyzing) return;

    try {
      setSaving(true);
      resetMessages();

      const { error: insertError } = await supabase.from("meal_logs").insert({
        user_id: user.id,
        meal_name: analysis.meal_name,
        meal_type: analysis.meal_type,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fats: analysis.fats,
        image_url: uploadedImageUrl,
        logged_at: new Date().toISOString(),
      });

      if (insertError) {
        setError(insertError.message || "Failed to save meal.");
        return;
      }

      setSuccessMessage("Meal saved successfully.");
      onMealSaved?.();

      clearScannerState();

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      console.error("Save meal error:", err);
      setError("Failed to save meal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="self-start wellness-surface premium-card rounded-[2.25rem] p-4 sm:p-6 space-y-5 sm:space-y-6 relative overflow-hidden">
      <div className="absolute -right-12 top-0 h-56 w-56 rounded-full bg-[#f8d5c9]/65 blur-3xl" />
      <div className="absolute -left-16 bottom-16 h-44 w-44 rounded-full bg-[#dff5df]/60 blur-3xl" />
      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#fff3e2] border border-[#f8d5c9] text-[#bd625c] px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.14em]">
            <Sparkles size={14} />
            AI Scanner
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3 tracking-tight">
            Scan your meal
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Upload a meal photo and let AI estimate calories and macros
          </p>

          <div className="flex gap-2 text-[11px] font-black text-slate-400 mt-4 flex-wrap uppercase tracking-[0.12em]">
            <span className={selectedFile ? "text-[#5f7f3a]" : ""}>
              1. Upload
            </span>
            <span>/</span>
            <span className={uploadedImageUrl ? "text-[#5f7f3a]" : ""}>
              2. Analyze
            </span>
            <span>/</span>
            <span className={analysis ? "text-[#5f7f3a]" : ""}>
              3. Save
            </span>
          </div>
        </div>

        <button
          onClick={handleChooseImage}
          disabled={uploading || analyzing || saving}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#5f7f3a] text-white font-bold hover:bg-[#4d6b2f] hover:-translate-y-0.5 shadow-xl shadow-[#5f7f3a]/20 transition disabled:opacity-70 w-full sm:w-auto focus-ring"
        >
          <Camera size={18} />
          Add
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {!previewUrl && (
        <div
          onClick={handleChooseImage}
          className="group border-2 border-dashed border-[#bcd3b1] rounded-[2rem] p-6 sm:p-10 text-center cursor-pointer bg-white/75 hover:border-[#8fa58a] hover:bg-[#dff5df]/50 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#5f7f3a]/10 transition-all duration-300"
        >
          <div className="w-16 h-16 mx-auto rounded-[1.35rem] bg-[#dff5df] flex items-center justify-center mb-4 shadow-lg shadow-[#5f7f3a]/10 transition-transform group-hover:scale-105">
            <ImageIcon size={24} className="text-[#5f7f3a]" />
          </div>

          <p className="font-semibold text-slate-700">
            Click to upload a meal photo
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PNG, JPG or WEBP up to 5MB
          </p>
        </div>
      )}

      {previewUrl && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-[#dcebd1] bg-slate-100 shadow-2xl shadow-[#5f7f3a]/15">
            <Image
              src={previewUrl}
              alt="Meal preview"
              width={960}
              height={720}
              unoptimized
              className="w-full aspect-[4/3] max-h-[320px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {analyzing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing meal...
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleChooseImage}
              disabled={uploading || analyzing || saving}
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-70 focus-ring"
            >
              Change
            </button>

            <button
              onClick={handleRemoveImage}
              disabled={uploading || analyzing || saving}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-white text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-70 focus-ring"
            >
              <X size={18} />
              Remove
            </button>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || analyzing || saving}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-950 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-70 focus-ring"
            >
              {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              {uploading ? "Uploading..." : uploadedImageUrl ? "Uploaded" : "Upload"}
            </button>

            {uploadedImageUrl && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing || uploading || saving}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#f28f7c] text-white font-semibold hover:bg-[#df7b69] shadow-lg shadow-[#f28f7c]/20 transition disabled:opacity-70 sm:col-span-2 focus-ring"
              >
                {analyzing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Brain size={18} />
                )}
                {analyzing ? "Analyzing..." : "Analyze with AI"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-[#dff5df] border border-[#bcd3b1] text-[#5f7f3a] px-4 py-3 rounded-2xl text-sm font-medium">
          {successMessage}
        </div>
      )}

      {analysis && (
        <div className="bg-[#fff3e2]/90 border border-[#f8d5c9] rounded-[1.75rem] p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#bd625c] font-bold">
            <Brain size={18} />
            AI Result
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-[#f8d5c9] col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Meal
              </p>
              <p className="text-lg font-black text-slate-900 mt-1">
                {analysis.meal_name}
              </p>
              <p className="text-sm text-[#bd625c] font-semibold mt-1 capitalize">
                {analysis.meal_type}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#f8d5c9]">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Calories
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.calories}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#f8d5c9]">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Protein
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.protein}g
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#f8d5c9]">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Carbs
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.carbs}g
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#f8d5c9]">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Fats
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.fats}g
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveMeal}
              disabled={!analysis || saving || uploading || analyzing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#5f7f3a] text-white font-semibold hover:bg-[#4d6b2f] shadow-lg shadow-[#5f7f3a]/20 transition disabled:opacity-70 focus-ring"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Meal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
