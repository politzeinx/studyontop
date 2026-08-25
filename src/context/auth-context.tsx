"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type QuotaType =
  | "AMPLA" // Ampla Concorrência
  | "EP_GERAL" // Escola Pública (Independente de Renda)
  | "EP_RENDA" // Escola Pública + Renda Familiar <= 1 Salário Mínimo
  | "EP_PPI" // Escola Pública + Pretos, Pardos ou Indígenas (PPI)
  | "EP_PPI_RENDA" // Escola Pública + PPI + Renda <= 1 SM
  | "PCD" // Pessoas com Deficiência
  | "QUILOMBOLA"; // Quilombolas

export const QUOTA_LABELS: Record<QuotaType, string> = {
  AMPLA: "Ampla Concorrência (AC)",
  EP_GERAL: "Cota L1 - Escola Pública (Independente de Renda)",
  EP_RENDA: "Cota L2 - Escola Pública + Renda ≤ 1 Salário Mínimo",
  EP_PPI: "Cota L3 - Escola Pública + Pretos, Pardos ou Indígenas (PPI)",
  EP_PPI_RENDA: "Cota L4 - Escola Pública + PPI + Renda ≤ 1 SM",
  PCD: "Cota L5/L6 - Pessoas com Deficiência (PCD)",
  QUILOMBOLA: "Cota Quilombolas",
};

/**
 * Calcula a nota de corte média estimada no SISU com base no curso e cota selecionada
 */
export function estimateSisuCutoffScore(course: string, quota: QuotaType): number {
  const norm = course.toLowerCase().trim();

  let baseScore = 710; // Padrão geral

  if (norm.includes("medicina")) {
    baseScore = 810;
  } else if (
    norm.includes("computa") ||
    norm.includes("software") ||
    norm.includes("engenharia") ||
    norm.includes("dados") ||
    norm.includes("sistemas")
  ) {
    baseScore = 765;
  } else if (norm.includes("direito") || norm.includes("odonto") || norm.includes("psicologia")) {
    baseScore = 750;
  } else if (norm.includes("enfermagem") || norm.includes("biomedicina") || norm.includes("arquitetura")) {
    baseScore = 735;
  } else if (norm.includes("administra") || norm.includes("economia") || norm.includes("contab")) {
    baseScore = 715;
  }

  // Ajuste por modalidade de cota
  switch (quota) {
    case "AMPLA":
      return baseScore;
    case "EP_GERAL":
      return Math.round(baseScore - 28);
    case "EP_RENDA":
      return Math.round(baseScore - 42);
    case "EP_PPI":
      return Math.round(baseScore - 58);
    case "EP_PPI_RENDA":
      return Math.round(baseScore - 70);
    case "PCD":
      return Math.round(baseScore - 95);
    case "QUILOMBOLA":
      return Math.round(baseScore - 75);
    default:
      return baseScore;
  }
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetCourse: string;
  targetCollege: string;
  quotaType: QuotaType;
  targetScore: number;
  studyHoursPerDay: number;
  studyDaysPerWeek: number;
  isDemo: boolean;
  streakDays: number;
  currentTriScore: number;
}

export const DEMO_USER: UserProfile = {
  id: "demo-user-1",
  name: "Luis Teles (Modo Demonstração)",
  email: "luis.demo@studyontop.com",
  targetCourse: "Medicina",
  targetCollege: "USP",
  quotaType: "AMPLA",
  targetScore: 810,
  studyHoursPerDay: 3.0,
  studyDaysPerWeek: 6,
  isDemo: true,
  streakDays: 14,
  currentTriScore: 748.5,
};

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  register: (profile: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const syncProfileFromServer = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("studyontop_user", JSON.stringify(data.user));
        }
      }
    } catch (e) {
      // Falha de rede silenciosa
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("studyontop_user");
      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        setUser(parsed);
        // Se for uma conta real, busca imediatamente a versão mais recente do servidor (ex: salva no celular)
        if (!parsed.isDemo && parsed.email) {
          syncProfileFromServer(parsed.email);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (user?.email && !user.isDemo) {
      await syncProfileFromServer(user.email);
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Erro ao realizar login." };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("studyontop_user", JSON.stringify(data.user));
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, error: "Resposta inválida do servidor." };
    } catch (err: any) {
      return { success: false, error: "Erro de conexão com o servidor." };
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem("studyontop_user", JSON.stringify(DEMO_USER));
    router.push("/dashboard");
  };

  const register = async (profileData: Partial<UserProfile> & { password?: string }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Erro ao realizar cadastro." };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("studyontop_user", JSON.stringify(data.user));
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, error: "Resposta inválida do servidor." };
    } catch (err: any) {
      return { success: false, error: "Erro de conexão ao cadastrar." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("studyontop_user");
    router.push("/login");
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    const payload = {
      email: user.email,
      ...updates,
    };

    // Atualização otimista local
    const optimistic = { ...user, ...updates };
    setUser(optimistic);
    localStorage.setItem("studyontop_user", JSON.stringify(optimistic));

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("studyontop_user", JSON.stringify(data.user));
          return { success: true };
        }
      }
      return { success: true }; // Otimista manteve
    } catch (e) {
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
