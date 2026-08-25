import { CardType, CardStage } from "@prisma/client";

export interface SeedFlashcard {
  id: string;
  subject: string;
  subsubject: string;
  cardType: CardType;
  frontContent: string;
  backContent: string;
  stage: CardStage;
  isContinuousRevision: boolean;
  intervalDays: number;
  easeFactor: number;
  stability: number;
  difficultyRating: number;
  repetitionCount: number;
  successStreak: number;
  failureCount: number;
  dueDateLabel: string;
}

export const SEED_FLASHCARDS: SeedFlashcard[] = [
  // 1. QUÍMICA ORGÂNICA (Revisão Contínua Obrigatória - Item 26 do Prompt)
  {
    id: "fc-org-01",
    subject: "Química Orgânica",
    subsubject: "Oxidação de Álcoois",
    cardType: CardType.CONCEITO,
    frontContent: "Qual é o produto final da oxidação branda/completa de um Álcool Primário?",
    backContent: "O álcool primário oxida-se primeiro a Aldeído e, subsequentemente, a Ácido Carboxílico (ex: Etanol -> Etanal -> Ácido Etanoico).",
    stage: CardStage.MANUTENCAO,
    isContinuousRevision: true,
    intervalDays: 14.0,
    easeFactor: 2.6,
    stability: 12.5,
    difficultyRating: 4.0,
    repetitionCount: 5,
    successStreak: 5,
    failureCount: 0,
    dueDateLabel: "Hoje",
  },
  {
    id: "fc-org-02",
    subject: "Química Orgânica",
    subsubject: "Oxidação de Álcoois Secundários e Terciários",
    cardType: CardType.ARMADILHAS_ENEM,
    frontContent: "Álcoois Terciários sofrem oxidação em condições brandas? O que acontece?",
    backContent: "NÃO sofrem oxidação em condições brandas, pois o carbono ligado à hidroxila não possui hidrogênio ligado a ele para ser retirado na reação.",
    stage: CardStage.MANUTENCAO,
    isContinuousRevision: true,
    intervalDays: 21.0,
    easeFactor: 2.7,
    stability: 18.0,
    difficultyRating: 3.5,
    repetitionCount: 6,
    successStreak: 6,
    failureCount: 0,
    dueDateLabel: "Hoje",
  },

  // 2. MATEMÁTICA - GEOMETRIA ESPACIAL (Lacuna de Baixo Domínio)
  {
    id: "fc-mat-01",
    subject: "Geometria Espacial",
    subsubject: "Razão de Semelhança Volumétrica",
    cardType: CardType.FORMULA,
    frontContent: "Se dois sólidos geométricos tridimensionais têm razão de semelhança linear 'k', qual é a razão entre suas áreas e entre seus volumes?",
    backContent: "Razão entre comprimentos lineares: k\nRazão entre áreas: k²\nRazão entre volumes: k³ (V₁ / V₂ = k³)",
    stage: CardStage.APRENDENDO,
    isContinuousRevision: false,
    intervalDays: 1.0,
    easeFactor: 2.4,
    stability: 1.5,
    difficultyRating: 6.5,
    repetitionCount: 1,
    successStreak: 1,
    failureCount: 1,
    dueDateLabel: "Hoje",
  },
  {
    id: "fc-mat-02",
    subject: "Geometria Espacial",
    subsubject: "Volume de Cilindros e Conversão",
    cardType: CardType.APLICACAO,
    frontContent: "Como converter rapidamente volume calculado em cm³ para Litros e mililitros (mL)?",
    backContent: "• 1 cm³ = 1 mL\n• 1.000 cm³ = 1.000 mL = 1 Litro (1 L)\n• 1 m³ = 1.000 Litros",
    stage: CardStage.CONSOLIDANDO,
    isContinuousRevision: false,
    intervalDays: 3.0,
    easeFactor: 2.5,
    stability: 3.2,
    difficultyRating: 4.8,
    repetitionCount: 2,
    successStreak: 2,
    failureCount: 0,
    dueDateLabel: "Hoje",
  },

  // 3. FÍSICA - TERMODINÂMICA (Erro Recente)
  {
    id: "fc-fis-01",
    subject: "Termodinâmica",
    subsubject: "Rendimento de Carnot",
    cardType: CardType.FORMULA,
    frontContent: "Qual é a fórmula do Rendimento Máximo de Carnot e qual a regra obrigatória para as temperaturas?",
    backContent: "η = 1 - (T_fria / T_quente)\nATENÇÃO: As temperaturas T_fria e T_quente DEVEM estar obrigatoriamente na escala Kelvin (K = °C + 273).",
    stage: CardStage.APRENDENDO,
    isContinuousRevision: true,
    intervalDays: 1.0,
    easeFactor: 2.3,
    stability: 1.2,
    difficultyRating: 7.0,
    repetitionCount: 1,
    successStreak: 1,
    failureCount: 2,
    dueDateLabel: "Hoje",
  },

  // 4. BIOLOGIA - ECOLOGIA (ENEM Recente)
  {
    id: "fc-bio-01",
    subject: "Ecologia",
    subsubject: "Eutrofização",
    cardType: CardType.IDENTIFICACAO,
    frontContent: "Qual é a ordem cronológica das etapas da Eutrofização artificial?",
    backContent: "1. Excesso de N e P (esgoto/fertilizantes)\n2. Proliferação de algas superficiais (floração)\n3. Bloqueio da luz solar e morte da vegetação de fundo\n4. Proliferação de decompositores aeróbios com consumo total de O₂ (anóxia)\n5. Morte dos peixes e decomposição anaeróbia.",
    stage: CardStage.CONSOLIDANDO,
    isContinuousRevision: false,
    intervalDays: 4.0,
    easeFactor: 2.5,
    stability: 4.5,
    difficultyRating: 5.0,
    repetitionCount: 3,
    successStreak: 3,
    failureCount: 0,
    dueDateLabel: "Hoje",
  },
];
