"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    // Validime të thjeshta
    if (password.length < 6) {
      setLoading(false);
      return setMessage({ text: "Fjalëkalimi duhet të ketë së paku 6 karaktere", type: "error" });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/dashboard`
      },
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
      setLoading(false);
    } else {
      setMessage({ 
        text: "Llogaria u krijua! Kontrolloni email-in për konfirmim.", 
        type: "success" 
      });
      // Opsionale: mund ta dërgosh te dashboard pas pak sekondash
      setTimeout(() => router.push("/dashboard"), 3000);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={styles.logo}>🌿 NutriScan</div>
          <h1 style={styles.title}>Krijo Llogari</h1>
          <p style={styles.subtitle}>Filloni udhëtimin tuaj drejt një ushqyerje më të shëndetshme.</p>
        </header>

        <form onSubmit={handleSignUp} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Emri i plotë</label>
            <input
              type="text"
              placeholder="Filan Fisteku"
              value={name}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setName(e.target.value)}
              style={{
                ...styles.input,
                borderColor: focusedInput === "name" ? "#101828" : "#CBD5E1",
                boxShadow: focusedInput === "name" ? "0 0 0 4px rgba(16, 24, 40, 0.05)" : "none"
              }}
              required
            />
          </div>

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

          <button type="submit" disabled={loading} style={styles.signupBtn}>
            {loading ? "Duke u procesuar..." : "Regjistrohu tani"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Keni tashmë një llogari?</p>
          <Link href="/login" style={styles.loginLink}>
            Hyni këtu
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
    backgroundColor: "#F1F5F9", 
    fontFamily: "'Inter', sans-serif",
    padding: "20px"
  },
  card: { 
    backgroundColor: "#ffffff", 
    padding: "30px", 
    borderRadius: "28px", 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", 
    width: "100%", 
    maxWidth: "500px",
    border: "1px solid #E2E8F0"
  },
  header: { textAlign: "center", marginBottom: "30px" },
  logo: { fontSize: "1.1rem", fontWeight: "800", color: "#101828", marginBottom: "12px" },
  title: { fontSize: "1.8rem", fontWeight: "800", color: "#0F172A", marginBottom: "8px" },
  subtitle: { color: "#64748B", fontSize: "0.9rem", lineHeight: "1.4" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginLeft: "2px" },
  input: { 
    padding: "14px 16px", 
    borderRadius: "12px", 
    border: "2px solid", 
    outline: "none", 
    fontSize: "1rem",
    color: "#1E293B",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
  },
  signupBtn: { 
    backgroundColor: "#101828", 
    color: "#ffffff", 
    border: "none", 
    padding: "16px", 
    borderRadius: "12px", 
    fontWeight: "700", 
    cursor: "pointer", 
    fontSize: "1rem",
    marginTop: "10px"
  },
  footer: { 
    marginTop: "25px", 
    textAlign: "center", 
    paddingTop: "20px", 
    borderTop: "1px solid #F1F5F9" 
  },
  footerText: { color: "#64748B", fontSize: "0.85rem", marginBottom: "5px" },
  loginLink: { 
    color: "#101828", 
    fontWeight: "700", 
    fontSize: "0.9rem", 
    textDecoration: "none"
  },
  message: { fontSize: "0.85rem", textAlign: "center", margin: "0", fontWeight: "600" }
};