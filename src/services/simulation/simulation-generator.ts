import { SEED_QUESTIONS } from "@/lib/data/questions-seed";
import { QuestionData, KnowledgeArea, QuestionDifficulty, SimulationType } from "@/types";

export interface SimulationConfig {
  type: SimulationType;
  area?: KnowledgeArea | "TODAS";
  questionCount: number;
  durationMinutes?: number;
  weakSubjects?: string[];
  focusOnRecentEnem?: boolean;
}

export interface GeneratedSimulation {
  id: string;
  title: string;
  type: SimulationType;
  area?: KnowledgeArea;
  totalQuestions: number;
  durationMinutes: number;
  questions: QuestionData[];
  distributionSummary: {
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    recentPatternCount: number;
    subjectsCovered: string[];
  };
}

/**
 * Gera um simulado adaptativo ou padrão ENEM recente com balanceamento pedagógico
 */
export function generateSimulation(config: SimulationConfig): GeneratedSimulation {
  const {
    type,
    area = "TODAS",
    questionCount = 45,
    weakSubjects = ["Geometria Espacial", "Termodinâmica"],
    focusOnRecentEnem = true,
  } = config;

  let pool = [...SEED_QUESTIONS];

  // Filtra por área se especificado
  if (area !== "TODAS") {
    pool = pool.filter((q) => q.area === area);
  }

  // Se o pool de seed for menor que a quantidade solicitada, expande o seed de forma controlada
  while (pool.length < questionCount) {
    const cloned = SEED_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `${q.id}-clone-${pool.length + idx}`,
    }));
    pool.push(...cloned);
    if (area !== "TODAS") {
      pool = pool.filter((q) => q.area === area);
    }
  }

  let selectedQuestions: QuestionData[] = [];

  if (type === SimulationType.ADAPTATIVO) {
    // 1. 55% de questões focadas em fraquezas e alto potencial de ganho
    const targetWeakCount = Math.round(questionCount * 0.55);
    const weakPool = pool.filter((q) => weakSubjects.includes(q.subject));
    selectedQuestions.push(...weakPool.slice(0, targetWeakCount));

    // 2. 45% restantes para consolidação e consistência pedagógica (fáceis e médias)
    const remainingCount = questionCount - selectedQuestions.length;
    const generalPool = pool.filter((q) => !selectedQuestions.some((s) => s.id === q.id));
    selectedQuestions.push(...generalPool.slice(0, remainingCount));
  } else {
    // Modo ENEM Recente / Geral: Mantém a proporção real do ENEM (30% fáceis, 50% médias, 20% difíceis)
    const easyTarget = Math.round(questionCount * 0.3);
    const hardTarget = Math.round(questionCount * 0.2);
    const mediumTarget = questionCount - easyTarget - hardTarget;

    const easyItems = pool.filter((q) => q.difficulty === QuestionDifficulty.FACIL);
    const medItems = pool.filter((q) => q.difficulty === QuestionDifficulty.MEDIA);
    const hardItems = pool.filter((q) => q.difficulty === QuestionDifficulty.DIFICIL);

    selectedQuestions.push(
      ...easyItems.slice(0, easyTarget),
      ...medItems.slice(0, mediumTarget),
      ...hardItems.slice(0, hardTarget)
    );

    // Completa caso alguma faixa tenha menos itens
    if (selectedQuestions.length < questionCount) {
      const remaining = pool.filter((q) => !selectedQuestions.some((s) => s.id === q.id));
      selectedQuestions.push(...remaining.slice(0, questionCount - selectedQuestions.length));
    }
  }

  // Ordena para apresentar a prova de forma estruturada
  selectedQuestions = selectedQuestions.slice(0, questionCount);

  const easyCount = selectedQuestions.filter((q) => q.difficulty === QuestionDifficulty.FACIL).length;
  const mediumCount = selectedQuestions.filter((q) => q.difficulty === QuestionDifficulty.MEDIA).length;
  const hardCount = selectedQuestions.filter((q) => q.difficulty === QuestionDifficulty.DIFICIL).length;
  const recentPatternCount = selectedQuestions.filter((q) => q.isRecentPattern).length;
  const subjectsCovered = Array.from(new Set(selectedQuestions.map((q) => q.subject)));

  const titleMap: Record<SimulationType, string> = {
    [SimulationType.ADAPTATIVO]: `Simulado Adaptativo — Foco em Fraquezas (${questionCount}q)`,
    [SimulationType.ENEM_RECENTE]: `Simulado Estilo ENEM Recente 2024/2025 (${questionCount}q)`,
    [SimulationType.OFICIAL]: `Simulado ENEM Oficial (${questionCount}q)`,
    [SimulationType.PERSONALIZADO]: `Simulado Personalizado (${questionCount}q)`,
  };

  const durationMinutes = Math.round(questionCount * 3.0); // Média ENEM: 3 minutos por questão

  return {
    id: `sim-${Date.now()}`,
    title: titleMap[type] || `Simulado ENEM (${questionCount}q)`,
    type,
    area: area === "TODAS" ? undefined : area,
    totalQuestions: questionCount,
    durationMinutes,
    questions: selectedQuestions,
    distributionSummary: {
      easyCount,
      mediumCount,
      hardCount,
      recentPatternCount,
      subjectsCovered,
    },
  };
}
