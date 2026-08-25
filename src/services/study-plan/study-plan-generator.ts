import { KnowledgeArea, PriorityLevel, GainPotential, DomainLevel } from "@prisma/client";
import { DailySchedule, StudyBlock } from "@/types";
import { SubjectDomainInput, calculatePriorityIndex } from "@/lib/recommendations/priority-engine";

export interface UserStudyConfig {
  studyHoursPerDay: number; // Ex: 3.0
  studyDaysPerWeek: number; // Ex: 5, 6 ou 7
  targetCourse: string; // Ex: Engenharia de Software
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

const DEFAULT_WEEKLY_SYLLABUS = [
  // Segunda
  {
    mainSubject: "Matemática (Álgebra, Funções e Proporcionalidade)",
    mainArea: KnowledgeArea.MATEMATICA,
    mainReason: "Assunto de altíssima incidência na régua TRI do ENEM.",
    secSubject: "Redação (Estrutura Dissertativa-Argumentativa e Repertório)",
    secArea: KnowledgeArea.LINGUAGENS,
    secReason: "Treino semanal para atingir a meta dos 900+ pontos.",
  },
  // Terça
  {
    mainSubject: "Física (Cinemática, Dinâmica e Energia)",
    mainArea: KnowledgeArea.NATUREZA,
    mainReason: "Conceitos fundamentais de Mecânica no ENEM.",
    secSubject: "Química (Estrutura Atômica, Ligações e Soluções)",
    secArea: KnowledgeArea.NATUREZA,
    secReason: "Base essencial para estequiometria e química geral.",
  },
  // Quarta
  {
    mainSubject: "Biologia (Ecologia, Ciclos Biogeoquímicos e Citologia)",
    mainArea: KnowledgeArea.NATUREZA,
    mainReason: "Tema mais recorrente de Ciências da Natureza em todas as edições.",
    secSubject: "História (Brasil República e Cidadania)",
    secArea: KnowledgeArea.HUMANAS,
    secReason: "Matriz de Ciências Humanas com foco em processos sociais.",
  },
  // Quinta
  {
    mainSubject: "Matemática (Geometria Plana, Espacial e Trigonometria)",
    mainArea: KnowledgeArea.MATEMATICA,
    mainReason: "Cálculo de áreas, volumes e visão espacial.",
    secSubject: "Geografia (Urbanização, Espaço Agrário e Climatologia)",
    secArea: KnowledgeArea.HUMANAS,
    secReason: "Interpretação de mapas, gráficos e dinâmica socioambiental.",
  },
  // Sexta
  {
    mainSubject: "Linguagens (Interpretação de Texto, Figuras e Gêneros)",
    mainArea: KnowledgeArea.LINGUAGENS,
    mainReason: "Competência leitora e estratégias de velocidade.",
    secSubject: "Filosofia e Sociologia (Ética, Política e Teoria Social)",
    secArea: KnowledgeArea.HUMANAS,
    secReason: "Base teórica interdisciplinar para Humanas e Redação.",
  },
  // Sábado
  {
    mainSubject: "Simulado Semanal / Treino de Ritmo e TRI",
    mainArea: KnowledgeArea.MATEMATICA,
    mainReason: "Simulação de tempo de prova e calibração estatística.",
    secSubject: "",
    secArea: KnowledgeArea.MATEMATICA,
    secReason: "",
  },
  // Domingo
  {
    mainSubject: "Treino Prático de Questões Contemporâneas (ENEM Recente)",
    mainArea: KnowledgeArea.MATEMATICA,
    mainReason: "Consolidação prática com questões dos padrões mais recentes.",
    secSubject: "Revisão e Fechamento Semanal",
    secArea: KnowledgeArea.NATUREZA,
    secReason: "Fixação dos pontos revisados ao longo da semana.",
  },
];

/**
 * Gera o cronograma diário e semanal adaptativo do aluno para 5, 6 ou 7 dias
 */
export function generateAdaptiveStudyPlan(
  config: UserStudyConfig,
  domainInputs: SubjectDomainInput[],
  isDemoMode: boolean = false
): GeneratedStudyPlanResult {
  const { studyHoursPerDay = 3.0, studyDaysPerWeek = 6 } = config;
  const clampedDays = Math.min(Math.max(studyDaysPerWeek, 1), 7);
  const weeklyTargetHours = studyHoursPerDay * clampedDays;
  const dailyTargetMinutes = Math.round(studyHoursPerDay * 60);

  const allDaysOfWeek: Array<DailySchedule["dayOfWeek"]> = [
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
    "DOMINGO",
  ];

  const dailySchedules: DailySchedule[] = [];

  for (let idx = 0; idx < 7; idx++) {
    const dayName = allDaysOfWeek[idx];
    const isStudyDay = idx < clampedDays;

    if (!isStudyDay) {
      dailySchedules.push({
        dayOfWeek: dayName,
        date: "Descanso",
        totalPlannedHours: 0,
        blocks: [],
      });
      continue;
    }

    const blocks: StudyBlock[] = [];
    let remainingMinutes = dailyTargetMinutes;

    // 1. Bloco de Revisão de Flashcards SRS (20 min)
    blocks.push({
      id: `block-${dayName}-srs`,
      subject: "Revisão Diária de Flashcards (SRS)",
      area: KnowledgeArea.NATUREZA,
      durationMinutes: 20,
      type: "FLASHCARDS",
      priority: PriorityLevel.REVISAO,
      reason: "Manutenção da curva de retenção de memória de longo prazo.",
      completed: false,
    });
    remainingMinutes -= 20;

    const daySyllabus = DEFAULT_WEEKLY_SYLLABUS[idx] || DEFAULT_WEEKLY_SYLLABUS[0];

    // Sábado é Simulado Semanal
    if (dayName === "SABADO") {
      blocks.push({
        id: `block-${dayName}-sim`,
        subject: daySyllabus.mainSubject,
        area: daySyllabus.mainArea,
        durationMinutes: remainingMinutes,
        type: "SIMULADO",
        priority: PriorityLevel.MUITO_ALTA,
        reason: daySyllabus.mainReason,
        completed: false,
      });
    } else {
      // Bloco Principal de Teoria
      const mainDuration = Math.min(70, remainingMinutes);
      blocks.push({
        id: `block-${dayName}-main`,
        subject: daySyllabus.mainSubject,
        area: daySyllabus.mainArea,
        durationMinutes: mainDuration,
        type: "TEORIA",
        priority: PriorityLevel.ALTA,
        reason: daySyllabus.mainReason,
        completed: false,
      });
      remainingMinutes -= mainDuration;

      // Bloco Secundário de Questões
      if (remainingMinutes > 0 && daySyllabus.secSubject) {
        blocks.push({
          id: `block-${dayName}-sec`,
          subject: daySyllabus.secSubject,
          area: daySyllabus.secArea,
          durationMinutes: remainingMinutes,
          type: "QUESTOES",
          priority: PriorityLevel.ALTA,
          reason: daySyllabus.secReason,
          completed: false,
        });
      }
    }

    dailySchedules.push({
      dayOfWeek: dayName,
      date: `Dia ${idx + 1}`,
      totalPlannedHours: Math.round((dailyTargetMinutes / 60) * 10) / 10,
      blocks,
    });
  }

  const focusSubjects = [
    {
      subject: "Matemática e Funções",
      area: KnowledgeArea.MATEMATICA,
      priority: PriorityLevel.MUITO_ALTA,
      gainPotential: GainPotential.MUITO_ALTO,
      allocatedMinutes: 180,
    },
    {
      subject: "Ecologia e Natureza",
      area: KnowledgeArea.NATUREZA,
      priority: PriorityLevel.ALTA,
      gainPotential: GainPotential.ALTO,
      allocatedMinutes: 140,
    },
    {
      subject: "Estrutura de Redação",
      area: KnowledgeArea.LINGUAGENS,
      priority: PriorityLevel.ALTA,
      gainPotential: GainPotential.MUITO_ALTO,
      allocatedMinutes: 120,
    },
  ];

  return {
    weeklyTargetHours,
    totalPlannedMinutes: weeklyTargetHours * 60,
    dailySchedules,
    focusSubjects,
    activeStudyRecommendation: {
      title: "Inicie pelo Módulo de Matemática e Redação",
      details: "Disciplinas fundamentais com maior impacto na sua média geral do ENEM.",
      durationMinutes: 60,
      subject: "Matemática & Redação",
      area: KnowledgeArea.MATEMATICA,
    },
  };
}
