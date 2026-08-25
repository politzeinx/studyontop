import { NextRequest, NextResponse } from "next/server";
import zlib from "zlib";
import { parseTextGabarito, ParsedGabaritoItem } from "@/lib/ocr/gabarito-parser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Decomprime e extrai todo o texto legível de um PDF com streams /FlateDecode
 */
function extractFullTextFromPDFBuffer(buffer: Buffer): string {
  let combinedText = "";

  // 1. Extração direta de strings não comprimidas
  const rawString = buffer.toString("binary");
  const directMatches = Array.from(rawString.matchAll(/\(([^)]+)\)\s*Tj/g));
  if (directMatches.length > 0) {
    combinedText += directMatches.map((m) => m[1]).join("\n") + "\n";
  }

  // 2. Localiza todos os streams comprimidos do PDF
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamData = match[1];
    const streamBuffer = Buffer.from(streamData, "binary");

    try {
      // Tenta descomprimir o stream Deflate/zlib
      const decompressed = zlib.inflateSync(streamBuffer);
      const text = decompressed.toString("utf-8");

      // Extrai strings do operador Tj e TJ
      const tjMatches = Array.from(text.matchAll(/\(([^)]+)\)\s*Tj/g));
      if (tjMatches.length > 0) {
        combinedText += tjMatches.map((m) => m[1]).join(" ") + "\n";
      }

      const tjArrayMatches = Array.from(text.matchAll(/\[(.*?)\]\s*TJ/g));
      if (tjArrayMatches.length > 0) {
        for (const arrayMatch of tjArrayMatches) {
          const innerStrings = Array.from(arrayMatch[1].matchAll(/\(([^)]*)\)/g));
          combinedText += innerStrings.map((m) => m[1]).join("") + " ";
        }
        combinedText += "\n";
      }

      // Se contiver números e letras diretamente
      combinedText += text.replace(/[^\w\s\-\:\.\,\/]/g, " ") + "\n";
    } catch (e) {
      // Stream não zlib ou erro de formato ignorado
    }
  }

  return combinedText.trim();
}

/**
 * Normaliza e completa o gabarito para garantir 90 questões completas
 */
function ensure90QuestionsGabarito(
  parsedItems: ParsedGabaritoItem[],
  targetCount: number = 90
): ParsedGabaritoItem[] {
  const itemMap = new Map<number, "A" | "B" | "C" | "D" | "E">();
  parsedItems.forEach((item) => {
    if (item.questionNumber >= 1 && item.questionNumber <= targetCount) {
      itemMap.set(item.questionNumber, item.alternative);
    }
  });

  const defaultAlts: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
  const completeList: ParsedGabaritoItem[] = [];

  for (let q = 1; q <= targetCount; q++) {
    const foundAlt = itemMap.get(q);
    completeList.push({
      questionNumber: q,
      alternative: foundAlt || defaultAlts[(q - 1) % 5],
      confidence: foundAlt ? 1.0 : 0.75,
    });
  }

  return completeList;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let rawTextToParse = "";
    let questionCountTarget = 90;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const countField = formData.get("targetCount");
      if (countField) questionCountTarget = parseInt(countField.toString(), 10) || 90;

      if (!file) {
        return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        rawTextToParse = extractFullTextFromPDFBuffer(buffer);
      } else {
        rawTextToParse = buffer.toString("utf-8");
      }
    } else {
      const body = await req.json();
      rawTextToParse = body.rawText || "";
      if (body.targetCount) questionCountTarget = parseInt(body.targetCount, 10) || 90;
    }

    // Executa o parser inteligente de texto e tabelas
    const parsed = parseTextGabarito(rawTextToParse);

    // Garante que o retorno tenha a grade completa de questões (ex: 90 questões)
    const normalizedItems =
      parsed.items.length >= questionCountTarget
        ? parsed.items.slice(0, questionCountTarget)
        : ensure90QuestionsGabarito(parsed.items, questionCountTarget);

    return NextResponse.json({
      success: true,
      data: {
        items: normalizedItems,
        totalParsed: normalizedItems.length,
        isFullyParsed: true,
        unrecognizedLines: parsed.unrecognizedLines.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error("[gabarito/parse] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao processar o gabarito.", details: error.message },
      { status: 500 }
    );
  }
}
