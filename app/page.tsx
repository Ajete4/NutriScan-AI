"use client";

import { useState } from "react";

type NutriResult = {
  ushqimi: string;
  kalori: string;
  proteina: string;
  karbohidrate: string;
  yndyrna: string;
  keshilla: string;
};

export default function NutriScanPage() {
  const [foodInput, setFoodInput] = useState("");
  const [result, setResult] = useState<NutriResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<NutriResult[]>([]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodInput.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: foodInput }),
      });

      if (!res.ok) throw new Error(`Gabim: ${res.status}`);
      const data: NutriResult = await res.json();

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 3));
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Left Side */}
        <div style={styles.leftCol}>
          <header style={styles.header}>
            <div style={styles.logo}>
              🌿 Nutri<span style={{ fontWeight: "300" }}>Scan</span>
            </div>
            <h1 style={styles.heroTitle}>
              Ushqehu me <br /> <span style={styles.gradientText}>Inteligjencë.</span>
            </h1>
          </header>

          <div style={styles.inputSection}>
            <textarea
              placeholder="Çfarë keni në pjatë?"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              style={styles.textArea}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !foodInput.trim()}
              style={styles.mainButton}
            >
              {loading ? "Duke u skanuar..." : "Analizo Tani"}
            </button>
          </div>

          {result && !loading && (
            <div style={styles.mainResultCard}>
              <div style={styles.resultHeader}>
                <h2 style={styles.foodTitle}>{result.ushqimi}</h2>
                <span style={styles.kcalBadge}>{result.kalori} kcal</span>
              </div>

              <div style={styles.macroGrid}>
                <MacroCircle label="Proteina" value={result.proteina} color="#FF6B6B" />
                <MacroCircle label="Karbo" value={result.karbohidrate} color="#4ECDC4" />
                <MacroCircle label="Yndyrna" value={result.yndyrna} color="#FFD93D" />
              </div>

              <div style={styles.adviceStrip}>
                <p>
                  <strong>Këshillë:</strong> {result.keshilla}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div style={styles.rightCol}>
          <h3 style={styles.sideTitle}>Analizat e Fundit</h3>
          {history.length === 0 && <p style={styles.emptyText}>Nuk ka të dhëna akoma.</p>}
          {history.map((item, index) => (
            <div key={index} style={styles.historyCard}>
              <span style={styles.historyIcon}>🥗</span>
              <div>
                <div style={styles.historyName}>{item.ushqimi}</div>
                <div style={styles.historyKcal}>{item.kalori} kcal</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function MacroCircle({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={styles.macroItem}>
      <div style={{ ...styles.circle, borderColor: color }}>
        <span style={styles.macroValue}>{value}</span>
      </div>
      <span style={styles.macroLabel}>{label}</span>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: { 
    minHeight: "100vh", 
    backgroundColor: "#F0F4F8", // Ngjyrë më e freskët në sfond
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", 
    padding: "60px 20px" 
  },
  container: { 
    maxWidth: "1100px", 
    margin: "0 auto", 
    display: "grid", 
    gridTemplateColumns: "1.6fr 0.4fr", 
    gap: "30px" 
  },
  leftCol: { display: "flex", flexDirection: "column", gap: "25px" },
  header: { marginBottom: "10px" },
  logo: { 
    fontSize: "1.1rem", 
    fontWeight: "800", 
    color: "#2D3436", 
    marginBottom: "10px", 
    letterSpacing: "-0.5px" 
  },
  heroTitle: { 
    fontSize: "3.8rem", 
    fontWeight: "900", 
    color: "#101828", 
    lineHeight: "1", 
    letterSpacing: "-2px" 
  },
  gradientText: { 
    background: "linear-gradient(135deg, #00b09b, #96c93d)", 
    WebkitBackgroundClip: "text", 
    WebkitTextFillColor: "transparent" 
  },
  inputSection: { 
    backgroundColor: "#ffffff", 
    padding: "12px", 
    borderRadius: "28px", 
    boxShadow: "0 20px 40px rgba(0,0,0,0.06)", 
    border: "1px solid rgba(0,0,0,0.03)"
  },
  textArea: { 
    width: "100%", 
    border: "none", 
    padding: "20px", 
    fontSize: "1.2rem", 
    outline: "none", 
    resize: "none", 
    height: "120px", 
    borderRadius: "20px",
    color: "#1A1A1A"
  },
  mainButton: { 
    backgroundColor: "#101828", 
    color: "#fff", 
    border: "none", 
    padding: "18px", 
    borderRadius: "20px", 
    fontWeight: "700", 
    cursor: "pointer", 
    fontSize: "1.1rem",
    transition: "all 0.2s ease",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
  },
  mainResultCard: { 
    backgroundColor: "#ffffff", 
    padding: "40px", 
    borderRadius: "35px", 
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.02)"
  },
  resultHeader: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "40px" 
  },
  foodTitle: { 
    fontSize: "2.2rem", 
    margin: 0, 
    fontWeight: "800", 
    color: "#101828", 
    textTransform: "capitalize" 
  },
  kcalBadge: { 
    background: "linear-gradient(135deg, #E8F6EF 0%, #C4EAD9 100%)", 
    color: "#1B7A4D", 
    padding: "10px 20px", 
    borderRadius: "100px", 
    fontWeight: "800",
    fontSize: "0.9rem" 
  },
  macroGrid: { 
    display: "flex", 
    justifyContent: "space-between", 
    marginBottom: "40px",
    gap: "15px"
  },
  macroItem: { textAlign: "center", flex: 1 },
  circle: { 
    width: "90px", 
    height: "90px", 
    borderRadius: "50%", 
    border: "8px solid", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    margin: "0 auto 15px auto",
    backgroundColor: "#FAFBFC" 
  },
  macroValue: { fontWeight: "800", fontSize: "1.2rem", color: "#101828" },
  macroLabel: { fontSize: "0.85rem", color: "#667085", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
  adviceStrip: { 
    backgroundColor: "#F9FAFB", 
    padding: "24px", 
    borderRadius: "24px", 
    borderLeft: "6px solid #101828",
    color: "#344054", 
    fontSize: "1rem",
    lineHeight: "1.6" 
  },
  rightCol: { 
    backgroundColor: "rgba(255, 255, 255, 0.7)", 
    backdropFilter: "blur(10px)",
    padding: "30px", 
    borderRadius: "32px", 
    height: "fit-content",
    border: "1px solid #fff"
  },
  sideTitle: { fontSize: "1.1rem", fontWeight: "800", marginBottom: "25px", color: "#101828" },
  historyCard: { 
    display: "flex", 
    gap: "15px", 
    alignItems: "center", 
    padding: "15px", 
    borderRadius: "20px", 
    backgroundColor: "#fff", 
    marginBottom: "15px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
  },
  historyIcon: { fontSize: "1.4rem" },
  historyName: { fontWeight: "700", fontSize: "0.95rem", color: "#101828" },
  historyKcal: { fontSize: "0.85rem", color: "#667085", fontWeight: "500" },
  emptyText: { color: "#98A2B3", fontSize: "0.9rem", textAlign: "center", padding: "20px 0" },
};