"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedSimulation } from "@/services/simulation/simulation-generator";
import { calculateSimulationTRI } from "@/lib/tri/tri-engine";
import { analyzeResponseConsistency } from "@/lib/tri/consistency";

export function ExamRunner({
  simulation,
  onFinishExam,
}: {
  simulation: GeneratedSimulation;
  onFinishExam: (result: any) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedForReview, setFlaggedForReview] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState(simulation.durationMinutes * 60);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = simulation.questions[currentIdx];
  const totalQuestions = simulation.questions.length;

  const handleSelectAlternative = (altLetter: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: altLetter,
    });
  };

  const toggleFlag = () => {
    const next = new Set(flaggedForReview);
    if (next.has(currentQ.id)) next.delete(currentQ.id);
    else next.add(currentQ.id);
    setFlaggedForReview(next);
  };

  const handleSubmitExam = () => {
    setIsSubmitting(true);

    // Constrói lista de respostas para o cálculo da TRI
    const itemResponses = simulation.questions.map((q) => {
      const chosen = selectedAnswers[q.id];
      const isCorrect = chosen === q.correctAlternative;
      return {
        questionId: q.id,
        isCorrect,
        isBlank: !chosen,
        triParams: {
          a: q.triParamA || 1.2,
          b: q.triParamB || 0.1,
          c: q.triParamC || 0.2,
          hasOfficialTri: q.hasOfficialTri,
        },
        difficulty: q.difficulty,
      };
    });

    const triResult = calculateSimulationTRI(itemResponses, simulation.area || "MATEMATICA");
    const consistency = analyzeResponseConsistency(itemResponses);

    const summary = {
      simulationId: simulation.id,
      title: simulation.title,
      totalQuestions,
      correctCount: triResult.correctCount,
      wrongCount: totalQuestions - triResult.correctCount - itemResponses.filter((i) => i.isBlank).length,
      blankCount: itemResponses.filter((i) => i.isBlank).length,
      accuracyPercentage: triResult.accuracyPercentage,
      estimatedTriScore: triResult.enemScaleScore,
      consistencyScore: consistency.consistencyScore,
      coherenceLevel: consistency.coherenceLevel,
      answers: selectedAnswers,
      itemResponses,
    };

    onFinishExam(summary);
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Exam Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between sticky top-16 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Badge variant="cyan" className="text-xs font-mono">
            Q{currentIdx + 1} de {totalQuestions}
          </Badge>
          <span className="hidden sm:inline text-xs text-slate-300 font-semibold truncate max-w-xs">
            {currentQ.subject}
          </span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold ${
            secondsRemaining < 900
              ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
              : "bg-slate-800 border-slate-700 text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTime(secondsRemaining)}</span>
        </div>

        {/* Grid & Finish Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGridOpen(!isGridOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5"
            aria-label="Abrir Gabarito"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Gabarito ({answeredCount}/{totalQuestions})</span>
          </button>

          <Button variant="primary" size="sm" onClick={handleSubmitExam} className="text-xs">
            Finalizar
          </Button>
        </div>
      </div>

      {/* Question Navigation Drawer / Matrix if open */}
      {isGridOpen && (
        <Card className="p-4 border-indigo-500/30 glow-indigo animate-in fade-in-50">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white">Mapa Geral de Questões</span>
            <span className="text-xs text-indigo-300">
              {answeredCount} respondidas • {totalQuestions - answeredCount} pendentes
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-15 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {simulation.questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isFlagged = flaggedForReview.has(q.id);
              const isCurrent = idx === currentIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setIsGridOpen(false);
                  }}
                  className={`h-9 rounded-lg text-xs font-bold transition-all relative ${
                    isCurrent
                      ? "ring-2 ring-indigo-400 bg-indigo-600 text-white font-black"
                      : isAnswered
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Question Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Question Metadata Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs">
              {currentQ.discipline}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQ.subject} {currentQ.subsubject ? `• ${currentQ.subsubject}` : ""}
            </Badge>
            {currentQ.competence && currentQ.skill && (
              <Badge variant="purple" className="text-[10px]">
                C{currentQ.competence}:H{currentQ.skill}
              </Badge>
            )}
            <Badge
              variant={
                currentQ.difficulty === "FACIL"
                  ? "success"
                  : currentQ.difficulty === "MEDIA"
                  ? "warning"
                  : "destructive"
              }
              className="text-[10px]"
            >
              {currentQ.difficulty}
            </Badge>
          </div>

          <button
            onClick={toggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              flaggedForReview.has(currentQ.id)
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flaggedForReview.has(currentQ.id) ? "Marcada" : "Revisar depois"}</span>
          </button>
        </div>

        {/* Context Text if present */}
        {currentQ.contextText && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
            "{currentQ.contextText}"
          </div>
        )}

        {/* Statement */}
        <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {currentQ.statement}
        </div>

        {/* Alternatives A, B, C, D, E */}
        <div className="space-y-3 pt-2">
          {currentQ.alternatives.map((alt) => {
            const isSelected = selectedAnswers[currentQ.id] === alt.letter;

            return (
              <div
                key={alt.letter}
                onClick={() => handleSelectAlternative(alt.letter)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10 text-white"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {alt.letter}
                </div>
                <span className="text-xs sm:text-sm leading-relaxed flex-1">
                  {alt.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <Button
            variant="outline"
            size="default"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => Math.max(prev - 1, 0))}
            className="gap-2 text-xs sm:text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <span className="text-xs text-slate-400 font-medium">
            Questão {currentIdx + 1} de {totalQuestions}
          </span>

          <Button
            variant={currentIdx === totalQuestions - 1 ? "primary" : "outline"}
            size="default"
            onClick={() => {
              if (currentIdx === totalQuestions - 1) {
                handleSubmitExam();
              } else {
                setCurrentIdx((prev) => Math.min(prev + 1, totalQuestions - 1));
              }
            }}
            className="gap-2 text-xs sm:text-sm"
          >
            <span>{currentIdx === totalQuestions - 1 ? "Entregar Prova" : "Próxima"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
