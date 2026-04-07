"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: "",
    type: "",
  });

  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (password.length < 6) {
      setLoading(false);
      return setMessage({
        text: "Fjalëkalimi duhet të ketë së paku 6 karaktere",
        type: "error",
      });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
      setLoading(false);
    } else {
      setMessage({
        text: "Llogaria u krijua! Kontrolloni email-in.",
        type: "success",
      });

      setTimeout(() => router.push("/dashboard"), 2500);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

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

        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>
          Start your journey to smarter nutrition
        </p>

        <form onSubmit={handleSignUp} style={styles.form}>
          {/* NAME */}
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
            <label
              style={{
                ...styles.label,
                top: name ? "-8px" : "50%",
                fontSize: name ? "0.7rem" : "0.9rem",
                color: name ? "#34D399" : "#94A3B8",
              }}
            >
              Full Name
            </label>
          </div>

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
                color: email ? "#34D399" : "#94A3B8",
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
                color: password ? "#34D399" : "#94A3B8",
              }}
            >
              Password
            </label>
          </div>

          {/* MESSAGE */}
          {message.text && (
            <div
              style={{
                ...styles.message,
                color: message.type === "error" ? "#F87171" : "#34D399",
              }}
            >
              {message.text}
            </div>
          )}

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Creating..." : "Create Account"}
          </motion.button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Already have an account?</p>
          <Link href="/login" style={styles.loginLink}>
            Sign in
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

/* 🔥 SAME STYLE SYSTEM SI LOGIN */
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
    padding: "clamp(12px, 4vw, 24px)",
  },

  glow1: {
    position: "absolute",
    width: "clamp(200px, 40vw, 320px)",
    height: "clamp(200px, 40vw, 320px)",
    background: "#10B981",
    filter: "blur(140px)",
    top: "-80px",
    left: "-80px",
    opacity: 0.35,
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
  },

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

  logo: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
    marginBottom: "16px",
    color: "#D1FAE5",
  },

  aiTag: {
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#fff",
    padding: "3px 9px",
    borderRadius: "12px",
    fontSize: "0.65rem",
    marginLeft: "6px",
  },

  title: {
    textAlign: "center",
    fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
    fontWeight: "800",
    color: "#F1F5F9",
  },

  subtitle: {
    textAlign: "center",
    fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)",
    color: "#94A3B8",
    marginBottom: "24px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  inputWrapper: {
    position: "relative",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    fontSize: "16px",
    color: "#F8FAFC",
    background: "rgba(255,255,255,0.05)",
  },

  label: {
    position: "absolute",
    left: "14px",
    transform: "translateY(-50%)",
    padding: "0 6px",
    transition: "0.2s",
    pointerEvents: "none",
  },

  button: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  message: {
    textAlign: "center",
    fontSize: "0.85rem",
    fontWeight: "600",
  },

  footer: {
    marginTop: "20px",
    textAlign: "center",
  },

  footerText: {
    color: "#94A3B8",
    fontSize: "0.85rem",
  },

  loginLink: {
    color: "#34D399",
    fontWeight: "700",
    textDecoration: "none",
  },
};