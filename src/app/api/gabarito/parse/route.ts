import { NextResponse } from "next/server";
import { parseTextGabarito } from "@/lib/ocr/gabarito-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { error: "Texto do gabarito é obrigatório." },
        { status: 400 }
      );
    }

    const result = parseTextGabarito(rawText);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao processar o gabarito.", details: error.message },
      { status: 500 }
    );
  }
}
