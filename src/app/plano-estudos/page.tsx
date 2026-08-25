"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  FileCheck2,
  Sliders,
  Check,
  Flame,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateAdaptiveStudyPlan } from "@/services/study-plan/study-plan-generator";
import { KnowledgeArea, PriorityLevel, GainPotential, DomainLevel } from "@/types";
import { useAuth } from "@/context/auth-context";

export default function PlanoEstudosPage() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());

  const studyHoursPerDay = user?.studyHoursPerDay || 3.0;
  const studyDaysPerWeek = user?.studyDaysPerWeek || 6;
  const targetCourse = user?.targetCourse || "Engenharia de Software";

  // Gera o plano adaptativo conforme perfil real ou demo
  const domainInputs = isDemo
    ? [
        {
          subject: "Geometria Espacial",
          subsubject: "Prismas e Cilindros",
          area: KnowledgeArea.MATEMATICA,
          domainScore: 35,
          accuracyRate: 44,
          totalQuestions: 18,
          recentErrorsCount: 3,
          recurrenceScoreEnemRecent: 0.9,
        },
        {
          subject: "Termodinâmica",
          subsubject: "Ciclo de Carnot",
          area: KnowledgeArea.NATUREZA,
          domainScore: 48,
          accuracyRate: 50,
          totalQuestions: 14,
          recentErrorsCount: 2,
          recurrenceScoreEnemRecent: 0.8,
          isContinuousRevision: true,
        },
        {
          subject: "Química Orgânica",
          subsubject: "Reações e Isomeria",
          area: KnowledgeArea.NATUREZA,
          domainScore: 74,
          accuracyRate: 83,
          totalQuestions: 24,
          recentErrorsCount: 1,
          recurrenceScoreEnemRecent: 0.95,
          isContinuousRevision: true,
        },
      ]
    : [
        {
          subject: "Simulado Diagnóstico Inicial",
          subsubject: "Nivelamento Geral ENEM",
          area: KnowledgeArea.MATEMATICA,
          domainScore: 0,
          accuracyRate: 0,
          totalQuestions: 0,
          recentErrorsCount: 0,
          recurrenceScoreEnemRecent: 1.0,
        },
        {
          subject: "Matemática Básica & Funções",
          subsubject: "Fundamentos para o ENEM",
          area: KnowledgeArea.MATEMATICA,
          domainScore: 0,
          accuracyRate: 0,
          totalQuestions: 0,
          recentErrorsCount: 0,
          recurrenceScoreEnemRecent: 0.95,
        },
        {
          subject: "Ciências da Natureza",
          subsubject: "Ecologia e Termologia",
          area: KnowledgeArea.NATUREZA,
          domainScore: 0,
          accuracyRate: 0,
          totalQuestions: 0,
          recentErrorsCount: 0,
          recurrenceScoreEnemRecent: 0.9,
        },
      ];

  const plan = generateAdaptiveStudyPlan(
    {
      studyHoursPerDay,
      studyDaysPerWeek,
      targetCourse,
    },
    domainInputs
  );

  const currentSchedule = plan.dailySchedules[selectedDayIdx] || plan.dailySchedules[0];

  const toggleBlockCompleted = (blockId: string) => {
    const next = new Set(completedBlockIds);
    if (next.has(blockId)) next.delete(blockId);
    else next.add(blockId);
    setCompletedBlockIds(next);
  };

  const dayCompletedBlocks = currentSchedule.blocks.filter((b) =>
    completedBlockIds.has(b.id)
  ).length;

  const totalDayBlocks = currentSchedule.blocks.length;
  const dayProgressPct =
    totalDayBlocks > 0 ? Math.round((dayCompletedBlocks / totalDayBlocks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-indigo-400" />
            Plano de Estudos Adaptativo
          </h1>
          <p className="text-sm text-slate-400">
            {isDemo
              ? "Cronograma diário e semanal recalculado automaticamente com base nas suas lacunas e horas disponíveis"
              : `Cronograma personalizado para ${user?.name || "você"} • Foco: ${targetCourse} (${studyHoursPerDay}h/dia)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <Badge variant="cyan" className="text-[10px]">
              Modo Demo
            </Badge>
          )}
          <Badge variant="default" className="text-xs font-mono">
            {plan.weeklyTargetHours}h / semana
          </Badge>
        </div>
      </div>

      {!isDemo && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <p>
            Este é o seu roteiro inicial de nivelamento. Assim que você enviar um simulado ou gabarito, os blocos de estudo se reorganizarão priorizando automaticamente as matérias em que você teve maior dificuldade.
          </p>
        </div>
      )}

      {/* Week Day Pills */}
      <div className="grid grid-cols-7 gap-2">
        {plan.dailySchedules.map((schedule, idx) => {
          const isSelected = selectedDayIdx === idx;
          const isRest = schedule.totalPlannedHours === 0;

          return (
            <div
              key={schedule.dayOfWeek}
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10 scale-105"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                {schedule.dayOfWeek.slice(0, 3)}
              </span>
              <span className="text-xs font-bold text-white block my-1">
                {isRest ? "Descanso" : `${schedule.totalPlannedHours}h`}
              </span>
              <div className="flex justify-center">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-indigo-400" : "bg-slate-700"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Blocks */}
      <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold">
                {currentSchedule.dayOfWeek}
              </Badge>
              <span className="text-xs text-slate-400">
                Meta do dia: <strong>{currentSchedule.totalPlannedHours}h</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Roteiro de Estudos Personalizado
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              {dayCompletedBlocks} de {totalDayBlocks} concluídos
            </span>
            <div className="w-24">
              <Progress value={dayProgressPct} max={100} indicatorClassName="bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* List of Study Blocks */}
        {currentSchedule.blocks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-indigo-400" />
            <h3 className="font-bold text-white text-base">Dia de Recuperação e Descanso</h3>
            <p className="text-xs max-w-sm mx-auto">
              O descanso planejado é fundamental para a consolidação da memória de longo prazo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentSchedule.blocks.map((block) => {
              const isCompleted = completedBlockIds.has(block.id);

              return (
                <div
                  key={block.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCompleted
                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-70"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleBlockCompleted(block.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-slate-700 bg-slate-800 text-transparent hover:border-slate-500"
                      }`}
                      aria-label="Marcar bloco como concluído"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={block.type === "FLASHCARDS" ? "purple" : "default"}
                          className="text-[10px]"
                        >
                          {block.type}
                        </Badge>
                        <span className="text-xs text-indigo-400 font-bold">
                          • {block.durationMinutes} min
                        </span>
                        <span className="text-xs text-slate-400">({block.area})</span>
                      </div>
                      <h3
                        className={`text-sm sm:text-base font-bold transition-all ${
                          isCompleted ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {block.subject}
                      </h3>
                      <p className="text-xs text-slate-400">{block.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {block.type === "FLASHCARDS" ? (
                      <Link href="/flashcards/revisar">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 text-indigo-300">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Revisar</span>
                        </Button>
                      </Link>
                    ) : block.type === "SIMULADO" ? (
                      <Link href="/simulados/novo">
                        <Button variant="primary" size="sm" className="text-xs gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Iniciar Simulado</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant={isCompleted ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => toggleBlockCompleted(block.id)}
                        className="text-xs gap-1.5"
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Concluído</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Iniciar Estudo</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
