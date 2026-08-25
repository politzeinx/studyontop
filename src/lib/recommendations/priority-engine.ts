import { GainPotential, PriorityLevel, KnowledgeArea, DomainLevel, LearningPhase } from "@prisma/client";

export interface SubjectDomainInput {
  subject: string;
  subsubject?: string | null;
  area: KnowledgeArea;
  domainScore: number; // 0.0 a 100.0
  accuracyRate: number; // 0.0 a 100.0
  totalQuestions: number;
  recentErrorsCount: number;
  recurrenceScoreEnemRecent: number; // 0.0 a 1.0 (ex: 0.9 = altíssima recorrência no ENEM 2023-2025)
  isContinuousRevision?: boolean;
}

export interface SubjectPriorityResult {
  subject: string;
  subsubject?: string | null;
  area: KnowledgeArea;
  priorityIndex: number; // 0 a 100
  priorityLevel: PriorityLevel;
  gainPotential: GainPotential;
  domainLevel: DomainLevel;
  learningPhase: LearningPhase;
  recommendedAction: string;
  rationale: string;
}

/**
 * Calcula o Potencial de Ganho pedagógico
 * (Não é garantia de nota, mas indicador de melhor retorno por tempo investido)
 */
export function calculateGainPotential(
  domainScore: number,
  recurrenceScore: number
): GainPotential {
  if (domainScore < 45 && recurrenceScore >= 0.7) {
    return GainPotential.MUITO_ALTO;
  }
  if ((domainScore < 65 && recurrenceScore >= 0.6) || (domainScore < 45 && recurrenceScore >= 0.4)) {
    return GainPotential.ALTO;
  }
  if (domainScore < 80 && recurrenceScore >= 0.3) {
    return GainPotential.MEDIO;
  }
  return GainPotential.BAIXO;
}

/**
 * Calcula o Índice de Prioridade de Estudo (0 a 100)
 */
export function calculatePriorityIndex(input: SubjectDomainInput): SubjectPriorityResult {
  const {
    subject,
    subsubject,
    area,
    domainScore,
    recentErrorsCount,
    recurrenceScoreEnemRecent,
    isContinuousRevision,
  } = input;

  // 1. Fator Lacuna (peso 40%): quanto menor o domínio, maior a urgência
  const gapFactor = (100 - domainScore) * 0.4;

  // 2. Fator Recorrência ENEM Recente (peso 35%): edições 2023+ têm peso prioritário
  const recurrenceFactor = recurrenceScoreEnemRecent * 100 * 0.35;

  // 3. Fator Erros Recentes (peso 25%): penalidade por erros acumulados
  const errorPenalty = Math.min(recentErrorsCount * 8, 25);

  let rawPriority = gapFactor + recurrenceFactor + errorPenalty;

  // Se for matéria de revisão contínua (ex: Química Orgânica), mantém um piso mínimo de prioridade de revisão
  if (isContinuousRevision && rawPriority < 45) {
    rawPriority = 45;
  }

  const priorityIndex = Math.max(Math.min(Math.round(rawPriority * 10) / 10, 100), 0);

  // Classificação do Nível de Prioridade
  let priorityLevel: PriorityLevel = PriorityLevel.BAIXA;
  if (priorityIndex >= 75) priorityLevel = PriorityLevel.MUITO_ALTA;
  else if (priorityIndex >= 60) priorityLevel = PriorityLevel.ALTA;
  else if (priorityIndex >= 40) priorityLevel = PriorityLevel.REVISAO;
  else if (priorityIndex >= 25 || isContinuousRevision) priorityLevel = PriorityLevel.MANUTENCAO;
  else priorityLevel = PriorityLevel.BAIXA;

  // Nível de Domínio
  let domainLevel: DomainLevel = DomainLevel.MEDIO;
  if (domainScore >= 75) domainLevel = DomainLevel.ALTO;
  else if (domainScore >= 50) domainLevel = DomainLevel.MEDIO;
  else if (domainScore >= 35) domainLevel = DomainLevel.ATENCAO;
  else domainLevel = DomainLevel.PRIORIDADE;

  // Estágio de Aprendizagem (3 estágios)
  let learningPhase: LearningPhase = LearningPhase.CONSOLIDAR;
  if (domainScore < 45) learningPhase = LearningPhase.APRENDER;
  else if (domainScore < 75) learningPhase = LearningPhase.CONSOLIDAR;
  else learningPhase = LearningPhase.MANTER;

  const gainPotential = calculateGainPotential(domainScore, recurrenceScoreEnemRecent);

  // Ação recomendada e justificativa contextual
  let recommendedAction = "";
  let rationale = "";

  if (priorityLevel === PriorityLevel.MUITO_ALTA) {
    recommendedAction = `Estude ${subject}${subsubject ? ` (${subsubject})` : ""} por 60 minutos`;
    rationale = `Baixo domínio (${domainScore}%) somado a alta recorrência no ENEM recente (2023+) e erros recentes.`;
  } else if (priorityLevel === PriorityLevel.ALTA) {
    recommendedAction = `Faça 15 questões de fixação de ${subject}`;
    rationale = `Fase de consolidação: foco em converter acertos parciais em segurança na TRI.`;
  } else if (isContinuousRevision) {
    recommendedAction = `Revisar 10-15 flashcards de ${subject}`;
    rationale = `Assunto de alta volatilidade da memória (Revisão Contínua Obrigatória).`;
  } else if (priorityLevel === PriorityLevel.REVISAO) {
    recommendedAction = `Revisão rápida de conceitos e fórmulas de ${subject}`;
    rationale = `Manutenção periódica para evitar queda na curva de retenção.`;
  } else {
    recommendedAction = `Manter em segundo plano (domínio consolidado)`;
    rationale = `Bom domínio atual (${domainScore}%). Revisar apenas quando agendado pelo SRS.`;
  }

  return {
    subject,
    subsubject,
    area,
    priorityIndex,
    priorityLevel,
    gainPotential,
    domainLevel,
    learningPhase,
    recommendedAction,
    rationale,
  };
}

/**
 * Determina a "Melhor Próxima Ação de Estudo" global do aluno
 * Responde à pergunta central do Master Prompt (item 62).
 */
export function determineBestNextStudyAction(
  subjects: SubjectDomainInput[]
): {
  actionTitle: string;
  actionDetails: string;
  topSubject: SubjectPriorityResult;
  allRanked: SubjectPriorityResult[];
} {
  if (subjects.length === 0) {
    return {
      actionTitle: "Realize seu primeiro simulado diagnóstico",
      actionDetails: "Para calibrar seu mapa de domínio e notas TRI, inicie um simulado adaptativo de 45 questões.",
      topSubject: {
        subject: "Simulado Geral",
        area: KnowledgeArea.MATEMATICA,
        priorityIndex: 100,
        priorityLevel: PriorityLevel.MUITO_ALTA,
        gainPotential: GainPotential.MUITO_ALTO,
        domainLevel: DomainLevel.PRIORIDADE,
        learningPhase: LearningPhase.APRENDER,
        recommendedAction: "Fazer Simulado Diagnóstico",
        rationale: "Sem dados prévios suficientes.",
      },
      allRanked: [],
    };
  }

  const prioritized = subjects
    .map((s) => calculatePriorityIndex(s))
    .sort((a, b) => b.priorityIndex - a.priorityIndex);

  const top = prioritized[0];

  return {
    actionTitle: top.recommendedAction,
    actionDetails: top.rationale,
    topSubject: top,
    allRanked: prioritized,
  };
}
