"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const checkProfile = async () => {
      if (!authLoading && user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!data) {
          router.push("/setup");
        } else {
          router.push("/dashboard");
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
      email,
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

    // ✅ sigurohu që user ekziston
    if (!data.session) {
      setMessage({
        text: "Login failed. No session created.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // ✅ login sukses
    router.push("/setup");
  };

  if (authLoading) return null;

  return (
    <main style={styles.main}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.card}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          style={styles.logo}
        >
          🌿 NutriScan <span style={styles.aiTag}>AI</span>
        </motion.div>

        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>
          Connect to your virtual nutritionist
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          {/* EMAIL */}
          <div style={styles.inputWrapper}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <label
              style={{
                ...styles.label,
                top: email ? "-8px" : "50%",
                fontSize: email ? "0.7rem" : "0.9rem",
                color: email ? "#2D6A4F" : "#94A3B8",
              }}
            >
              Email Address
            </label>
          </div>

          {/* PASSWORD */}
          <div style={styles.inputWrapper}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <label
              style={{
                ...styles.label,
                top: password ? "-8px" : "50%",
                fontSize: password ? "0.7rem" : "0.9rem",
                color: password ? "#2D6A4F" : "#94A3B8",
              }}
            >
              Password
            </label>
          </div>

          <div style={{ textAlign: "right" }}>
            <Link href="/forgot" style={styles.forgot}>
              Forgot password?
            </Link>
          </div>

          {/* MESSAGE */}
          {message.text && (
            <div
              style={{
                ...styles.message,
                backgroundColor:
                  message.type === "error" ? "#FFF1F2" : "#ECFDF5",
                color:
                  message.type === "error" ? "#BE123C" : "#065F46",
              }}
            >
              {message.text}
            </div>
          )}

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </motion.button>
        </form>

        <p style={styles.footer}>
          Don’t have an account?
          <Link href="/signup" style={styles.signup}>
            {" "}Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
    background: "linear-gradient(135deg, #0F172A, #1E293B, #064E3B)",
    position: "relative",
    overflow: "hidden",
    padding: "clamp(12px, 4vw, 24px)", // ✅ responsive spacing
  },

  /* 🌟 Glow Effects */
  glow1: {
    position: "absolute",
    width: "clamp(200px, 40vw, 320px)",
    height: "clamp(200px, 40vw, 320px)",
    background: "#10B981",
    filter: "blur(140px)",
    top: "-80px",
    left: "-80px",
    opacity: 0.35,
    zIndex: 0,
  },

  glow2: {
    position: "absolute",
    width: "clamp(180px, 35vw, 260px)",
    height: "clamp(180px, 35vw, 260px)",
    background: "#22D3EE",
    filter: "blur(120px)",
    bottom: "-60px",
    right: "-60px",
    opacity: 0.3,
    zIndex: 0,
  },

  /* 💎 Card */
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "clamp(24px, 5vw, 42px)",
    borderRadius: "clamp(18px, 4vw, 26px)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(22px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    zIndex: 10,
  },

  /* 🌿 Logo */
  logo: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
    marginBottom: "18px",
    color: "#D1FAE5",
  },

  aiTag: {
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#fff",
    padding: "3px 9px",
    borderRadius: "12px",
    fontSize: "0.65rem",
    marginLeft: "6px",
    fontWeight: "700",
  },

  /* 🧠 Text */
  title: {
    textAlign: "center",
    fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: "6px",
  },

  subtitle: {
    textAlign: "center",
    fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)",
    color: "#94A3B8",
    marginBottom: "clamp(18px, 4vw, 30px)",
  },

  /* 📦 Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(14px, 3vw, 20px)",
  },

  inputWrapper: {
    position: "relative",
  },

  /* 💎 Inputs */
  input: {
    width: "100%",
    padding: "clamp(12px, 3vw, 15px)",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    fontSize: "16px", // ✅ FIX mobile zoom
    color: "#F8FAFC",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(8px)",
    transition: "all 0.25s ease",
  },

  label: {
    position: "absolute",
    left: "14px",
    transform: "translateY(-50%)",
    background: "transparent",
    padding: "0 6px",
    transition: "0.2s ease",
    pointerEvents: "none",
  },

  /* 🔗 Links */
  forgot: {
    fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
    color: "#34D399",
    textDecoration: "none",
    fontWeight: "500",
  },

  signup: {
    color: "#34D399",
    fontWeight: "700",
    textDecoration: "none",
  },

  /* 🚀 Button */
  button: {
    padding: "clamp(12px, 3vw, 15px)",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
    boxShadow: "0 12px 30px rgba(16,185,129,0.35)",
    transition: "all 0.3s ease",
  },

  /* 💬 Message */
  message: {
    padding: "12px",
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "0.85rem",
    backdropFilter: "blur(10px)",
  },

  /* 📌 Footer */
  footer: {
    marginTop: "clamp(16px, 3vw, 24px)",
    textAlign: "center",
    fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
    color: "#94A3B8",
  },
};