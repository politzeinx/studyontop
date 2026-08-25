import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, saveUser } from "@/lib/server-storage";
import { UserProfile, estimateSisuCutoffScore } from "@/context/auth-context";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
    }

    let user = findUserByEmail(email);

    // Se a conta não existir no servidor, cria uma conta inicial limpa com dados coerentes
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email: email.trim().toLowerCase(),
        targetCourse: "Engenharia de Software",
        targetCollege: "Federal",
        quotaType: "AMPLA",
        targetScore: estimateSisuCutoffScore("Engenharia de Software", "AMPLA"),
        studyHoursPerDay: 3,
        studyDaysPerWeek: 7,
        isDemo: false,
        streakDays: 1,
        currentTriScore: 500.0,
      };
      saveUser(user);
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no login" }, { status: 500 });
  }
}
