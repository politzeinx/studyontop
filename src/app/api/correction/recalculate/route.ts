import { NextResponse } from "next/server";
import { executeCorrection } from "@/services/correction/correction-engine";
import { SEED_QUESTIONS } from "@/lib/data/questions-seed";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { simulationId, studentAnswers, cancelledQuestionIds } = body;

    if (!studentAnswers) {
      return NextResponse.json(
        { error: "Respostas do aluno são obrigatórias." },
        { status: 400 }
      );
    }

    const result = executeCorrection({
      simulationId: simulationId || "sim-recalculated",
      questions: SEED_QUESTIONS,
      studentAnswers,
      cancelledQuestionIds: cancelledQuestionIds || [],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao recalcular correção.", details: error.message },
      { status: 500 }
    );
  }
}
