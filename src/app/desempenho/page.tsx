"use client";

import {
  LineChart,
  TrendingUp,
  ShieldCheck,
  Award,
  BarChart2,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export default function DesempenhoPage() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <LineChart className="w-6 h-6 text-indigo-400" />
          Desempenho Geral & Modelagem TRI (3PL)
        </h1>
        <p className="text-sm text-slate-400">
          Acompanhamento estatístico da proficiência, consistência pedagógica e evolução por área
        </p>
      </div>

      {/* TRI Disclaimer Alert as required by Master Prompt item 7 & 42 */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong>Nota de Transparência Metodológica:</strong> As notas TRI exibidas nesta seção são 
          <strong className="text-indigo-300"> estimativas próprias calculadas pela plataforma </strong>
          através do modelo logístico 3PL (parâmetros de discriminação, dificuldade e acerto casual). Não representam a nota oficial final divulgada pelo INEP.
        </p>
      </div>

      {/* Grid of Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Nota Média Geral Estimada</span>
          <div className="text-3xl font-black text-white my-2">
            {isDemo ? "748,5" : "---"}
          </div>
          <p className={`text-xs font-medium ${isDemo ? "text-emerald-400" : "text-slate-400"}`}>
            {isDemo ? "+24 pontos desde o último mês" : "Calibrando... Realize seu 1º simulado"}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Consistência de Resposta</span>
          <div className="text-3xl font-black text-emerald-400 my-2">
            {isDemo ? "88%" : "100%"}
          </div>
          <p className="text-xs text-slate-400">
            {isDemo ? "Padrão coerente (sem distorções de chute em fáceis)" : "Aguardando primeiro teste"}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Simulados Realizados</span>
          <div className="text-3xl font-black text-indigo-400 my-2">
            {isDemo ? "12" : "0"}
          </div>
          <p className="text-xs text-slate-400">
            {isDemo ? "540 questões resolvidas e catalogadas" : "0 questões resolvidas até o momento"}
          </p>
        </Card>
      </div>
    </div>
  );
}
