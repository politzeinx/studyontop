/**
 * Motor TRI (Teoria de Resposta ao Item) - Modelo Logístico 3 Parâmetros (3PL)
 * 
 * Implementação matemática da TRI para estimativa da proficiência (theta) no padrão ENEM.
 * 
 * Fórmula 3PL:
 * P_i(theta) = c_i + (1 - c_i) / (1 + exp(-D * a_i * (theta - b_i)))
 * Onde:
 * - theta: Proficiência latente do aluno (escala padronizada, média ~ 0, desvio ~ 1)
 * - a_i: Parâmetro de Discriminação do item (capacidade de diferenciar níveis de habilidade)
 * - b_i: Parâmetro de Dificuldade do item
 * - c_i: Parâmetro de Acerto Casual (probabilidade de acerto ao acaso / chute)
 * - D = 1.7 (fator de escala de aproximação para a ogiva normal)
 */

export const D_FACTOR = 1.7;

export interface TriItemParams {
  id?: string;
  a: number; // Discriminação (ex: 0.8 a 2.5)
  b: number; // Dificuldade (escala theta: ex: -2.5 a +2.5)
  c: number; // Acerto Casual (ex: 0.15 a 0.25 para 5 alternativas)
  hasOfficialTri?: boolean;
}

export interface StudentItemResponse {
  questionId: string;
  isCorrect: boolean;
  isBlank?: boolean;
  isCancelled?: boolean;
  triParams?: TriItemParams;
  difficulty?: "FACIL" | "MEDIA" | "DIFICIL";
}

export interface TriEstimationResult {
  theta: number; // Proficiência na escala latente (-4.0 a +4.0)
  standardError: number; // Erro padrão da estimativa (SE)
  enemScaleScore: number; // Nota convertida para a régua do ENEM (ex: 748.5)
  hasOfficialParams: boolean; // Se todas as questões tinham parâmetros calibrados pelo INEP
  isPlatformEstimate: boolean; // Sempre true para deixar clara a estimativa própria
  accuracyPercentage: number;
  totalValidItems: number;
  correctCount: number;
}

/**
 * Calcula a probabilidade de acerto P_i(theta) pelo modelo 3PL
 */
export function calculateProbability3PL(
  theta: number,
  a: number,
  b: number,
  c: number
): number {
  // Limites de segurança para evitar underflow/overflow numérico
  const expArg = -D_FACTOR * a * (theta - b);
  const clampedExpArg = Math.max(Math.min(expArg, 40), -40);
  const logistic = 1 / (1 + Math.exp(clampedExpArg));
  return c + (1 - c) * logistic;
}

/**
 * Função de Informação do Item (IIF): I_i(theta)
 */
export function calculateItemInformation(
  theta: number,
  a: number,
  b: number,
  c: number
): number {
  const p = calculateProbability3PL(theta, a, b, c);
  const q = 1 - p;
  if (p <= 0 || q <= 0 || p === c) return 0;

  const numerator = Math.pow(D_FACTOR * a, 2) * Math.pow(p - c, 2) * q;
  const denominator = Math.pow(1 - c, 2) * p;
  return numerator / denominator;
}

/**
 * Fornece parâmetros de fallback baseados na dificuldade pedagógica caso o item não possua TRI oficial
 */
export function getFallbackTriParams(difficulty?: "FACIL" | "MEDIA" | "DIFICIL"): TriItemParams {
  switch (difficulty) {
    case "FACIL":
      return { a: 1.1, b: -1.2, c: 0.2, hasOfficialTri: false };
    case "DIFICIL":
      return { a: 1.5, b: 1.4, c: 0.2, hasOfficialTri: false };
    case "MEDIA":
    default:
      return { a: 1.3, b: 0.1, c: 0.2, hasOfficialTri: false };
  }
}

/**
 * Estimação de Proficiência por EAP (Expected A Posteriori / Bayesiana)
 * Utiliza quadratura de Gauss-Hermite com prior Normal Padrão N(0, 1).
 * Método extremamente estável para provas do ENEM, mesmo com 0 acertos ou acerto total.
 */
