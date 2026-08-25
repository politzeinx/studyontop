import { DomainLevel, LearningPhase, KnowledgeArea } from "@prisma/client";

export interface DomainUpdateInput {
  previousScore: number; // 0.0 a 100.0
  totalQuestions: number;
  totalCorrect: number;
  easyErrors: number;
  mediumErrors: number;
  hardErrors: number;
  consistencyScore: number; // 0.0 a 1.0
  recentAttempts: { isCorrect: boolean; difficulty: "FACIL" | "MEDIA" | "DIFICIL" }[];
}

export interface DomainUpdateResult {
  newScore: number;
  delta: number;
  domainLevel: DomainLevel;
  learningPhase: LearningPhase;
  accuracyRate: number;
}

/**
 * Recalcula a pontuação de domínio (0 a 100) para um assunto específico
 */
export function recalculateDomainScore(input: DomainUpdateInput): DomainUpdateResult {
  const {
    previousScore,
    totalQuestions,
    totalCorrect,
    easyErrors,
    mediumErrors,
    hardErrors,
    consistencyScore,
    recentAttempts,
  } = input;

  if (totalQuestions === 0 && recentAttempts.length === 0) {
    return {
      newScore: previousScore,
      delta: 0,
      domainLevel: DomainLevel.MEDIO,
      learningPhase: LearningPhase.CONSOLIDAR,
      accuracyRate: 0,
    };
  }

  // Taxa base de acertos
  const accuracyRate = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 50;

  // Peso das tentativas recentes (máximo 10 últimas tentativas)
  let recentWeightedSum = 0;
  let recentTotalWeight = 0;

  recentAttempts.slice(-10).forEach((att) => {
    let weight = 1.0;
    if (att.difficulty === "FACIL") weight = att.isCorrect ? 1.0 : 1.8; // Erro em fácil penaliza mais
    if (att.difficulty === "MEDIA") weight = 1.3;
    if (att.difficulty === "DIFICIL") weight = att.isCorrect ? 1.7 : 0.8; // Erro em difícil penaliza menos

    recentWeightedSum += (att.isCorrect ? 100 : 0) * weight;
    recentTotalWeight += weight;
  });

  const recentScore = recentTotalWeight > 0 ? recentWeightedSum / recentTotalWeight : accuracyRate;

  // Penalidade por erros em questões fáceis
  const easyErrorPenalty = Math.min(easyErrors * 3.5, 18);

  // Bonificação por consistência
  const consistencyBonus = (consistencyScore - 0.7) * 15;

  // Mistura ponderada: 40% histórico acumulado + 50% desempenho recente + bônus/penalidades
  let rawNewScore =
    previousScore * 0.4 +
    recentScore * 0.5 -
    easyErrorPenalty +
    consistencyBonus;

  const newScore = Math.max(Math.min(Math.round(rawNewScore * 10) / 10, 100), 0);
  const delta = Math.round((newScore - previousScore) * 10) / 10;

  let domainLevel: DomainLevel = DomainLevel.MEDIO;
  if (newScore >= 75) domainLevel = DomainLevel.ALTO;
  else if (newScore >= 50) domainLevel = DomainLevel.MEDIO;
  else if (newScore >= 35) domainLevel = DomainLevel.ATENCAO;
  else domainLevel = DomainLevel.PRIORIDADE;

  let learningPhase: LearningPhase = LearningPhase.CONSOLIDAR;
  if (newScore < 45) learningPhase = LearningPhase.APRENDER;
  else if (newScore < 75) learningPhase = LearningPhase.CONSOLIDAR;
  else learningPhase = LearningPhase.MANTER;

  return {
    newScore,
    delta,
    domainLevel,
    learningPhase,
    accuracyRate: Math.round(accuracyRate * 10) / 10,
  };
}
