"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link"; // Importojmë Link për navigim

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ text: "Email ose fjalëkalim i gabuar", type: "error" });
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (authLoading) return null;

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={styles.logo}>🌿 NutriScan</div>
          <h1 style={styles.title}>Mirë se vini</h1>
          <p style={styles.subtitle}>Hyni në llogarinë tuaj për të vazhduar.</p>
        </header>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="emri@shembull.com"
              value={email}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: focusedInput === "email" ? "#101828" : "#CBD5E1",
                boxShadow: focusedInput === "email" ? "0 0 0 4px rgba(16, 24, 40, 0.05)" : "none"
              }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fjalëkalimi</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                borderColor: focusedInput === "password" ? "#101828" : "#CBD5E1",
                boxShadow: focusedInput === "password" ? "0 0 0 4px rgba(16, 24, 40, 0.05)" : "none"
              }}
              required
            />
          </div>

          {message.text && (
            <p style={{ ...styles.message, color: message.type === "error" ? "#EF4444" : "#10B981" }}>
              {message.text}
            </p>
          )}

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? "Duke u procesuar..." : "Hyni tani"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Nuk keni një llogari?</p>
          <Link href="/signup" style={styles.signupLink}>
            Krijoni llogari të re
          </Link>
        </div>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: { 
    height: "100vh", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#F1F5F9", // Ngjyrë pak më e errët për sfondin
    fontFamily: "'Inter', sans-serif",
    padding: "20px"
  },
  card: { 
    backgroundColor: "#ffffff", 
    padding: "45px 40px", 
    borderRadius: "28px", 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",  
    width: "100%", 
    maxWidth: "500px",
    border: "1px solid #E2E8F0"
  },
  header: { textAlign: "center", marginBottom: "35px" },
  logo: { fontSize: "1.1rem", fontWeight: "800", color: "#101828", marginBottom: "12px" },
  title: { fontSize: "1.8rem", fontWeight: "800", color: "#0F172A", marginBottom: "8px", letterSpacing: "-0.5px" },
  subtitle: { color: "#64748B", fontSize: "0.9rem" },
  form: { display: "flex", flexDirection: "column", gap: "22px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginLeft: "2px" },
  input: { 
    padding: "14px 16px", 
    borderRadius: "12px", 
    border: "2px solid", // Ngjyra kontrollohet dinamikisht lart
    outline: "none", 
    fontSize: "1rem",
    color: "#1E293B",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
  },
  loginBtn: { 
    backgroundColor: "#101828", 
    color: "#ffffff", 
    border: "none", 
    padding: "16px", 
    borderRadius: "12px", 
    fontWeight: "700", 
    cursor: "pointer", 
    fontSize: "1rem",
    marginTop: "8px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  },
  footer: { 
    marginTop: "30px", 
    textAlign: "center", 
    paddingTop: "20px", 
    borderTop: "1px solid #F1F5F9" 
  },
  footerText: { color: "#64748B", fontSize: "0.85rem", marginBottom: "5px" },
  signupLink: { 
    color: "#101828", 
    fontWeight: "700", 
    fontSize: "0.9rem", 
    textDecoration: "none",
    borderBottom: "2px solid #E2E8F0",
    paddingBottom: "2px",
    transition: "all 0.2s"
  },
  message: { fontSize: "0.85rem", textAlign: "center", margin: "0", fontWeight: "600" }
};