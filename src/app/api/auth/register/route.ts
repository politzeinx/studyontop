import { NextRequest, NextResponse } from "next/server";
import { saveUserAsync, findUserByEmailAsync, StoredUser } from "@/lib/server-storage";
import { estimateSisuCutoffScore, QuotaType } from "@/context/auth-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      targetCourse = "Engenharia de Software",
      targetCollege = "USP",
      quotaType = "AMPLA",
      targetScore,
      studyHoursPerDay = 3,
      studyDaysPerWeek = 7,
    } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "O e-mail é obrigatório." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!password || password.trim().length < 3) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 3 caracteres." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const calculatedScore =
      targetScore || estimateSisuCutoffScore(targetCourse, quotaType as QuotaType);

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: name?.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      password: password.trim(),
      targetCourse: targetCourse.trim(),
      targetCollege: targetCollege.trim(),
      quotaType: quotaType as QuotaType,
      targetScore: Number(calculatedScore),
      studyHoursPerDay: Number(studyHoursPerDay),
      studyDaysPerWeek: Number(studyDaysPerWeek),
      isDemo: false,
      streakDays: 1,
      currentTriScore: 500.0,
    };

    await saveUserAsync(newUser);

    const { password: _, ...userSafe } = newUser;
    return NextResponse.json(
      { user: userSafe },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro no cadastro" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
