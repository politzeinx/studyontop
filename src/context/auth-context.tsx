"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetCourse: string;
  targetCollege: string;
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
    // Carrega a sessão salva do localStorage
    try {
      const stored = localStorage.getItem("studyontop_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Por padrão, inicia com o usuário logado no modo demo para exploração inicial
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
      // Cria conta rápida
      const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email,
        targetCourse: "Geral",
        targetCollege: "ENEM",
        targetScore: 750,
        studyHoursPerDay: 2.0,
        studyDaysPerWeek: 5,
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
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: profileData.name || "Novo Estudante",
      email: profileData.email || "aluno@studyontop.com",
      targetCourse: profileData.targetCourse || "Medicina",
      targetCollege: profileData.targetCollege || "Federal",
      targetScore: profileData.targetScore || 780,
      studyHoursPerDay: profileData.studyHoursPerDay || 3.0,
      studyDaysPerWeek: profileData.studyDaysPerWeek || 6,
      isDemo: false,
      streakDays: 1,
      currentTriScore: 500.0, // Começa zerado para calcular com os simulados reais dele
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
