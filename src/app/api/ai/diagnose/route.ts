import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      questionStatement,
      discipline,
      subject,
      studentAnswer,
      correctAnswer,
      alternatives,
    } = body;

    if (!questionStatement || !studentAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Enunciado, resposta do aluno e gabarito são obrigatórios." },
        { status: 400 }
      );
    }

    const diagnosis = await aiService.diagnoseError({
      questionStatement,
      discipline: discipline || "Geral",
      subject: subject || "Geral",
      studentAnswer,
      correctAnswer,
      alternatives: alternatives || [
        { letter: "A", text: "Alternativa A" },
        { letter: "B", text: "Alternativa B" },
        { letter: "C", text: "Alternativa C" },
        { letter: "D", text: "Alternativa D" },
        { letter: "E", text: "Alternativa E" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: diagnosis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao gerar diagnóstico com IA.", details: error.message },
      { status: 500 }
    );
  }
}
