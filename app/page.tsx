"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Leaf } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_12%_8%,rgba(95,127,58,0.18),transparent_28rem),linear-gradient(180deg,#fffaf0,#edf7e8)] px-6">
      <div className="wellness-surface rounded-[2rem] px-6 py-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#dff5df] text-[#5f7f3a] flex items-center justify-center">
          <Leaf size={18} className="animate-pulse" />
        </div>
        <p className="text-sm font-bold text-slate-600">
          Redirecting to NutriScan AI...
        </p>
      </div>
    </div>
  );
}
