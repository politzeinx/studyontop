import { StudentItemResponse } from "./tri-engine";

export interface ConsistencyAnalysis {
  consistencyScore: number; // 0.0 a 1.0 (ex: 0.88 = 88%)
  coherenceLevel: "EXCELENTE" | "BOA" | "MODERADA" | "INCONSISTENTE";
  easyAccuracy: number; // % acertos em fáceis
  mediumAccuracy: number; // % acertos em médias
  hardAccuracy: number; // % acertos em difíceis
  easyErrorsCount: number;
  mediumErrorsCount: number;
  hardErrorsCount: number;
  unexpectedCorrectsCount: number; // Acertos em difíceis quando errou fáceis
  diagnosticNotes: string[];
  chuteSuspectItemIds: string[]; // Itens com padrão estatisticamente anômalo (sugestão de revisão sem taxar)
}

/**
 * Analisa a consistência pedagógica do padrão de respostas do aluno.
 * Verifica a monotonicidade da curva de acertos e detecta anomalias sem preconceito de chute.
 */
export function analyzeResponseConsistency(
  responses: StudentItemResponse[]
): ConsistencyAnalysis {
  const valid = responses.filter((r) => !r.isCancelled);

  // Divide as questões por faixa de dificuldade (usando parâmetro b da TRI ou campo difficulty)
  const easyItems = valid.filter((r) => {
    if (r.triParams?.b !== undefined) return r.triParams.b < -0.5;
    return r.difficulty === "FACIL";
  });

  const mediumItems = valid.filter((r) => {
    if (r.triParams?.b !== undefined) return r.triParams.b >= -0.5 && r.triParams.b <= 0.8;
    return r.difficulty === "MEDIA" || (!r.difficulty && r.triParams?.b === undefined);
  });

  const hardItems = valid.filter((r) => {
    if (r.triParams?.b !== undefined) return r.triParams.b > 0.8;
    return r.difficulty === "DIFICIL";
  });

  const calcAcc = (items: StudentItemResponse[]) => {
    if (items.length === 0) return 100;
    const correct = items.filter((i) => i.isCorrect).length;
    return Math.round((correct / items.length) * 100);
  };

  const easyAcc = calcAcc(easyItems);
  const mediumAcc = calcAcc(mediumItems);
  const hardAcc = calcAcc(hardItems);

  const easyErrors = easyItems.filter((i) => !i.isCorrect);
  const mediumErrors = mediumItems.filter((i) => !i.isCorrect);
  const hardErrors = hardItems.filter((i) => !i.isCorrect);

  const diagnosticNotes: string[] = [];
  const chuteSuspectItemIds: string[] = [];

  // Padrão ideal da TRI: taxa_faceis >= taxa_medias >= taxa_dificeis
  // Penalidade se errar muitas fáceis mas acertar difíceis
  let baseScore = 1.0;

  if (easyItems.length > 0 && easyAcc < 70) {
    const penalty = (70 - easyAcc) * 0.005;
    baseScore -= penalty;
    diagnosticNotes.push(
      `Atenção: taxa de acerto em questões fáceis (${easyAcc}%) está abaixo do esperado. Erros em questões fáceis penalizam fortemente a pontuação TRI.`
    );
  }

  // Anomalia: taxa em difíceis maior que fáceis
  if (hardAcc > easyAcc && hardItems.length >= 3 && easyItems.length >= 3) {
    baseScore -= 0.15;
    diagnosticNotes.push(
      "Padrão inesperado: Maior taxa de acerto em questões difíceis do que em fáceis. Pode indicar falta de atenção em enunciados simples ou acertos pontuais ao acaso."
    );

    // Identifica itens difíceis que foram acertados enquanto fáceis foram erradas
    hardItems
      .filter((i) => i.isCorrect)
      .forEach((i) => chuteSuspectItemIds.push(i.questionId));
  } else if (easyAcc >= 85 && mediumAcc >= 65) {
    diagnosticNotes.push(
      "Padrão altamente coerente com a escala da TRI: alta retenção nas questões fundamentais e médias."
    );
  }

  const finalScore = Math.max(Math.min(Math.round(baseScore * 100) / 100, 1.0), 0.2);

  let coherenceLevel: ConsistencyAnalysis["coherenceLevel"] = "EXCELENTE";
  if (finalScore >= 0.85) coherenceLevel = "EXCELENTE";
  else if (finalScore >= 0.7) coherenceLevel = "BOA";
  else if (finalScore >= 0.5) coherenceLevel = "MODERADA";
  else coherenceLevel = "INCONSISTENTE";

  return {
    consistencyScore: finalScore,
    coherenceLevel,
    easyAccuracy: easyAcc,
    mediumAccuracy: mediumAcc,
    hardAccuracy: hardAcc,
    easyErrorsCount: easyErrors.length,
    mediumErrorsCount: mediumErrors.length,
    hardErrorsCount: hardErrors.length,
    unexpectedCorrectsCount: chuteSuspectItemIds.length,
    diagnosticNotes,
    chuteSuspectItemIds,
  };
}
