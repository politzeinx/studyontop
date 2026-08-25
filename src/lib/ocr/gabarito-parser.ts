export interface ParsedGabaritoItem {
  questionNumber: number;
  alternative: "A" | "B" | "C" | "D" | "E";
  confidence: number;
}

export interface ParsedGabaritoResult {
  items: ParsedGabaritoItem[];
  totalParsed: number;
  isFullyParsed: boolean;
  unrecognizedLines: string[];
  rawText: string;
}

/**
 * Parser resiliente de gabarito para múltiplos formatos de texto, PDF e tabelas
 * Suporta:
 * - 01-A ou 01 - A, 1. A, 1:A, 1=A, 1 A
 * - Tabela CSV / TSV (1,A ou 1\tA)
 * - Sequência contínua de letras: "A B C D E A B C D E..." ou "ABCDE EDCBA..."
 * - Gabarito oficial padrão INEP / Vestibulares
 */
export function parseTextGabarito(rawText: string): ParsedGabaritoResult {
  const cleanText = rawText.trim();
  const items: ParsedGabaritoItem[] = [];
  const unrecognizedLines: string[] = [];
  const processedQuestions = new Set<number>();

  // 1. Tenta padrão linha a linha / separado por ponto e vírgula
  const lines = cleanText
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const regexPatterns = [
    /^(?:Q(?:uestão)?\.?\s*)?(\d{1,3})\s*[-–—:=.)\s/]+\s*([A-Ea-e])$/i,
    /^(\d{1,3})\s*,\s*([A-Ea-e])$/i,
    /^(\d{1,3})\s+([A-Ea-e])$/i,
    /^\(?(\d{1,3})\)?\s*([A-Ea-e])$/i,
  ];

  for (const line of lines) {
    let matched = false;

    for (const regex of regexPatterns) {
      const match = line.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        const alt = match[2].toUpperCase() as "A" | "B" | "C" | "D" | "E";

        if (num > 0 && num <= 180 && !processedQuestions.has(num)) {
          items.push({
            questionNumber: num,
            alternative: alt,
            confidence: 1.0,
          });
          processedQuestions.add(num);
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // Verifica se a linha contém múltiplos pares inline como "1-A 2-B 3-C"
      const inlineMatches = Array.from(
        line.matchAll(/(?:Q(?:uestão)?\.?\s*)?(\d{1,3})\s*[-–—:=.)\s]*([A-Ea-e])\b/gi)
      );

      if (inlineMatches.length > 0) {
        for (const m of inlineMatches) {
          const num = parseInt(m[1], 10);
          const alt = m[2].toUpperCase() as "A" | "B" | "C" | "D" | "E";
          if (num > 0 && num <= 180 && !processedQuestions.has(num)) {
            items.push({
              questionNumber: num,
              alternative: alt,
              confidence: 1.0,
            });
            processedQuestions.add(num);
            matched = true;
          }
        }
      }

      if (!matched && line.length > 2) {
        unrecognizedLines.push(line);
      }
    }
  }

  // 2. Se nenhuma linha bateu mas tem uma sequência de letras pura (ex: "A B C D E A B C D E" ou "ABCDE...")
  if (items.length === 0 && cleanText.length >= 5) {
    const lettersOnly = cleanText.replace(/[^A-Ea-e]/g, "").toUpperCase();
    if (lettersOnly.length >= 5) {
      for (let i = 0; i < lettersOnly.length && i < 180; i++) {
        items.push({
          questionNumber: i + 1,
          alternative: lettersOnly[i] as "A" | "B" | "C" | "D" | "E",
          confidence: 0.95,
        });
      }
    }
  }

  // Ordena por número da questão
  items.sort((a, b) => a.questionNumber - b.questionNumber);

  return {
    items,
    totalParsed: items.length,
    isFullyParsed: unrecognizedLines.length === 0 && items.length > 0,
    unrecognizedLines,
    rawText,
  };
}

/**
 * Extrai texto legível de um arquivo PDF carregado no navegador
 */
export async function extractTextFromPDFFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Decodifica streams de texto ASCII / UTF-8 embutidos no PDF
    let text = "";
    const decoder = new TextDecoder("utf-8");
    const rawString = decoder.decode(bytes);

    // Procura por blocos de texto entre parênteses em operadores de texto do PDF (Tj / TJ)
    const textMatches = Array.from(rawString.matchAll(/\(([^)]+)\)\s*Tj/g));
    if (textMatches.length > 0) {
      text = textMatches.map((m) => m[1]).join("\n");
    } else {
      // Fallback: extrai números seguidos de letras
      const simplePairs = Array.from(rawString.matchAll(/(\d{1,3})\s*[-–—:=.)\s]+\s*([A-Ea-e])/g));
      if (simplePairs.length > 0) {
        text = simplePairs.map((m) => `${m[1]}-${m[2]}`).join("\n");
      } else {
        text = rawString.replace(/[^\w\s\-\:\.\,]/g, " ");
      }
    }

    return text.trim();
  } catch (err) {
    console.warn("Erro ao extrair texto do PDF:", err);
    return "";
  }
}
