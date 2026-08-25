import { QuestionData, AnswerStatus, KnowledgeArea, ErrorTaxonomy } from "@/types";
import { calculateSimulationTRI, TriEstimationResult } from "@/lib/tri/tri-engine";
import { analyzeResponseConsistency, ConsistencyAnalysis } from "@/lib/tri/consistency";
import { recalculateDomainScore } from "@/lib/statistics/domain-engine";
import { calculatePriorityIndex, SubjectPriorityResult } from "@/lib/recommendations/priority-engine";

export interface CorrectedItem {
  questionId: string;
  question: QuestionData;
  chosenAlternative: string | null;
  correctAlternative: string;
  status: AnswerStatus;
  isCorrect: boolean;
  isCancelled: boolean;
  isBlank: boolean;
  errorTaxonomy?: ErrorTaxonomy;
  probableCause?: string;
  whatToStudy?: string;
}

export interface SimulationCorrectionResult {
  simulationId: string;
  totalQuestions: number;
  validQuestionsCount: number; // Exclui anuladas
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  cancelledCount: number;
  accuracyPercentage: number;
  
  triResult: TriEstimationResult;
  consistency: ConsistencyAnalysis;
  
  items: CorrectedItem[];
  areaBreakdown: Record<
    string,
    { total: number; correct: number; percentage: number; estimatedScore: number }
  >;
  taxonomySummary: Record<string, number>;
  generatedErrorBankCount: number;
}

/**
 * Classifica a causa raiz provável de um erro com base no tipo de raciocínio da questão
 */
export function inferErrorTaxonomy(question: QuestionData, chosen: string | null): {
  taxonomy: ErrorTaxonomy;
  probableCause: string;
  whatToStudy: string;
} {
  if (!chosen) {
    return {
      taxonomy: ErrorTaxonomy.TEMPO,
      probableCause: "Questão deixada em branco. Pode indicar falta de tempo no bloco ou dúvida excessiva.",
      whatToStudy: `Revisão de conceitos fundamentais de ${question.subject} e estratégia de ritmo de prova.`,
    };
  }

  if (question.difficulty === "FACIL") {
    return {
      taxonomy: ErrorTaxonomy.ATENCAO,
      probableCause: "Erro em questão de alta taxa de acerto. Pode indicar leitura rápida do enunciado ou distração com pegadinha.",
      whatToStudy: question.whatToStudy || `Atenção aos detalhes do enunciado em ${question.subject}.`,
    };
  }

  if (question.difficulty === "DIFICIL") {
    return {
      taxonomy: ErrorTaxonomy.FALTA_CONHECIMENTO,
      probableCause: "Lacuna teórica aprofundada em microtópico de maior complexidade da matriz do ENEM.",
      whatToStudy: question.whatToStudy || `Estudo aprofundado da teoria de ${question.subject} (${question.subsubject || ""}).`,
    };
  }

  if (question.calculationNeeded) {
    return {
      taxonomy: ErrorTaxonomy.CALCULO,
      probableCause: "Inconsistência na simplificação algébrica ou aplicação de fórmulas numéricas.",
      whatToStudy: question.whatToStudy || `Fórmulas e operações práticas de ${question.subject}.`,
    };
  }

  return {
    taxonomy: ErrorTaxonomy.ERRO_CONCEITUAL,
    probableCause: "Confusão entre conceitos correlatos ou interpretação equivocada do fenômeno descrito.",
    whatToStudy: question.whatToStudy || `Revisar conceitos centrais de ${question.subject}.`,
  };
}

/**
 * Motor central de correção automática de simulados com recálculo da TRI
 */
