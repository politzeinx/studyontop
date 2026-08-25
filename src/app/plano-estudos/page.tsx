"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  FileCheck2,
  Check,
  Info,
  Plus,
  Trash2,
  Sliders,
  Target,
  GraduationCap,
  AlertTriangle,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  generateAdaptiveStudyPlan,
  PlanGenerationStrategy,
  getCourseSisuWeights,
} from "@/services/study-plan/study-plan-generator";
import { useAuth } from "@/context/auth-context";
import { KnowledgeArea, PriorityLevel } from "@prisma/client";
import { StudyBlock } from "@/types";

export default function PlanoEstudosPage() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

  const [strategy, setStrategy] = useState<PlanGenerationStrategy>("SISU_WEIGHTS");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());
  const [customBlocks, setCustomBlocks] = useState<Record<string, StudyBlock[]>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding a new custom block
  const [newSubject, setNewSubject] = useState("");
  const [newArea, setNewArea] = useState<KnowledgeArea>(KnowledgeArea.MATEMATICA);
  const [newDuration, setNewDuration] = useState(45);
  const [newType, setNewType] = useState<StudyBlock["type"]>("TEORIA");
  const [newReason, setNewReason] = useState("");

  const studyHoursPerDay = user?.studyHoursPerDay || 3.0;
  const studyDaysPerWeek = user?.studyDaysPerWeek || 7;
  const targetCourse = user?.targetCourse || "Engenharia de Software";

  // Carrega blocos customizados salvos pelo aluno
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`studyontop_custom_plan_${user?.email || "guest"}`);
      if (saved) {
        setCustomBlocks(JSON.parse(saved));
      }
    } catch (e) {}
  }, [user]);

  const saveCustomBlocks = (updated: Record<string, StudyBlock[]>) => {
    setCustomBlocks(updated);
    try {
      localStorage.setItem(
        `studyontop_custom_plan_${user?.email || "guest"}`,
        JSON.stringify(updated)
      );
    } catch (e) {}
  };

  const plan = generateAdaptiveStudyPlan(
    {
      studyHoursPerDay,
      studyDaysPerWeek,
      targetCourse,
      strategy,
      customBlocks,
    },
    [],
    isDemo
  );

  const sisuWeights = getCourseSisuWeights(targetCourse);
  const currentSchedule = plan.dailySchedules[selectedDayIdx] || plan.dailySchedules[0];

  const toggleBlockCompleted = (blockId: string) => {
    const next = new Set(completedBlockIds);
    if (next.has(blockId)) next.delete(blockId);
    else next.add(blockId);
    setCompletedBlockIds(next);
  };

  const handleDeleteBlock = (day: string, blockId: string) => {
    const currentDayBlocks = customBlocks[day] || currentSchedule.blocks;
    const filtered = currentDayBlocks.filter((b) => b.id !== blockId);
    const updated = { ...customBlocks, [day]: filtered };
    saveCustomBlocks(updated);
    setStrategy("CUSTOM");
  };

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const dayName = currentSchedule.dayOfWeek;
    const currentDayBlocks = customBlocks[dayName] || [...currentSchedule.blocks];

    const createdBlock: StudyBlock = {
      id: `custom-${Date.now()}`,
      subject: newSubject.trim(),
      area: newArea,
      durationMinutes: newDuration,
      type: newType,
      priority: PriorityLevel.ALTA,
      reason: newReason.trim() || "Bloco personalizado adicionado pelo estudante.",
      completed: false,
    };

    const updated = {
      ...customBlocks,
      [dayName]: [...currentDayBlocks, createdBlock],
    };

    saveCustomBlocks(updated);
    setStrategy("CUSTOM");
    setIsAddModalOpen(false);
    setNewSubject("");
    setNewReason("");
  };

  const handleResetToAuto = () => {
    setCustomBlocks({});
    localStorage.removeItem(`studyontop_custom_plan_${user?.email || "guest"}`);
    setStrategy("SISU_WEIGHTS");
  };

  const dayCompletedBlocks = currentSchedule.blocks.filter((b) =>
    completedBlockIds.has(b.id)
  ).length;

  const totalDayBlocks = currentSchedule.blocks.length;
  const dayProgressPct =
    totalDayBlocks > 0 ? Math.round((dayCompletedBlocks / totalDayBlocks) * 100) : 0;

  const DAY_LABELS: Record<string, string> = {
    SEGUNDA: "Segunda-feira",
    TERCA: "Terça-feira",
    QUARTA: "Quarta-feira",
    QUINTA: "Quinta-feira",
    SEXTA: "Sexta-feira",
    SABADO: "Sábado",
    DOMINGO: "Domingo",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-indigo-400" />
            Plano de Estudos Inteligente
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Foco: <strong className="text-white">{targetCourse}</strong> • {studyHoursPerDay}h/dia ({studyDaysPerWeek} dias/semana)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {strategy === "CUSTOM" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToAuto}
              className="text-xs gap-1.5 text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Automático</span>
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Matéria</span>
          </Button>
        </div>
      </div>

      {/* Strategy Switcher Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          type="button"
          onClick={() => setStrategy("SISU_WEIGHTS")}
          className={`p-3 rounded-xl text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            strategy === "SISU_WEIGHTS"
              ? "bg-indigo-600/20 border border-indigo-500/50 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
          }`}
        >
          <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold block">1. Pesos SISU ({targetCourse})</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Prioriza as matérias com maior peso na nota de corte do seu curso
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStrategy("ERROR_GAPS")}
          className={`p-3 rounded-xl text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            strategy === "ERROR_GAPS"
              ? "bg-amber-600/20 border border-amber-500/50 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
          }`}
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold block">2. Foco em Erros & Lacunas</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Montado em cima dos seus pontos fracos e erros recorrentes
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStrategy("CUSTOM")}
          className={`p-3 rounded-xl text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            strategy === "CUSTOM"
              ? "bg-purple-600/20 border border-purple-500/50 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
          }`}
        >
          <Sliders className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold block">3. Meu Cronograma Próprio</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Monte, adicione e organize suas matérias livremente
            </span>
          </div>
        </button>
      </div>

      {/* Info Banner: Explicação dos Pesos do SISU para o Curso */}
      {strategy === "SISU_WEIGHTS" && (
        <Card className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Matriz de Pesos SISU Estimada — {sisuWeights.courseName}
              </span>
              <p className="text-xs text-slate-300">{sisuWeights.explanation}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                Matemática: x{sisuWeights.weights.MATEMATICA}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                Natureza: x{sisuWeights.weights.NATUREZA}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                Redação: x{sisuWeights.weights.REDACAO}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                Linguagens: x{sisuWeights.weights.LINGUAGENS}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                Humanas: x{sisuWeights.weights.HUMANAS}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Adicionar Novo Bloco de Estudo */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <Card className="w-full max-w-lg p-6 space-y-4 border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Adicionar Matéria em {DAY_LABELS[currentSchedule.dayOfWeek]}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomBlock} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome da Matéria / Assunto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Física (Óptica Geométrica), Filosofia (Contratualismo)..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Área do Conhecimento
                  </label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value as KnowledgeArea)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="MATEMATICA">Matemática</option>
                    <option value="NATUREZA">Ciências da Natureza</option>
                    <option value="HUMANAS">Ciências Humanas</option>
                    <option value="LINGUAGENS">Linguagens & Redação</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Duração
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora (60 min)</option>
                    <option value={90}>1h30 (90 min)</option>
                    <option value={120}>2 horas (120 min)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipo de Atividade
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as StudyBlock["type"])}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="TEORIA">Teoria & Conceito</option>
                  <option value="QUESTOES">Resolução de Questões</option>
                  <option value="FLASHCARDS">Flashcards (SRS)</option>
                  <option value="SIMULADO">Simulado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Objetivo / Observação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Focar em fórmulas e exercícios da lista 3..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Salvar Matéria no Dia
                </Button>
              </div>
            </form>
          </Card>
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
                {DAY_LABELS[currentSchedule.dayOfWeek] || currentSchedule.dayOfWeek}
              </Badge>
              <span className="text-xs text-slate-400">
                Carga do dia: <strong>{currentSchedule.totalPlannedHours}h</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Roteiro de Estudos do Dia
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 text-xs"
            >
              Adicionar Estudo neste Dia
            </Button>
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
                    {/* Checkbox de Conclusão */}
                    <button
                      type="button"
                      onClick={() => toggleBlockCompleted(block.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-slate-700 bg-slate-800 text-transparent hover:border-slate-500"
                      }`}
                      aria-label="Marcar como concluído"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={block.type === "FLASHCARDS" ? "purple" : "default"}
                          className="text-[10px]"
                        >
                          {block.type === "FLASHCARDS"
                            ? "Flashcards"
                            : block.type === "TEORIA"
                            ? "Teoria & Conteúdo"
                            : block.type === "QUESTOES"
                            ? "Questões Práticas"
                            : "Simulado"}
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
                    {/* Botão de Excluir Bloco */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(currentSchedule.dayOfWeek, block.id)}
                      title="Remover matéria deste dia"
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

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
