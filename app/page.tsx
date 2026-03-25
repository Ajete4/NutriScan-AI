"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Presim derisa AuthContext të vërtetojë nëse përdoruesi është i loguar
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Shfaqim një mesazh të thjeshtë ose loader derisa të ndodhë redirect
  return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Duke u drejtuar...</p>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    fontFamily: "sans-serif"
  },
  spinner: {
    width: "30px",
    height: "30px",
    border: "3px solid #E2E8F0",
    borderTop: "3px solid #101828",
    borderRadius: "50%",
    marginBottom: "10px",
    animation: "spin 1s linear infinite"
  },
  text: {
    color: "#64748B",
    fontSize: "0.9rem"
  }
};