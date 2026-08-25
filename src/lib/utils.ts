import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para mesclar classes Tailwind de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valores numéricos para porcentagem amigável
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata notas TRI no padrão ENEM (ex: 742,8)
 */
export function formatTriScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) {
    return "--";
  }
  return score.toFixed(1).replace(".", ",");
}

/**
 * Formata durações em segundos/minutos para formato legível (ex: 1h 45min)
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Retorna cor de badge/status baseado no nível de domínio
 */
export function getDomainLevelConfig(level: "ALTO" | "MEDIO" | "ATENCAO" | "PRIORIDADE") {
  switch (level) {
    case "ALTO":
      return { label: "Domínio Alto", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    case "MEDIO":
      return { label: "Domínio Médio", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    case "ATENCAO":
      return { label: "Atenção", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    case "PRIORIDADE":
      return { label: "Prioridade Máxima", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
  }
}

/**
 * Retorna cor e label para tipos de erros
 */
export function getErrorTaxonomyConfig(taxonomy: string) {
  const map: Record<string, { label: string; color: string }> = {
    FALTA_CONHECIMENTO: { label: "Falta de Conhecimento", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    ERRO_CONCEITUAL: { label: "Erro Conceitual", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    INTERPRETACAO: { label: "Interpretação", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    CALCULO: { label: "Cálculo", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    ATENCAO: { label: "Atenção / Distração", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    CONFUSAO_ALTERNATIVAS: { label: "Confusão de Alternativas", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    ESTRATEGIA: { label: "Estratégia de Prova", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    TEMPO: { label: "Gestão do Tempo", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  };
  return map[taxonomy] || { label: taxonomy, color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" };
}
