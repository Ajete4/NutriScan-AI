"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// Definojmë tipin e të dhënave që do të mbajë Context-i
type AuthContextType = {
  user: User | null;
  loading: boolean; // Shtuar për të menaxhuar pritjen e sesionit
};

// Krijohet Context-i me vlerë fillestare null
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Merret sesioni aktual sapo ngarkohet aplikacioni
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // 2. Dëgjohet për ndryshime (Login, Logout, etj.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook-u i personalizuar me kontroll sigurie për TypeScript
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth duhet të përdoret brenda një AuthProvider");
  }
  
  return context;
};