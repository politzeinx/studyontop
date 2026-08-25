"use client";

import Link from "next/link";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  ScanLine,
  ChevronRight,
  BarChart3,
  BookOpen,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TriEvolutionChart } from "@/components/dashboard/tri-evolution-chart";

export default function DashboardPage() {
  const areaPerformance = [
    { name: "Matemática", score: 792.4, accuracy: 82, trend: "+4.2%", color: "from-blue-500 to-cyan-500", barColor: "bg-blue-500" },
    { name: "Ciências da Natureza", score: 724.8, accuracy: 71, trend: "+2.8%", color: "from-emerald-500 to-teal-500", barColor: "bg-emerald-500" },
    { name: "Ciências Humanas", score: 745.2, accuracy: 78, trend: "-1.1%", color: "from-amber-500 to-orange-500", barColor: "bg-amber-500" },
    { name: "Linguagens e Códigos", score: 688.0, accuracy: 69, trend: "+1.5%", color: "from-purple-500 to-pink-500", barColor: "bg-purple-500" },
  ];

  const recentFocusSubjects = [
    {
      subject: "Geometria Espacial",
      subsubject: "Prismas e Cilindros",
      domain: 35,
      gainPotential: "MUITO ALTO",
      recurrence: "Alta (ENEM 2023-2025)",
      action: "Estudar 60 min",
    },
    {
      subject: "Química Orgânica",
      subsubject: "Reações e Isomeria",
      domain: 74,
      gainPotential: "ALTO",
      recurrence: "Revisão Contínua",
      action: "Revisar 12 cards",
    },
    {
      subject: "Ecologia",
      subsubject: "Ciclos Biogeoquímicos e Impactos",
      domain: 58,
      gainPotential: "ALTO",
      recurrence: "Muito Alta no ENEM Recente",
      action: "15 Questões",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Best Next Action (Recomendação Adaptativa Prioritária) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <Badge variant="default" className="text-[11px] uppercase tracking-wider font-bold">
                Recomendação Adaptativa Prioritária
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Estude <span className="gradient-text-primary">Geometria Espacial</span> por 60 minutos
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Detectamos 3 erros recentes em prismas e cilindros. Esse assunto possui{" "}
              <strong className="text-emerald-400 font-semibold">Potencial de Ganho Muito Alto</strong>{" "}
              e alta recorrência no padrão do ENEM recente (2023-2025).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/plano-estudos">
              <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Começar Agora</span>
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                <ScanLine className="w-4 h-4 text-indigo-400" />
                <span>Escanear Prova</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TRI Estimada */}
        <Card interactive className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Nota TRI Estimada</span>
            <Badge variant="cyan" className="text-[10px]">Modelo 3PL</Badge>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              748,5
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24 pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Estimativa calculada pela plataforma (não é a nota oficial).
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span>Meta de Corte:</span>
            <span className="font-semibold text-indigo-300">810,0</span>
          </div>
        </Card>

        {/* Consistência Pedagógica */}
        <Card interactive className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Índice de Consistência</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              88%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Alta coerência: 92% de acertos nas questões fáceis.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Coerência TRI</span>
              <span className="text-emerald-400 font-semibold">Excelente</span>
            </div>
            <Progress value={88} max={100} indicatorClassName="bg-emerald-500" />
          </div>
        </Card>

        {/* Revisão do Dia (Flashcards SRS) */}
        <Card interactive className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Flashcards para Hoje</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              18
              <span className="text-xs font-medium text-slate-400">cartões pendentes</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              6 Química Orgânica (Revisão Contínua) + 12 Lacunas Recentes.
            </p>
          </div>
          <Link href="/flashcards/revisar" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
              <span>Revisar Agora</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Tempo de Estudo & Plano */}
        <Card interactive className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Plano Semanal</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-white tracking-tight">
              14.5<span className="text-base font-normal text-slate-400"> / 18h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              80% da meta semanal cumprida. Faltam 3.5h.
            </p>
          </div>
          <div className="space-y-1">
            <Progress value={80} max={100} indicatorClassName="bg-amber-500" />
          </div>
        </Card>
      </div>

      {/* Recharts TRI Evolution Chart & Area Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Recharts de Evolução da TRI */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-400" />
                  Evolução da Nota TRI nos Simulados
                </CardTitle>
                <CardDescription className="text-xs">
                  Acompanhamento da proficiência latente em relação à nota de corte do seu curso
                </CardDescription>
              </div>
              <Badge variant="default" className="text-[10px]">
                +63.5 pts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <TriEvolutionChart />
          </CardContent>
        </Card>

        {/* Foco Prioritário & Potencial de Ganho */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Prioridades de Ganho
              </CardTitle>
              <CardDescription className="text-xs">
                Onde cada hora de estudo gera maior impacto na sua nota TRI
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {recentFocusSubjects.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.subject}</span>
                    <Badge
                      variant={item.gainPotential === "MUITO ALTO" ? "destructive" : "warning"}
                      className="text-[9px]"
                    >
                      Ganho {item.gainPotential}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.subsubject}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400">Domínio: <strong className="text-white">{item.domain}%</strong></span>
                    <span className="text-indigo-300 font-medium">{item.action}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>

          <Link href="/assuntos" className="block pt-3">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Explorar Mapa de 100+ Assuntos
            </Button>
          </Link>
        </Card>
      </div>

      {/* Performance by Area */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Desempenho por Grande Área do ENEM
            </CardTitle>
            <Link href="/desempenho">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-indigo-300">
                <span>Ver Detalhes</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {areaPerformance.map((area) => (
            <div
              key={area.name}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{area.name}</span>
                <span className="text-xs font-bold text-emerald-400">{area.trend}</span>
              </div>
              <div className="text-2xl font-black text-white">
                {area.score.toFixed(1)}{" "}
                <span className="text-[10px] text-slate-400 font-normal">TRI</span>
              </div>
              <Progress value={area.accuracy} max={100} indicatorClassName={area.barColor} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
