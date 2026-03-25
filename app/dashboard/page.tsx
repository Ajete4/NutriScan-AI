"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type NutriResult = {
  ushqimi: string;
  kalori: string;
  proteina: string;
  karbohidrate: string;
  yndyrna: string;
  keshilla: string;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [foodInput, setFoodInput] = useState("");
  const [result, setResult] = useState<NutriResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<NutriResult[]>([]);
  
  // State për Modal-in e personalizuar
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Duke u autentikuar...</p>
      </div>
    );
  }

  if (!user) return null;

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
      setHistory((prev) => [data, ...prev].slice(0, 5));
      setFoodInput("");
    } catch (err: unknown) {
      console.error(err);
      alert("Ndodhi një gabim gjatë analizës. Provo përsëri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Konfirmoni Daljen</h3>
            <p style={styles.modalText}>A jeni të sigurt që dëshironi të dilni nga llogaria juaj?</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowLogoutModal(false)} style={styles.cancelBtn}>
                Anulo
              </button>
              <button onClick={confirmLogout} style={styles.confirmBtn}>
                Dil
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={styles.topBar}>
        <div style={styles.userInfo}>
          <div style={styles.avatarCircle}>
            {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={styles.welcome}>
              {user.user_metadata?.full_name || user.email}
            </span>
            {user.user_metadata?.full_name && (
              <span style={{ fontSize: "0.7rem", color: "#64748B" }}>{user.email}</span>
            )}
          </div>
        </div>
        <button onClick={() => setShowLogoutModal(true)} style={styles.logoutButton}>
            Dil
        </button>
      </header>

      <div style={styles.container}>
        <div style={styles.leftCol}>
          <section style={styles.headerSection}>
            <div style={styles.logo}>
              🌿 Nutri<span style={{ fontWeight: "300" }}>Scan</span>
            </div>
            <h1 style={styles.heroTitle}>
              Ushqehu me <br />
              <span style={styles.gradientText}>Inteligjencë Artificiale.</span>
            </h1>
            <p style={styles.subTitle}>Shkruani vaktin tuaj dhe AI do të llogarisë vlerat ushqyese në sekonda.</p>
          </section>

          <div style={styles.inputCard}>
            <textarea
              placeholder="Përshkruani vaktin (p.sh. 150g salmon, një dorë sallatë dhe 1 mollë)..."
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              style={styles.textArea}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !foodInput.trim()}
              style={{
                ...styles.mainButton,
                backgroundColor: loading ? "#667085" : "#101828",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Duke analizuar..." : "Analizo Tani"}
            </button>
          </div>

          {result && !loading && (
            <div style={styles.mainResultCard}>
              <div style={styles.resultHeader}>
                <h2 style={styles.foodTitle}>{result.ushqimi}</h2>
                <div style={styles.kcalBadge}>🔥 {result.kalori} kcal</div>
              </div>

              <div style={styles.macroGrid}>
                <MacroCircle label="Proteina" value={result.proteina} color="#FF6B6B" />
                <MacroCircle label="Karbo" value={result.karbohidrate} color="#4ECDC4" />
                <MacroCircle label="Yndyrna" value={result.yndyrna} color="#FFD93D" />
              </div>

              <div style={styles.adviceBox}>
                <span style={styles.adviceIcon}>💡</span>
                <p style={styles.adviceText}>{result.keshilla}</p>
              </div>
            </div>
          )}
        </div>

        <aside style={styles.rightCol}>
          <h3 style={styles.sideTitle}>Analizat e fundit</h3>
          <div style={styles.historyList}>
            {history.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Nuk ka histori akoma.</p>
                <span>Analizat tuaja do të shfaqen këtu.</span>
              </div>
            ) : (
              history.map((item, index) => (
                <div key={index} style={styles.historyCard}>
                  <span style={styles.historyEmoji}>🥗</span>
                  <div style={styles.historyInfo}>
                    <div style={styles.historyName}>{item.ushqimi}</div>
                    <div style={styles.historyMeta}>{item.kalori} kcal • {item.proteina} P</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
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
  main: { minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "'Inter', sans-serif", padding: "20px" },
  loaderContainer: { height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#64748B" },
  spinner: { width: "40px", height: "40px", border: "4px solid #E2E8F0", borderTop: "4px solid #101828", borderRadius: "50%", marginBottom: "15px" },
  topBar: { maxWidth: "1200px", margin: "0 auto 30px auto", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: "12px 24px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  userInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatarCircle: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#101828", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem" },
  welcome: { fontSize: "0.85rem", fontWeight: "600", color: "#334155" },
  logoutButton: { backgroundColor: "transparent", color: "#d61515", border: "2px solid #d61515", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" },
  container: { maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: "30px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "25px" },
  headerSection: { padding: "0 10px" },
  logo: { fontSize: "1rem", fontWeight: "800", color: "#101828", marginBottom: "15px" },
  heroTitle: { fontSize: "3.2rem", fontWeight: "900", color: "#0F172A", lineHeight: "1.1", letterSpacing: "-1.5px", margin: "0 0 10px 0" },
  subTitle: { color: "#64748B", fontSize: "1.1rem", marginBottom: "10px" },
  gradientText: { background: "linear-gradient(90deg, #10B981, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  inputCard: { backgroundColor: "#fff", padding: "12px", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", border: "1px solid #F1F5F9" },
  textArea: { width: "100%", border: "none", padding: "15px", fontSize: "1.1rem", outline: "none", resize: "none", height: "110px", color: "#1E293B" },
  mainButton: { color: "#fff", border: "none", padding: "16px", borderRadius: "18px", fontWeight: "700", fontSize: "1rem", transition: "all 0.3s ease", width: "100%" },
  mainResultCard: { backgroundColor: "#fff", padding: "35px", borderRadius: "30px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.07)", border: "1px solid #F1F5F9" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "35px" },
  foodTitle: { fontSize: "1.8rem", fontWeight: "800", color: "#0F172A", textTransform: "capitalize", margin: 0 },
  kcalBadge: { backgroundColor: "#F0FDF4", color: "#166534", padding: "8px 16px", borderRadius: "100px", fontWeight: "800", fontSize: "0.9rem", border: "1px solid #DCFCE7" },
  macroGrid: { display: "flex", justifyContent: "space-between", marginBottom: "35px", gap: "10px" },
  macroItem: { textAlign: "center", flex: 1 },
  circle: { width: "85px", height: "85px", borderRadius: "50%", border: "7px solid", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" },
  macroValue: { fontWeight: "800", fontSize: "1.1rem", color: "#0F172A" },
  macroLabel: { fontSize: "0.75rem", color: "#64748B", fontWeight: "700", textTransform: "uppercase" },
  adviceBox: { backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "20px", display: "flex", gap: "15px", border: "1px solid #F1F5F9" },
  adviceIcon: { fontSize: "1.5rem" },
  adviceText: { color: "#334155", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 },
  rightCol: { backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "24px", padding: "25px", height: "fit-content", border: "1px solid #fff" },
  sideTitle: { fontSize: "1rem", fontWeight: "800", color: "#0F172A", marginBottom: "20px" },
  historyList: { display: "flex", flexDirection: "column", gap: "12px" },
  historyCard: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  historyEmoji: { fontSize: "1.2rem" },
  historyName: { fontWeight: "700", fontSize: "0.85rem", color: "#1E293B", textTransform: "capitalize" },
  historyMeta: { fontSize: "0.75rem", color: "#10B981", fontWeight: "600" },
  emptyState: { textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: "0.85rem" },
  
  // Stilet e reja për Custom Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "350px",
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
  },
  modalIcon: { fontSize: "2.5rem", marginBottom: "15px" },
  modalTitle: { fontSize: "1.2rem", fontWeight: "800", color: "#0F172A", marginBottom: "10px" },
  modalText: { color: "#64748B", fontSize: "0.9rem", marginBottom: "25px", lineHeight: "1.5" },
  modalButtons: { display: "flex", gap: "12px" },
  cancelBtn: { 
    flex: 1, 
    padding: "12px", 
    borderRadius: "12px", 
    border: "1px solid #E2E8F0", 
    backgroundColor: "#fff", 
    fontWeight: "600", 
    cursor: "pointer",
    color: "#475569"
  },
  confirmBtn: { 
    flex: 1, 
    padding: "12px", 
    borderRadius: "12px", 
    border: "none", 
    backgroundColor: "#EF4444", 
    color: "#fff", 
    fontWeight: "700", 
    cursor: "pointer" 
  },
};