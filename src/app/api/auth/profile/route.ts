import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, saveUser, StoredUser } from "@/lib/server-storage";
import { estimateSisuCutoffScore, QuotaType } from "@/context/auth-context";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "E-mail não fornecido" }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { password: _, ...userSafe } = user;
    return NextResponse.json({ user: userSafe });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar perfil" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      targetCourse,
      targetCollege,
      quotaType,
      targetScore,
      studyHoursPerDay,
      studyDaysPerWeek,
      streakDays,
      currentTriScore,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório para atualizar perfil" }, { status: 400 });
    }

    const existing = findUserByEmail(email);
    if (!existing) {
      return NextResponse.json({ error: "Usuário não encontrado no servidor" }, { status: 404 });
    }

    const updatedUser: StoredUser = {
      ...existing,
      name: name ?? existing.name,
      targetCourse: targetCourse ?? existing.targetCourse,
      targetCollege: targetCollege ?? existing.targetCollege,
      quotaType: (quotaType as QuotaType) ?? existing.quotaType,
      targetScore: targetScore ?? (targetCourse || quotaType ? estimateSisuCutoffScore(targetCourse || existing.targetCourse, (quotaType || existing.quotaType) as QuotaType) : existing.targetScore),
      studyHoursPerDay: studyHoursPerDay !== undefined ? Number(studyHoursPerDay) : existing.studyHoursPerDay,
      studyDaysPerWeek: studyDaysPerWeek !== undefined ? Number(studyDaysPerWeek) : existing.studyDaysPerWeek,
      streakDays: streakDays !== undefined ? Number(streakDays) : existing.streakDays,
      currentTriScore: currentTriScore !== undefined ? Number(currentTriScore) : existing.currentTriScore,
    };

    saveUser(updatedUser);

    const { password: _, ...userSafe } = updatedUser;
    return NextResponse.json({ user: userSafe });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao atualizar perfil" }, { status: 500 });
  }
}
