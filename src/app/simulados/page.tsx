"use client";

import Link from "next/link";
import { Plus, FileCheck2, Sparkles, Filter, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SimuladosPage() {
  const previousSimulations = [
    {
      id: "sim-1",
      title: "Simulado Estilo ENEM Recente 2024 — Dia 2 (Natureza e Matemática)",
      date: "Ontem às 16:30",
      totalQuestions: 90,
      correctCount: 71,
      estimatedTri: 748.5,
      consistency: "Alta (89%)",
      status: "CONCLUIDO",
    },
    {
      id: "sim-2",
      title: "Simulado Adaptativo — Foco em Fraquezas (Física & Geometria)",
      date: "21/08/2026",
      totalQuestions: 30,
      correctCount: 22,
      estimatedTri: 715.0,
      consistency: "Média (78%)",
      status: "CONCLUIDO",
    },
    {
      id: "sim-3",
      title: "ENEM 2023 Oficial — Aplicação Regular",
      date: "14/08/2026",
      totalQuestions: 45,
      correctCount: 38,
      estimatedTri: 780.2,
      consistency: "Muito Alta (94%)",
      status: "CONCLUIDO",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central de Simulados
          </h1>
          <p className="text-sm text-slate-400">
            Pratique com questões calibradas, gere diagnósticos TRI e descubra suas lacunas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/simulados/enviar">
            <Button variant="outline" size="default" className="text-xs sm:text-sm">
              Enviar Gabarito/Prova
            </Button>
          </Link>
          <Link href="/simulados/novo">
            <Button variant="primary" size="default" className="gap-2 text-xs sm:text-sm">
              <Plus className="w-4 h-4" />
              <span>Gerar Novo Simulado</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Select Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card interactive className="p-5 border-indigo-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Simulado ENEM Recente</h3>
              <p className="text-[11px] text-slate-400">Padrão calibrado 2023-2025</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Reproduz estatisticamente a distribuição de competências, gráficos e interdisciplinaridade dos anos recentes.
          </p>
          <Link href="/simulados/novo?type=ENEM_RECENTE">
            <Button variant="default" size="sm" className="w-full text-xs">
              Iniciar Simulado Recente (45q)
            </Button>
          </Link>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Simulado Adaptativo</h3>
              <p className="text-[11px] text-slate-400">Focado nos seus pontos fracos</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Seleciona questões sob medida para elevar seu mapa de domínio nas áreas com maior potencial de ganho.
          </p>
          <Link href="/simulados/novo?type=ADAPTATIVO">
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Configurar Adaptativo
            </Button>
          </Link>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Edições Oficiais</h3>
              <p className="text-[11px] text-slate-400">Provas oficiais completas</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Faça edições anteriores completas com régua TRI oficial e comparação histórica.
          </p>
          <Link href="/simulados/novo?type=OFICIAL">
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Escolher Ano Oficial
            </Button>
          </Link>
        </Card>
      </div>

      {/* Previous Simulations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Simulados Realizados</CardTitle>
          <CardDescription>
            Acompanhe o diagnóstico e o recálculo automático da sua TRI e mapa de domínio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {previousSimulations.map((sim) => (
            <div
              key={sim.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{sim.title}</h4>
                  <Badge variant="success" className="text-[10px]">
                    {sim.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{sim.date}</span>
                  <span>•</span>
                  <span>
                    Acertos: <strong className="text-white">{sim.correctCount}/{sim.totalQuestions}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Consistência: <strong className="text-emerald-400">{sim.consistency}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">TRI Estimada</span>
                  <span className="text-base font-extrabold text-indigo-400">
                    {sim.estimatedTri.toFixed(1)}
                  </span>
                </div>
                <Link href={`/simulados/${sim.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Ver Relatório
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
