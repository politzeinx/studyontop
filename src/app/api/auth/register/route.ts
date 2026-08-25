import { NextRequest, NextResponse } from "next/server";
import { saveUser, findUserByEmail } from "@/lib/server-storage";
import { UserProfile, estimateSisuCutoffScore, QuotaType } from "@/context/auth-context";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      targetCourse = "Engenharia de Software",
      targetCollege = "USP",
      quotaType = "AMPLA",
      targetScore,
      studyHoursPerDay = 3,
      studyDaysPerWeek = 7,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
    }

    const calculatedScore = targetScore || estimateSisuCutoffScore(targetCourse, quotaType as QuotaType);

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || email.split("@")[0],
      email: email.trim().toLowerCase(),
      targetCourse,
      targetCollege,
      quotaType: quotaType as QuotaType,
      targetScore: calculatedScore,
      studyHoursPerDay: Number(studyHoursPerDay),
      studyDaysPerWeek: Number(studyDaysPerWeek),
      isDemo: false,
      streakDays: 1,
      currentTriScore: 500.0,
    };

    saveUser(newUser);

    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no cadastro" }, { status: 500 });
  }
}
