import { CardStage } from "@prisma/client";

export type FSRSGrade = 1 | 2 | 3 | 4; // 1 = Errei (Again), 2 = Difícil (Hard), 3 = Bom (Good), 4 = Fácil (Easy)

export interface CardReviewState {
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number; // SM-2 Ease Factor (default: 2.5)
  stability: number; // FSRS Stability (dias até R cair para 90%)
  difficulty: number; // FSRS Difficulty (1 a 10)
  stage: CardStage;
  successStreak: number;
  failureCount: number;
  isContinuousRevision?: boolean;
}

export interface FSRSNextReview {
  intervalDays: number;
  nextDueDate: Date;
  stability: number;
  difficulty: number;
  easeFactor: number;
  stage: CardStage;
  stageTransitionNote: string;
}

/**
 * Calcula a Retrievability (probabilidade de lembrança) após t dias:
 * R(t) = (1 + 0.19 * t / S)^(-0.5)
 */
export function calculateRetrievability(daysElapsed: number, stability: number): number {
  if (stability <= 0) return 0;
  const r = Math.pow(1 + (0.19 * daysElapsed) / stability, -0.5);
  return Math.max(Math.min(r, 1.0), 0.0);
}

/**
 * Algoritmo FSRS / SM-2 Híbrido Adaptativo para o StudyOnTop
 */
export function scheduleNextReview(
  currentState: CardReviewState,
  grade: FSRSGrade,
  reviewDate: Date = new Date()
): FSRSNextReview {
  let {
    repetitionCount,
    intervalDays,
    easeFactor,
    stability,
    difficulty,
    stage,
    successStreak,
    failureCount,
    isContinuousRevision,
  } = currentState;

  // 1. Atualização de Dificuldade FSRS (D: 1 a 10)
  // Grade 1 aumenta dificuldade, Grade 4 diminui
  const difficultyDelta = (4 - grade) * 0.5 - 0.2;
  difficulty = Math.max(Math.min(difficulty + difficultyDelta, 10.0), 1.0);

  // 2. Atualização de Fator de Facilidade SM-2
  easeFactor = Math.max(
    easeFactor + (0.1 - (4 - grade) * (0.08 + (4 - grade) * 0.02)),
    1.3
  );

  let newIntervalDays = 1.0;
  let newStage: CardStage = stage;
  let note = "";

  if (grade === 1) {
    // ERREI (Again)
    failureCount += 1;
    successStreak = 0;
    repetitionCount = Math.max(repetitionCount - 1, 0);
    stability = Math.max(stability * 0.4, 0.5);
    newIntervalDays = 0.5; // Revisar hoje / amanhã cedo

    // Se errou em DOMINADO, regride para CONSOLIDANDO
    if (stage === CardStage.DOMINADO || stage === CardStage.MANUTENCAO) {
      newStage = CardStage.CONSOLIDANDO;
      note = "Cartão regrediu para Consolidação devido a erro recente.";
    } else {
      newStage = CardStage.APRENDENDO;
      note = "Em fase de aprendizagem inicial.";
    }
  } else {
    // ACERTOU (Hard, Good ou Easy)
    successStreak += 1;
    repetitionCount += 1;

    if (grade === 2) {
      // DIFÍCIL (Hard)
      stability = stability * 1.2;
      newIntervalDays = Math.max(intervalDays * 1.2, 1.0);
      note = "Acerto com dificuldade: intervalo moderado.";
    } else if (grade === 3) {
      // BOM (Good)
      stability = stability * (1 + easeFactor * 0.8);
      if (repetitionCount === 1) newIntervalDays = 1.0;
      else if (repetitionCount === 2) newIntervalDays = 3.0;
      else newIntervalDays = Math.round(intervalDays * easeFactor);
      note = "Bom domínio: intervalo expandido.";
    } else {
      // FÁCIL (Easy)
      stability = stability * (1 + easeFactor * 1.4);
      if (repetitionCount === 1) newIntervalDays = 3.0;
      else if (repetitionCount === 2) newIntervalDays = 7.0;
      else newIntervalDays = Math.round(intervalDays * easeFactor * 1.3);
      note = "Fácil domínio: salto de retenção consolidado.";
    }

    // Progressão de Estágios
    if (successStreak >= 5 || newIntervalDays >= 30) {
      if (isContinuousRevision) {
        newStage = CardStage.MANUTENCAO;
        note = "Em Manutenção Periódica Contínua.";
        // Limita o intervalo máximo de matérias contínuas (ex: Química Orgânica) para 21 dias
        newIntervalDays = Math.min(newIntervalDays, 21.0);
      } else {
        newStage = CardStage.DOMINADO;
        note = "Assunto dominado com alta retenção.";
      }
    } else if (successStreak >= 3 || newIntervalDays >= 7) {
      newStage = CardStage.CONSOLIDANDO;
      note = "Em fase de consolidação na memória de longo prazo.";
    } else {
      newStage = CardStage.APRENDENDO;
    }
  }

  // Calcula a próxima data de revisão
  const nextDueDate = new Date(reviewDate.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

  return {
    intervalDays: Math.round(newIntervalDays * 10) / 10,
    nextDueDate,
    stability: Math.round(stability * 100) / 100,
    difficulty: Math.round(difficulty * 10) / 10,
    easeFactor: Math.round(easeFactor * 100) / 100,
    stage: newStage,
    stageTransitionNote: note,
  };
}