export function executeCorrection(params: {
  simulationId: string;
  questions: QuestionData[];
  studentAnswers: Record<string, string | null>; // { [questionId]: 'A' | 'B' ... }
  cancelledQuestionIds?: string[];
  area?: KnowledgeArea;
}): SimulationCorrectionResult {
  const { simulationId, questions, studentAnswers, cancelledQuestionIds = [], area } = params;

  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;
  let cancelledCount = 0;

  const taxonomySummary: Record<string, number> = {
    FALTA_CONHECIMENTO: 0,
    ERRO_CONCEITUAL: 0,
    INTERPRETACAO: 0,
    CALCULO: 0,
    ATENCAO: 0,
    CONFUSAO_ALTERNATIVAS: 0,
    ESTRATEGIA: 0,
    TEMPO: 0,
  };

  const correctedItems: CorrectedItem[] = [];

  questions.forEach((q) => {
    const isCancelled = cancelledQuestionIds.includes(q.id);
    const chosen = studentAnswers[q.id] || null;
    const isCorrect = !isCancelled && chosen === q.correctAlternative;
    const isBlank = !isCancelled && !chosen;

    let status: AnswerStatus = AnswerStatus.CORRETA;

    if (isCancelled) {
      status = AnswerStatus.ANULADA;
      cancelledCount++;
    } else if (isBlank) {
      status = AnswerStatus.EM_BRANCO;
      blankCount++;
    } else if (isCorrect) {
      status = AnswerStatus.CORRETA;
      correctCount++;
    } else {
      status = AnswerStatus.ERRADA;
      wrongCount++;
    }

    let errorDetails;
    if (!isCorrect && !isCancelled) {
      errorDetails = inferErrorTaxonomy(q, chosen);
      taxonomySummary[errorDetails.taxonomy] =
        (taxonomySummary[errorDetails.taxonomy] || 0) + 1;
    }

    correctedItems.push({
      questionId: q.id,
      question: q,
      chosenAlternative: chosen,
      correctAlternative: q.correctAlternative,
      status,
      isCorrect,
      isCancelled,
      isBlank,
      errorTaxonomy: errorDetails?.taxonomy,
      probableCause: errorDetails?.probableCause,
      whatToStudy: errorDetails?.whatToStudy,
    });
  });

  const validQuestionsCount = questions.length - cancelledCount;
  const accuracyPercentage =
    validQuestionsCount > 0 ? (correctCount / validQuestionsCount) * 100 : 0;

  // 1. Recálculo da TRI Bayesiana (EAP)
  const itemResponsesForTri = correctedItems.map((item) => ({
    questionId: item.questionId,
    isCorrect: item.isCorrect,
    isBlank: item.isBlank,
    isCancelled: item.isCancelled,
    triParams: {
      a: item.question.triParamA || 1.2,
      b: item.question.triParamB || 0.1,
      c: item.question.triParamC || 0.2,
      hasOfficialTri: item.question.hasOfficialTri,
    },
    difficulty: item.question.difficulty,
  }));

  const triResult = calculateSimulationTRI(itemResponsesForTri, area || "MATEMATICA");

  // 2. Análise de consistência
  const consistency = analyzeResponseConsistency(itemResponsesForTri);

  // 3. Breakdown por área
  const areaBreakdown: Record<
    string,
    { total: number; correct: number; percentage: number; estimatedScore: number }
  > = {};

  const uniqueAreas = Array.from(new Set(questions.map((q) => q.area)));
  uniqueAreas.forEach((a) => {
    const areaItems = correctedItems.filter((i) => i.question.area === a && !i.isCancelled);
    const areaCorrect = areaItems.filter((i) => i.isCorrect).length;
    const pct = areaItems.length > 0 ? (areaCorrect / areaItems.length) * 100 : 0;
    areaBreakdown[a] = {
      total: areaItems.length,
      correct: areaCorrect,
      percentage: Math.round(pct * 10) / 10,
      estimatedScore: triResult.enemScaleScore,
    };
  });

  return {
    simulationId,
    totalQuestions: questions.length,
    validQuestionsCount,
    correctCount,
    wrongCount,
    blankCount,
    cancelledCount,
    accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
    triResult,
    consistency,
    items: correctedItems,
    areaBreakdown,
    taxonomySummary,
    generatedErrorBankCount: wrongCount + blankCount,
  };
}
