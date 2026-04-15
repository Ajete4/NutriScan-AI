"use client";

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

export default function MealScanner() {
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

      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI analysis failed.");
        return;
      }

      setAnalysis(data as MealAnalysis);
      setSuccessMessage("AI analysis completed successfully.");
    } catch (err) {
      console.error("Analyze error:", err);
      setError("Failed to analyze meal. Please try again.");
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
    <div className="self-start bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={14} />
            AI Scanner
          </div>

          <h3 className="text-xl font-black text-slate-900 mt-3">
            Scan your meal
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Upload a meal photo and let AI estimate calories and macros
          </p>

          <div className="flex gap-2 text-xs font-semibold text-slate-400 mt-3 flex-wrap">
            <span className={selectedFile ? "text-emerald-600" : ""}>
              1. Upload
            </span>
            <span>→</span>
            <span className={uploadedImageUrl ? "text-emerald-600" : ""}>
              2. Analyze
            </span>
            <span>→</span>
            <span className={analysis ? "text-emerald-600" : ""}>
              3. Save
            </span>
          </div>
        </div>

        <button
          onClick={handleChooseImage}
          disabled={uploading || analyzing || saving}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-70"
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
          className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <ImageIcon size={24} className="text-slate-400" />
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
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200">
            <img
              src={previewUrl}
              alt="Meal preview"
              className="w-full h-[260px] object-cover"
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

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleChooseImage}
              disabled={uploading || analyzing || saving}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-70"
            >
              Change
            </button>

            <button
              onClick={handleRemoveImage}
              disabled={uploading || analyzing || saving}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-70"
            >
              <X size={18} />
              Remove
            </button>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || analyzing || saving}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-70"
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
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-70"
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
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {successMessage}
        </div>
      )}

      {analysis && (
        <div className="bg-violet-50 border border-violet-100 rounded-[2rem] p-5 space-y-4">
          <div className="flex items-center gap-2 text-violet-700 font-bold">
            <Brain size={18} />
            AI Result
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-violet-100 col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Meal
              </p>
              <p className="text-lg font-black text-slate-900 mt-1">
                {analysis.meal_name}
              </p>
              <p className="text-sm text-violet-700 font-semibold mt-1 capitalize">
                {analysis.meal_type}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-violet-100">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Calories
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.calories}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-violet-100">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Protein
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.protein}g
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-violet-100">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Carbs
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {analysis.carbs}g
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-violet-100">
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-70"
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