"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: "",
    type: "",
  });

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({
        text: "Password reset link sent. Check your email.",
        type: "success",
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(95,127,58,0.22),transparent_28rem),radial-gradient(circle_at_88%_12%,rgba(242,143,124,0.18),transparent_26rem),linear-gradient(135deg,#fffaf0,#edf7e8_45%,#fff8ea)] px-4 py-8 flex items-center justify-center">
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="wellness-surface w-full max-w-md rounded-[2rem] p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-3xl bg-gradient-to-br from-[#5f7f3a] via-[#8fa58a] to-[#f28f7c] text-white flex items-center justify-center shadow-lg shadow-[#5f7f3a]/20">
            <Leaf size={23} />
            <Sparkles size={11} className="absolute right-2.5 top-2.5" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-slate-950">
              NutriScan <span className="text-[#5f7f3a]">AI</span>
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">
              Account recovery
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Reset Password
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Enter your email and we will send a reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              <Mail size={14} /> Email Address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#dcebd1] bg-white/85 px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#8fa58a] focus:ring-4 focus:ring-[#5f7f3a]/10"
            />
          </label>

          {message.text && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                message.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : "bg-[#dff5df] text-[#5f7f3a] border border-[#bcd3b1]"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5f7f3a] px-5 py-3.5 font-black text-white shadow-lg shadow-[#5f7f3a]/20 transition hover:bg-[#4d6b2f] disabled:opacity-70 focus-ring"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Remembered your password?{" "}
          <Link href="/login" className="font-black text-[#5f7f3a]">
            Sign in
          </Link>
        </p>
      </motion.section>
    </main>
  );
}
