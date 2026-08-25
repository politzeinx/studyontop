import { KnowledgeArea, PriorityLevel, GainPotential, DomainLevel } from "@prisma/client";
import { DailySchedule, StudyBlock } from "@/types";
import { SubjectDomainInput, calculatePriorityIndex } from "@/lib/recommendations/priority-engine";

export interface UserStudyConfig {
  studyHoursPerDay: number; // Ex: 3.0
  studyDaysPerWeek: number; // Ex: 6
  targetCourse: string; // Ex: Medicina
  examDate?: Date; // Data do ENEM
}

export interface GeneratedStudyPlanResult {
  weeklyTargetHours: number;
  totalPlannedMinutes: number;
  dailySchedules: DailySchedule[];
  focusSubjects: {
    subject: string;
    area: KnowledgeArea;
    priority: PriorityLevel;
    gainPotential: GainPotential;
    allocatedMinutes: number;
  }[];
  activeStudyRecommendation: {
    title: string;
    details: string;
    durationMinutes: number;
    subject: string;
    area: KnowledgeArea;
  };
}

/**
 * Gera o cronograma diário e semanal adaptativo do aluno
 */
export function generateAdaptiveStudyPlan(
  config: UserStudyConfig,
  domainInputs: SubjectDomainInput[]
): GeneratedStudyPlanResult {
  const { studyHoursPerDay = 3.0, studyDaysPerWeek = 6 } = config;
  const weeklyTargetHours = studyHoursPerDay * studyDaysPerWeek;
  const dailyTargetMinutes = Math.round(studyHoursPerDay * 60);

  // Calcula prioridades de todos os assuntos cadastrados
  const prioritizedSubjects = domainInputs
    .map((d) => calculatePriorityIndex(d))
    .sort((a, b) => b.priorityIndex - a.priorityIndex);

  const topSubject = prioritizedSubjects[0] || {
    subject: "Geometria Espacial",
    subsubject: "Prismas e Cilindros",
    area: KnowledgeArea.MATEMATICA,
    priorityIndex: 85,
    priorityLevel: PriorityLevel.MUITO_ALTA,
    gainPotential: GainPotential.MUITO_ALTO,
    domainLevel: DomainLevel.PRIORIDADE,
    recommendedAction: "Estude Geometria Espacial por 60 minutos",
    rationale: "Assunto prioritário devido a baixo domínio e alta recorrência recente no ENEM.",
  };

  const daysOfWeek: Array<DailySchedule["dayOfWeek"]> = [
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
  ];

  const dailySchedules: DailySchedule[] = [];
  let dayIdx = 0;

  for (const day of daysOfWeek.slice(0, studyDaysPerWeek)) {
    const blocks: StudyBlock[] = [];
    let remainingMinutes = dailyTargetMinutes;

    // 1. Bloco de Revisão Diária Obrigatória de Flashcards SRS (20 min)
    blocks.push({
      id: `block-${day}-srs`,
      subject: "Revisão Diária de Flashcards (SRS)",
      area: KnowledgeArea.NATUREZA,
      durationMinutes: 20,
      type: "FLASHCARDS",
      priority: PriorityLevel.REVISAO,
      reason: "Manutenção da curva de retenção de memória de longo prazo.",
      completed: false,
    });
    remainingMinutes -= 20;

    // 2. Se for Sábado: Simulado Semanal ou Foco em Questões
    if (day === "SABADO") {
      blocks.push({
        id: `block-${day}-sim`,
        subject: "Simulado Adaptativo / Treino de Ritmo",
        area: topSubject.area,
        durationMinutes: remainingMinutes,
        type: "SIMULADO",
        priority: PriorityLevel.MUITO_ALTA,
        reason: "Treino de estratégia de tempo e calibração da TRI.",
        completed: false,
      });
      remainingMinutes = 0;
    } else {
      // 3. Bloco Principal de Teoria & Exercícios do Assunto Prioritário do Dia
      const targetSub = prioritizedSubjects[dayIdx % prioritizedSubjects.length] || topSubject;
      const mainDuration = Math.min(60, remainingMinutes);

      blocks.push({
        id: `block-${day}-main`,
        subject: `${targetSub.subject}${targetSub.subsubject ? ` (${targetSub.subsubject})` : ""}`,
        area: targetSub.area,
        durationMinutes: mainDuration,
        type: "TEORIA",
        priority: targetSub.priorityLevel,
        reason: `Potencial de ganho ${targetSub.gainPotential} no padrão do ENEM recente.`,
        completed: false,
      });
      remainingMinutes -= mainDuration;

      // 4. Bloco Secundário de Resolução de Questões Calibradas
      if (remainingMinutes > 0) {
        const secondarySub =
          prioritizedSubjects[(dayIdx + 1) % prioritizedSubjects.length] || topSubject;

        blocks.push({
          id: `block-${day}-sec`,
          subject: `${secondarySub.subject} (Questões Calibradas)`,
          area: secondarySub.area,
          durationMinutes: remainingMinutes,
          type: "QUESTOES",
          priority: secondarySub.priorityLevel,
          reason: "Fixação e resolução prática no estilo contemporâneo do ENEM.",
          completed: false,
        });
        remainingMinutes = 0;
      }
    }

    dailySchedules.push({
      dayOfWeek: day,
      date: `Dia ${dayIdx + 1}`,
      totalPlannedHours: Math.round((dailyTargetMinutes / 60) * 10) / 10,
      blocks,
    });

    dayIdx++;
  }

  // Se descansar no Domingo
  if (studyDaysPerWeek < 7) {
    dailySchedules.push({
      dayOfWeek: "DOMINGO",
      date: "Descanso",
      totalPlannedHours: 0,
      blocks: [],
    });
  }

  const focusSubjects = prioritizedSubjects.slice(0, 4).map((sub) => ({
    subject: sub.subject,
    area: sub.area,
    priority: sub.priorityLevel,
    gainPotential: sub.gainPotential,
    allocatedMinutes: 180,
  }));

  return {
    weeklyTargetHours,
    totalPlannedMinutes: weeklyTargetHours * 60,
    dailySchedules,
    focusSubjects,
    activeStudyRecommendation: {
      title: topSubject.recommendedAction,
      details: topSubject.rationale,
      durationMinutes: 60,
      subject: topSubject.subject,
      area: topSubject.area,
    },
  };
}
