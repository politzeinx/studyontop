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

const DEMO_USER: UserProfile = {
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
  login: (email: string, password?: string) => Promise<void>;
  loginAsDemo: () => void;
  register: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("studyontop_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEMO_USER);
        localStorage.setItem("studyontop_user", JSON.stringify(DEMO_USER));
      }
    } catch (e) {
      setUser(DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    const existing = localStorage.getItem(`studyontop_user_${email}`);
    if (existing) {
      const profile = JSON.parse(existing);
      setUser(profile);
      localStorage.setItem("studyontop_user", JSON.stringify(profile));
    } else {
      const quota: QuotaType = "AMPLA";
      const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email,
        targetCourse: "Engenharia de Software",
        targetCollege: "Federal",
        quotaType: quota,
        targetScore: estimateSisuCutoffScore("Engenharia de Software", quota),
        studyHoursPerDay: 3.0,
        studyDaysPerWeek: 6,
        isDemo: false,
        streakDays: 1,
        currentTriScore: 500.0,
      };
      setUser(newProfile);
      localStorage.setItem("studyontop_user", JSON.stringify(newProfile));
      localStorage.setItem(`studyontop_user_${email}`, JSON.stringify(newProfile));
    }
    router.push("/dashboard");
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem("studyontop_user", JSON.stringify(DEMO_USER));
    router.push("/dashboard");
  };

  const register = async (profileData: Partial<UserProfile>) => {
    const course = profileData.targetCourse || "Engenharia de Software";
    const quota: QuotaType = profileData.quotaType || "AMPLA";
    const calculatedScore = profileData.targetScore || estimateSisuCutoffScore(course, quota);

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: profileData.name || "Novo Estudante",
      email: profileData.email || "aluno@studyontop.com",
      targetCourse: course,
      targetCollege: profileData.targetCollege || "Federal",
      quotaType: quota,
      targetScore: calculatedScore,
      studyHoursPerDay: profileData.studyHoursPerDay || 3.0,
      studyDaysPerWeek: profileData.studyDaysPerWeek || 7,
      isDemo: false,
      streakDays: 1,
      currentTriScore: 500.0,
    };

    setUser(newProfile);
    localStorage.setItem("studyontop_user", JSON.stringify(newProfile));
    if (newProfile.email) {
      localStorage.setItem(`studyontop_user_${newProfile.email}`, JSON.stringify(newProfile));
    }
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("studyontop_user");
    router.push("/login");
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("studyontop_user", JSON.stringify(updated));
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
