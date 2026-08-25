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
 * Parser resiliente de gabarito para múltiplos formatos de texto digitado ou colado pelo aluno
 * Suporta:
 * - 01-A ou 01 - A
 * - 1. A ou 1.A
 * - 1:A ou 1 : A
 * - 1 A ou 01 A
 * - 1=A; 2=B; 3=C
 * - Tabela CSV (1,A \n 2,B)
 */
export function parseTextGabarito(rawText: string): ParsedGabaritoResult {
  const lines = rawText
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items: ParsedGabaritoItem[] = [];
  const unrecognizedLines: string[] = [];
  const processedQuestions = new Set<number>();

  // Expressões regulares flexíveis para captura:
  // Grupo 1: Número da questão (1 ou mais dígitos)
  // Grupo 2: Letra da alternativa (A, B, C, D, E em maiúsculo ou minúsculo)
  const regexPatterns = [
    /^(?:Q(?:uestão)?\.?\s*)?(\d{1,3})\s*[-–—:=.)\s]+\s*([A-Ea-e])$/i,
    /^(\d{1,3})\s*,\s*([A-Ea-e])$/i,
    /^(\d{1,3})\s+([A-Ea-e])$/i,
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
            confidence: 1.0, // Entrada manual/texto fornecida pelo usuário = fonte primária
          });
          processedQuestions.add(num);
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      unrecognizedLines.push(line);
    }
  }

  // Ordena pelo número da questão
  items.sort((a, b) => a.questionNumber - b.questionNumber);

  return {
    items,
    totalParsed: items.length,
    isFullyParsed: unrecognizedLines.length === 0 && items.length > 0,
    unrecognizedLines,
    rawText,
  };
}
