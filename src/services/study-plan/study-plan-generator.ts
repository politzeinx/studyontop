import { KnowledgeArea, PriorityLevel, GainPotential } from "@prisma/client";
import { DailySchedule, StudyBlock } from "@/types";
import { SubjectDomainInput } from "@/lib/recommendations/priority-engine";

export type PlanGenerationStrategy = "SISU_WEIGHTS" | "ERROR_GAPS" | "CUSTOM";

export interface CourseSisuWeights {
  courseName: string;
  weights: {
    MATEMATICA: number;
    NATUREZA: number;
    HUMANAS: number;
    LINGUAGENS: number;
    REDACAO: number;
  };
  explanation: string;
}

export function getCourseSisuWeights(course: string): CourseSisuWeights {
  const norm = course.toLowerCase().trim();

  if (
    norm.includes("computa") ||
    norm.includes("software") ||
    norm.includes("engenharia") ||
    norm.includes("dados") ||
    norm.includes("sistemas")
  ) {
    return {
      courseName: course || "Engenharia de Software",
      weights: {
        MATEMATICA: 4,
        NATUREZA: 3,
        REDACAO: 3,
        LINGUAGENS: 2,
        HUMANAS: 1,
      },
      explanation:
        "Foco máximo em Matemática e Natureza (cálculo de áreas, funções e mecânica), com peso 4 no SISU para cursos de Exatas/Tecnologia.",
    };
  }

  if (
    norm.includes("medicina") ||
    norm.includes("odonto") ||
    norm.includes("enfermagem") ||
    norm.includes("biomedicina") ||
    norm.includes("farmacia")
  ) {
    return {
      courseName: course || "Medicina",
      weights: {
        NATUREZA: 4,
        REDACAO: 3,
        MATEMATICA: 3,
        LINGUAGENS: 2,
        HUMANAS: 1,
      },
      explanation:
        "Foco prioritário em Ciências da Natureza (Biologia, Química e Física) com peso 4, além de Redação nota 900+ para atingir a nota de corte.",
    };
  }

  if (
    norm.includes("direito") ||
    norm.includes("relações") ||
    norm.includes("historia") ||
    norm.includes("jornalismo") ||
    norm.includes("psicologia")
  ) {
    return {
      courseName: course || "Direito",
      weights: {
        HUMANAS: 4,
        REDACAO: 4,
        LINGUAGENS: 3,
        MATEMATICA: 1,
        NATUREZA: 1,
      },
      explanation:
        "Foco intensivo em Ciências Humanas, Linguagens e Redação com peso 4 no SISU, essenciais para cursos de Humanidades e Direito.",
    };
  }

  if (
    norm.includes("administra") ||
    norm.includes("economia") ||
    norm.includes("contab")
  ) {
    return {
      courseName: course || "Administração / Economia",
      weights: {
        MATEMATICA: 3,
        REDACAO: 3,
        HUMANAS: 3,
        LINGUAGENS: 2,
        NATUREZA: 1,
      },
      explanation:
        "Equilíbrio estratégico entre Matemática Financeira/Estatística, Redação e Ciências Humanas para o SISU.",
    };
  }

  // Padrão Geral
  return {
    courseName: course || "Geral ENEM",
    weights: {
      MATEMATICA: 3,
      NATUREZA: 3,
      REDACAO: 3,
      LINGUAGENS: 2,
      HUMANAS: 2,
    },
    explanation:
      "Distribuição balanceada entre as 4 áreas do conhecimento e Redação para maximizar sua média geral no ENEM.",
  };
}

export interface UserStudyConfig {
  studyHoursPerDay: number; // Ex: 3.0
  studyDaysPerWeek: number; // Ex: 5, 6 ou 7
  targetCourse: string; // Ex: Engenharia de Software
  strategy?: PlanGenerationStrategy; // "SISU_WEIGHTS" | "ERROR_GAPS" | "CUSTOM"
  customBlocks?: Record<string, StudyBlock[]>; // Dia -> Blocos customizados
}

