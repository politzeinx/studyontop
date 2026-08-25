import {
  KnowledgeArea,
  QuestionDifficulty,
  ReasoningType,
  SimulationType,
  SimulationStatus,
  AnswerStatus,
  AnswerSource,
  ErrorTaxonomy,
  DomainLevel,
  GainPotential,
  PriorityLevel,
  CardType,
  CardStage,
  LearningPhase,
} from "@prisma/client";

export {
  KnowledgeArea,
  QuestionDifficulty,
  ReasoningType,
  SimulationType,
  SimulationStatus,
  AnswerStatus,
  AnswerSource,
  ErrorTaxonomy,
  DomainLevel,
  GainPotential,
  PriorityLevel,
  CardType,
  CardStage,
  LearningPhase,
};

export interface AlternativeItem {
  letter: "A" | "B" | "C" | "D" | "E";
  text: string;
  isCorrect?: boolean;
}

export interface QuestionData {
  id: string;
  officialCode?: string | null;
  year: number;
  edition: string;
  area: KnowledgeArea;
  discipline: string;
  statement: string;
  contextText?: string | null;
  images: string[];
  hasGraph: boolean;
  hasTable: boolean;
  hasFormulas: boolean;
  alternatives: AlternativeItem[];
  correctAlternative: string;
  competence?: number | null;
  skill?: number | null;
  subject: string;
  subsubject?: string | null;
  difficulty: QuestionDifficulty;
  triParamA?: number | null;
  triParamB?: number | null;
  triParamC?: number | null;
  hasOfficialTri: boolean;
  isRecentPattern: boolean;
  reasoningType: ReasoningType;
  calculationNeeded: boolean;
  isInterdisciplinary: boolean;
  explanation?: string | null;
  whatToStudy?: string | null;
}

export interface SimulationResultSummary {
  simulationId: string;
  title: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  accuracyPercentage: number;
  estimatedTriScore?: number | null;
  officialTriScore?: number | null;
  consistencyScore: number;
  areaBreakdown: Record<KnowledgeArea, { total: number; correct: number; percentage: number }>;
  topWeaknesses: { subject: string; errorCount: number; gainPotential: GainPotential }[];
  topStrengths: { subject: string; domainScore: number }[];
  recommendedFlashcardsCount: number;
  nextBestAction: string;
}

export interface FSRSParameters {
  stability: number;
  difficulty: number;
  intervalDays: number;
  nextReviewDate: Date;
  stage: CardStage;
}

export interface StudyBlock {
  id: string;
  subject: string;
  area: KnowledgeArea;
  durationMinutes: number;
  type: "TEORIA" | "QUESTOES" | "FLASHCARDS" | "SIMULADO" | "REVISAO";
  priority: PriorityLevel;
  reason: string;
  completed: boolean;
}

export interface DailySchedule {
  dayOfWeek: "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO" | "DOMINGO";
  date: string;
  totalPlannedHours: number;
  blocks: StudyBlock[];
}

export interface NavigationItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string | number;
  description?: string;
  isHighlight?: boolean;
}
