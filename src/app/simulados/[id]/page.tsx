"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExamRunner } from "@/components/simulator/exam-runner";
import { generateSimulation } from "@/services/simulation/simulation-generator";
import { SimulationType, KnowledgeArea } from "@/types";

export default function SimuladoDetailPage() {
  const params = useParams();
  const simId = (params?.id as string) || "sim-default";

  // Gera a prova adaptativa para o simulado
  const [simulation] = useState(() =>
    generateSimulation({
      type: SimulationType.ENEM_RECENTE,
      area: KnowledgeArea.MATEMATICA,
      questionCount: 6, // 6 questões seed completas para teste ágil
    })
  );

  const [examResult, setExamResult] = useState<any | null>(null);

  if (!examResult) {
    return (
      <ExamRunner
        simulation={simulation}
        onFinishExam={(result) => setExamResult(result)}
      />
    );
  }

  // Tela de Relatório Pós-Simulado (Item 38 do Prompt Mestre)
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      {/* Top Banner de Diagnóstico */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 text-center space-y-4">
        <Badge variant="cyan" className="text-xs uppercase font-bold tracking-wider">
          Diagnóstico Concluído
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {simulation.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Suas respostas foram processadas pelo motor TRI (3PL) e integradas ao seu mapa de domínio e banco de erros.
        </p>

        {/* Big Score Badges */}
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 min-w-[150px]">
            <span className="text-xs text-slate-400 font-semibold block">Nota TRI Estimada</span>
            <span className="text-3xl font-black text-indigo-400 block my-1">
              {examResult.estimatedTriScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">Modelo 3PL da Plataforma</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 min-w-[150px]">
            <span className="text-xs text-slate-400 font-semibold block">Taxa de Acertos</span>
            <span className="text-3xl font-black text-emerald-400 block my-1">
              {examResult.correctCount}/{examResult.totalQuestions}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">
              {examResult.accuracyPercentage}% de precisão
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 min-w-[150px]">
            <span className="text-xs text-slate-400 font-semibold block">Consistência TRI</span>
            <span className="text-3xl font-black text-white block my-1">
              {Math.round(examResult.consistencyScore * 100)}%
            </span>
            <span className="text-[10px] text-indigo-300 font-semibold">
              {examResult.coherenceLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown de Questões Resolvidas */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-base">Gabarito Comentado & Análise Questão a Questão</CardTitle>
          <CardDescription className="text-xs">
            Confira sua alternativa, o gabarito oficial e a explicação comentada
          </CardDescription>
        </CardHeader>

        <div className="space-y-3">
          {simulation.questions.map((q, idx) => {
            const chosen = examResult.answers[q.id];
            const isCorrect = chosen === q.correctAlternative;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isCorrect
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : "bg-rose-950/20 border-rose-500/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {q.discipline} — {q.subject}
                    </span>
                    <Badge variant={isCorrect ? "success" : "destructive"} className="text-[10px]">
                      {isCorrect ? "Correta" : "Incorreta"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span>Sua marcação: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{chosen || "Em branco"}</strong></span>
                    <span>Gabarito: <strong className="text-emerald-400">{q.correctAlternative}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {q.statement}
                </p>

                {q.explanation && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <strong className="text-indigo-300 block">Resolução Comentada:</strong>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bottom Action Shortcuts */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link href="/flashcards">
          <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2 text-xs sm:text-sm">
            <Layers className="w-4 h-4" />
            <span>Revisar Flashcards Gerados</span>
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs sm:text-sm">
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