export interface GeneratedStudyPlanResult {
  strategy: PlanGenerationStrategy;
  sisuWeights: CourseSisuWeights;
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
 * Gera cronograma semanal adaptativo baseado em Pesos SISU, Banco de Erros ou Personalizado
 */
export function generateAdaptiveStudyPlan(
  config: UserStudyConfig,
  domainInputs: SubjectDomainInput[] = [],
  isDemoMode: boolean = false
): GeneratedStudyPlanResult {
  const {
    studyHoursPerDay = 3.0,
    studyDaysPerWeek = 7,
    targetCourse = "Engenharia de Software",
    strategy = "SISU_WEIGHTS",
    customBlocks = {},
  } = config;

  const clampedDays = Math.min(Math.max(studyDaysPerWeek, 1), 7);
  const weeklyTargetHours = studyHoursPerDay * clampedDays;
  const dailyTargetMinutes = Math.round(studyHoursPerDay * 60);
  const sisuWeights = getCourseSisuWeights(targetCourse);

  const allDaysOfWeek: Array<DailySchedule["dayOfWeek"]> = [
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
    "DOMINGO",
  ];

  // Matriz de matérias adaptada conforme a estratégia
  let syllabusByDay: Array<{
    mainSubject: string;
    mainArea: KnowledgeArea;
    mainReason: string;
    secSubject: string;
    secArea: KnowledgeArea;
    secReason: string;
  }> = [];

  if (strategy === "ERROR_GAPS") {
    // Modo 2: Foco em Erros & Lacunas TRI
    syllabusByDay = [
      {
        mainSubject: "Matemática: Geometria Espacial (Maior Taxa de Erros Recentes)",
        mainArea: KnowledgeArea.MATEMATICA,
        mainReason: "Taxonomia: Erro Conceitual e Cálculo. Alto ganho TRI.",
        secSubject: "Química Orgânica: Reações e Isomeria",
        secArea: KnowledgeArea.NATUREZA,
        secReason: "Recuperação de lacunas conceituais identificadas no simulado.",
      },
      {
        mainSubject: "Física: Eletrodinâmica e Circuitos Elétricos",
        mainArea: KnowledgeArea.NATUREZA,
        mainReason: "Dificuldade na interpretação de associação de resistores.",
        secSubject: "Redação: Competência 3 (Projeto de Texto e Argumentação)",
        secArea: KnowledgeArea.LINGUAGENS,
        secReason: "Treino focado nos critérios de pontuação da banca.",
      },
      {
        mainSubject: "Biologia: Genética Mendeliana e Biotecnologia",
        mainArea: KnowledgeArea.NATUREZA,
        mainReason: "Assunto com alto índice de pegadinhas e alternativas distratoras.",
        secSubject: "História: Era Vargas e Ditadura Militar",
        secArea: KnowledgeArea.HUMANAS,
        secReason: "Interpretação de fontes históricas e contextualização.",
      },
      {
        mainSubject: "Matemática: Funções Trigonométricas e Logaritmos",
        mainArea: KnowledgeArea.MATEMATICA,
        mainReason: "Superação de dúvidas em modelos matemáticos aplicados.",
        secSubject: "Geografia: Cartografia e Dinâmica Demográfica",
        secArea: KnowledgeArea.HUMANAS,
        secReason: "Análise de pirâmides etárias e gráficos.",
      },
      {
        mainSubject: "Linguagens: Estratégias Rápidas para Textos Longos",
        mainArea: KnowledgeArea.LINGUAGENS,
        mainReason: "Taxonomia: Gestão de Tempo de Prova no Dia 1.",
        secSubject: "Filosofia: Contratualismo e Iluminismo",
        secArea: KnowledgeArea.HUMANAS,
        secReason: "Conceitos fundamentais para embasamento de redação.",
      },
      {
        mainSubject: "Simulado Diagnóstico de Superação de Erros",
        mainArea: KnowledgeArea.MATEMATICA,
        mainReason: "Re-teste prático das questões erradas com nova calibração TRI.",
        secSubject: "",
        secArea: KnowledgeArea.MATEMATICA,
        secReason: "",
      },
      {
        mainSubject: "Revisão Geral e Fechamento do Caderno de Erros",
        mainArea: KnowledgeArea.NATUREZA,
        mainReason: "Fixação definitiva dos pontos superados na semana.",
        secSubject: "Flashcards de Repetição Espaçada",
        secArea: KnowledgeArea.NATUREZA,
        secReason: "Consolidação de fórmulas e conceitos na memória.",
      },
    ];
  } else {
    // Modo 1: SISU Weights (adaptado dinamicamente para Exatas, Saúde ou Humanas)
    const isExatas = sisuWeights.weights.MATEMATICA >= 4;
    const isSaude = sisuWeights.weights.NATUREZA >= 4;
    const isHumanas = sisuWeights.weights.HUMANAS >= 4;

    syllabusByDay = [
      {
        mainSubject: isExatas
          ? "Matemática (Álgebra, Funções e Proporcionalidade - Peso 4 SISU)"
          : isSaude
          ? "Química (Equilíbrio Químico e Soluções - Peso 4 SISU)"
          : "História (Brasil República e Cidadania - Peso 4 SISU)",
        mainArea: isExatas
          ? KnowledgeArea.MATEMATICA
          : isSaude
          ? KnowledgeArea.NATUREZA
          : KnowledgeArea.HUMANAS,
        mainReason: `Área de maior peso (${isExatas ? "Matemática" : isSaude ? "Natureza" : "Humanas"}) para ${targetCourse}.`,
        secSubject: "Redação (Estrutura Dissertativa e Repertório Sociocultural)",
        secArea: KnowledgeArea.LINGUAGENS,
        secReason: "Manter nota 900+ essencial para a nota de corte.",
      },
      {
        mainSubject: isExatas
          ? "Física (Cinemática, Dinâmica e Energia - Peso 3 SISU)"
          : isSaude
          ? "Biologia (Ecologia, Citologia e Fisiologia Humana - Peso 4 SISU)"
          : "Filosofia e Sociologia (Teoria Política e Cidadania)",
        mainArea: isHumanas ? KnowledgeArea.HUMANAS : KnowledgeArea.NATUREZA,
        mainReason: "Conteúdo prioritário com altíssima incidência no ENEM.",
        secSubject: isExatas
          ? "Química (Termoquímica e Eletroquímica)"
          : isSaude
          ? "Física (Óptica e Ondulatória)"
          : "Linguagens (Interpretação e Semiótica)",
        secArea: isHumanas ? KnowledgeArea.LINGUAGENS : KnowledgeArea.NATUREZA,
        secReason: "Base indispensável para garantir pontos consistentes na TRI.",
      },
      {
        mainSubject: isExatas
          ? "Matemática (Geometria Plana, Espacial e Trigonometria - Peso 4)"
          : isSaude
          ? "Biologia (Genética e Biotecnologia - Peso 4 SISU)"
          : "Geografia (Espaço Urbano, Agrário e Geopolítica - Peso 4)",
        mainArea: isExatas
          ? KnowledgeArea.MATEMATICA
          : isSaude
          ? KnowledgeArea.NATUREZA
          : KnowledgeArea.HUMANAS,
        mainReason: `Alinhado com os pesos de ${targetCourse} no SISU.`,
        secSubject: "História e Geografia Integrada",
        secArea: KnowledgeArea.HUMANAS,
        secReason: "Interpretação socioespacial e histórica.",
      },
      {
        mainSubject: isExatas
          ? "Física (Eletromagnetismo e Circuitos Elétricos)"
          : isSaude
          ? "Química (Química Orgânica e Reações Biológicas)"
          : "Redação (Treino Prático de Proposta de Intervenção - D5)",
        mainArea: isExatas
          ? KnowledgeArea.NATUREZA
          : isSaude
          ? KnowledgeArea.NATUREZA
          : KnowledgeArea.LINGUAGENS,
        mainReason: "Domínio de competências críticas para a nota final.",
        secSubject: "Matemática Aplicada (Estatística e Probabilidade)",
        secArea: KnowledgeArea.MATEMATICA,
        secReason: "Questões garantidas e fáceis na régua da TRI.",
      },
      {
        mainSubject: "Linguagens (Interpretação Textual, Gêneros e Variação)",
        mainArea: KnowledgeArea.LINGUAGENS,
        mainReason: "Velocidade de leitura e interpretação sem cansaço.",
        secSubject: "Filosofia, Sociologia e Artes",
        secArea: KnowledgeArea.HUMANAS,
        secReason: "Repertório produtivo para a Redação e Humanas.",
      },
      {
        mainSubject: "Simulado Semanal / Treino de Ritmo e TRI",
        mainArea: KnowledgeArea.MATEMATICA,
        mainReason: "Simulação realista de tempo de prova e calibração estatística.",
        secSubject: "",
        secArea: KnowledgeArea.MATEMATICA,
        secReason: "",
      },
      {
        mainSubject: "Treino Prático de Questões Contemporâneas (ENEM Recente)",
        mainArea: KnowledgeArea.MATEMATICA,
        mainReason: "Resolução de itens no padrão mais atual do ENEM.",
        secSubject: "Revisão e Fechamento Semanal",
        secArea: KnowledgeArea.NATUREZA,
        secReason: "Fixação e autoavaliação do progresso semanal.",
      },
    ];
  }

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

    // Se o usuário estiver no modo CUSTOM e tiver blocos próprios salvos para esse dia
    if (strategy === "CUSTOM" && customBlocks[dayName] && customBlocks[dayName].length > 0) {
      const userCustom = customBlocks[dayName];
      const customTotalMinutes = userCustom.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
      dailySchedules.push({
        dayOfWeek: dayName,
        date: `Dia ${idx + 1}`,
        totalPlannedHours: Math.round((customTotalMinutes / 60) * 10) / 10,
        blocks: userCustom,
      });
      continue;
    }

    const blocks: StudyBlock[] = [];
    let remainingMinutes = dailyTargetMinutes;

    // 1. Bloco de Revisão Diária de Flashcards (20 min)
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

    const daySyllabus = syllabusByDay[idx] || syllabusByDay[0];

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
      subject: sisuWeights.weights.MATEMATICA >= 4 ? "Matemática e Funções (Peso 4)" : "Ciências da Natureza",
      area: sisuWeights.weights.MATEMATICA >= 4 ? KnowledgeArea.MATEMATICA : KnowledgeArea.NATUREZA,
      priority: PriorityLevel.MUITO_ALTA,
      gainPotential: GainPotential.MUITO_ALTO,
      allocatedMinutes: 180,
    },
    {
      subject: "Redação Estruturada 900+",
      area: KnowledgeArea.LINGUAGENS,
      priority: PriorityLevel.ALTA,
      gainPotential: GainPotential.MUITO_ALTO,
      allocatedMinutes: 140,
    },
    {
      subject: "Treino Prático de Questões Recentes",
      area: KnowledgeArea.MATEMATICA,
      priority: PriorityLevel.ALTA,
      gainPotential: GainPotential.ALTO,
      allocatedMinutes: 120,
    },
  ];

  return {
    strategy,
    sisuWeights,
    weeklyTargetHours,
    totalPlannedMinutes: weeklyTargetHours * 60,
    dailySchedules,
    focusSubjects,
    activeStudyRecommendation: {
      title: `Plano Calibrado para ${targetCourse}`,
      details: sisuWeights.explanation,
      durationMinutes: 60,
      subject: sisuWeights.courseName,
      area: KnowledgeArea.MATEMATICA,
    },
  };
}
