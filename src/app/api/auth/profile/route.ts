import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, saveUser, StoredUser } from "@/lib/server-storage";
import { estimateSisuCutoffScore, QuotaType } from "@/context/auth-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "E-mail não fornecido" },
        { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const user = findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const { password: _, ...userSafe } = user;
    return NextResponse.json(
      { user: userSafe },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar perfil" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "E-mail obrigatório para atualizar perfil" },
        { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);

    const calculatedScore =
      targetScore ||
      estimateSisuCutoffScore(
        targetCourse || existing?.targetCourse || "Engenharia de Software",
        (quotaType || existing?.quotaType || "AMPLA") as QuotaType
      );

    const updatedUser: StoredUser = {
      id: existing?.id || `user-${Date.now()}`,
      email: cleanEmail,
      name: name ?? existing?.name ?? cleanEmail.split("@")[0],
      targetCourse: targetCourse ?? existing?.targetCourse ?? "Engenharia de Software",
      targetCollege: targetCollege ?? existing?.targetCollege ?? "USP",
      quotaType: (quotaType as QuotaType) ?? existing?.quotaType ?? "AMPLA",
      targetScore: Number(calculatedScore),
      studyHoursPerDay: studyHoursPerDay !== undefined ? Number(studyHoursPerDay) : (existing?.studyHoursPerDay ?? 3),
      studyDaysPerWeek: studyDaysPerWeek !== undefined ? Number(studyDaysPerWeek) : (existing?.studyDaysPerWeek ?? 7),
      isDemo: false,
      streakDays: streakDays !== undefined ? Number(streakDays) : (existing?.streakDays ?? 1),
      currentTriScore: currentTriScore !== undefined ? Number(currentTriScore) : (existing?.currentTriScore ?? 500.0),
      password: existing?.password || "",
    };

    saveUser(updatedUser);

    const { password: _, ...userSafe } = updatedUser;
    return NextResponse.json(
      { user: userSafe },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar perfil" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
