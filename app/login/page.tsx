"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, LogIn, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: "",
    type: "",
  });

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(false);

  const getProfileRoute = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? "/dashboard" : "/setup";
  };

  useEffect(() => {
    const checkProfile = async () => {
      if (!authLoading && user) {
        try {
          setCheckingProfile(true);
          const route = await getProfileRoute(user.id);
          router.replace(route);
        } catch {
          setMessage({
            text: "Unable to load your profile. Please try again.",
            type: "error",
          });
          setCheckingProfile(false);
        }
      }
    };

    checkProfile();
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage({
        text: "Invalid email or password.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage({
        text: "Login failed. No session created.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const route = await getProfileRoute(data.session.user.id);
      router.replace(route);
    } catch {
      setMessage({
        text: "Login succeeded, but we could not load your profile.",
        type: "error",
      });
      setLoading(false);
    }
  };

  if (authLoading || checkingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fff8ea] px-6 text-sm font-semibold text-slate-500">
        Redirecting...
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(95,127,58,0.22),transparent_28rem),radial-gradient(circle_at_88%_12%,rgba(242,143,124,0.18),transparent_26rem),linear-gradient(135deg,#fffaf0,#edf7e8_45%,#fff8ea)] px-4 py-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid lg:grid-cols-[1fr_0.9fr] gap-6 items-stretch"
      >
        <section className="hidden lg:flex rounded-[2rem] bg-gradient-to-br from-[#5f7f3a] via-[#8fa58a] to-[#3b4f23] p-8 text-white shadow-2xl shadow-[#5f7f3a]/20 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mt-auto">
            <div className="h-14 w-14 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
              <Leaf size={28} />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#dff5df]">
              NutriScan AI
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Your nutrition dashboard, coached by AI.
            </h1>
            <p className="mt-4 max-w-md text-[#fff8ea]/85 font-medium leading-relaxed">
              Track meals, macros, hydration, and personalized plans in one calm wellness workspace.
            </p>
          </div>
        </section>

        <section className="wellness-surface rounded-[2rem] p-6 sm:p-8">
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
                Smart nutrition
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Welcome back
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Sign in to continue your wellness routine.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
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

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#dcebd1] bg-white/85 px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#8fa58a] focus:ring-4 focus:ring-[#5f7f3a]/10"
              />
            </label>

            <div className="text-right">
              <Link
                href="/forgot"
                className="text-xs font-bold text-[#5f7f3a] hover:text-[#4d6b2f]"
              >
                Forgot password?
              </Link>
            </div>

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

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5f7f3a] px-5 py-3.5 font-black text-white shadow-lg shadow-[#5f7f3a]/20 transition hover:bg-[#4d6b2f] disabled:opacity-70 focus-ring"
            >
              <LogIn size={18} />
              {loading ? "Authenticating..." : "Sign In"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Do not have an account?{" "}
            <Link href="/signup" className="font-black text-[#5f7f3a]">
              Create one
            </Link>
          </p>
        </section>
      </motion.div>
    </main>
  );
}