export function estimateThetaEAP(
  responses: StudentItemResponse[],
  quadraturePoints = 61,
  minTheta = -4.0,
  maxTheta = 4.0
): { theta: number; standardError: number; hasOfficialParams: boolean } {
  // Filtra questões anuladas
  const validResponses = responses.filter((r) => !r.isCancelled);

  if (validResponses.length === 0) {
    return { theta: 0.0, standardError: 1.0, hasOfficialParams: false };
  }

  let hasAllOfficial = true;

  // Prepara itens com parâmetros válidos
  const items = validResponses.map((r) => {
    if (r.triParams && r.triParams.hasOfficialTri !== false) {
      return { isCorrect: r.isCorrect, ...r.triParams };
    }
    hasAllOfficial = false;
    const fallback = getFallbackTriParams(r.difficulty);
    return { isCorrect: r.isCorrect, ...fallback };
  });

  // Geração dos pontos de quadratura
  const step = (maxTheta - minTheta) / (quadraturePoints - 1);
  const thetas: number[] = [];
  const priors: number[] = [];

  for (let i = 0; i < quadraturePoints; i++) {
    const th = minTheta + i * step;
    thetas.push(th);
    // Prior normal padrão: exp(-th^2 / 2) / sqrt(2 * PI)
    const prior = Math.exp(-0.5 * th * th) / Math.sqrt(2 * Math.PI);
    priors.push(prior);
  }

  // Calcula verossimilhança L(theta) para cada ponto
  const posteriors: number[] = [];
  let totalPosterior = 0;

  for (let i = 0; i < quadraturePoints; i++) {
    const th = thetas[i];
    let logLikelihood = 0;

    for (const item of items) {
      const p = calculateProbability3PL(th, item.a, item.b, item.c);
      const prob = item.isCorrect ? Math.max(p, 1e-12) : Math.max(1 - p, 1e-12);
      logLikelihood += Math.log(prob);
    }

    // Likelihood ponderada pela prior
    const likelihood = Math.exp(logLikelihood);
    const post = likelihood * priors[i];
    posteriors.push(post);
    totalPosterior += post;
  }

  // Se a verossimilhança foi muito pequena (underflow), normaliza
  if (totalPosterior <= 0 || isNaN(totalPosterior)) {
    // Estimativa por proporção de acertos de contingência
    const correctCount = items.filter((it) => it.isCorrect).length;
    const prop = correctCount / items.length;
    const approxTheta = (prop - 0.5) * 4.0;
    return { theta: approxTheta, standardError: 0.6, hasOfficialParams: hasAllOfficial };
  }

  // Média A Posteriori (EAP): E[theta] = sum(theta * post) / sum(post)
  let expectedTheta = 0;
  for (let i = 0; i < quadraturePoints; i++) {
    expectedTheta += thetas[i] * (posteriors[i] / totalPosterior);
  }

  // Variância A Posteriori: Var[theta] = sum((theta - E[theta])^2 * post) / sum(post)
  let varianceTheta = 0;
  for (let i = 0; i < quadraturePoints; i++) {
    varianceTheta += Math.pow(thetas[i] - expectedTheta, 2) * (posteriors[i] / totalPosterior);
  }

  const standardError = Math.sqrt(Math.max(varianceTheta, 0.04));

  return {
    theta: expectedTheta,
    standardError,
    hasOfficialParams: hasAllOfficial,
  };
}

/**
 * Transforma a proficiência latente (theta) para a escala ENEM (Média 500, Desvio 100)
 * Calibrada por área do conhecimento quando especificado.
 */
export function convertThetaToEnemScale(
  theta: number,
  area: "MATEMATICA" | "NATUREZA" | "HUMANAS" | "LINGUAGENS" = "MATEMATICA"
): number {
  // Parâmetros de centralização e desvio médio por área do ENEM histórico
  const areaScaleConfigs = {
    MATEMATICA: { mean: 520, sd: 110, min: 320, max: 980 },
    NATUREZA: { mean: 495, sd: 85, min: 310, max: 860 },
    HUMANAS: { mean: 515, sd: 80, min: 330, max: 840 },
    LINGUAGENS: { mean: 505, sd: 75, min: 320, max: 820 },
  };

  const config = areaScaleConfigs[area] || { mean: 500, sd: 100, min: 300, max: 950 };
  let rawScore = config.mean + theta * config.sd;

  // Clampa aos limites reais observados no exame
  rawScore = Math.max(Math.min(rawScore, config.max), config.min);

  // Arredonda para 1 casa decimal (ex: 748.5)
  return Math.round(rawScore * 10) / 10;
}

/**
 * Função principal de cálculo da TRI para uma lista de respostas de simulado
 */
export function calculateSimulationTRI(
  responses: StudentItemResponse[],
  area: "MATEMATICA" | "NATUREZA" | "HUMANAS" | "LINGUAGENS" = "MATEMATICA"
): TriEstimationResult {
  const validResponses = responses.filter((r) => !r.isCancelled);
  const correctCount = validResponses.filter((r) => r.isCorrect).length;
  const totalValid = validResponses.length;
  const accuracyPercentage = totalValid > 0 ? (correctCount / totalValid) * 100 : 0;

  const { theta, standardError, hasOfficialParams } = estimateThetaEAP(validResponses);
  const enemScaleScore = convertThetaToEnemScale(theta, area);

  return {
    theta,
    standardError,
    enemScaleScore,
    hasOfficialParams,
    isPlatformEstimate: true, // Garante que nunca é confundido com nota oficial final do INEP
    accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
    totalValidItems: totalValid,
    correctCount,
  };
}
