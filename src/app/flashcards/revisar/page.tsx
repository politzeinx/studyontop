"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Layers,
  Flame,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEED_FLASHCARDS, SeedFlashcard } from "@/lib/data/flashcards-seed";
import { scheduleNextReview, FSRSGrade } from "@/lib/statistics/fsrs-engine";

export default function FlashcardsRevisarPage() {
  const [deck, setDeck] = useState<SeedFlashcard[]>(SEED_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
  });

  const currentCard = deck[currentIdx];
  const totalCards = deck.length;

  // Atalhos de teclado (Espaço para virar, 1/2/3/4 para classificar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1") handleRate(1);
        else if (e.key === "2") handleRate(2);
        else if (e.key === "3") handleRate(3);
        else if (e.key === "4") handleRate(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, sessionCompleted, currentIdx]);

  const handleRate = (grade: FSRSGrade) => {
    const nextReview = scheduleNextReview(
      {
        repetitionCount: currentCard.repetitionCount,
        intervalDays: currentCard.intervalDays,
        easeFactor: currentCard.easeFactor,
        stability: currentCard.stability,
        difficulty: currentCard.difficultyRating,
        stage: currentCard.stage,
        successStreak: currentCard.successStreak,
        failureCount: currentCard.failureCount,
        isContinuousRevision: currentCard.isContinuousRevision,
      },
      grade
    );

    // Atualiza contadores
    setSessionStats((prev) => ({
      ...prev,
      againCount: grade === 1 ? prev.againCount + 1 : prev.againCount,
      hardCount: grade === 2 ? prev.hardCount + 1 : prev.hardCount,
      goodCount: grade === 3 ? prev.goodCount + 1 : prev.goodCount,
      easyCount: grade === 4 ? prev.easyCount + 1 : prev.easyCount,
    }));

    setIsFlipped(false);

    if (currentIdx + 1 < totalCards) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const progressPct = Math.round((currentIdx / totalCards) * 100);

  if (sessionCompleted) {
    const totalRated =
      sessionStats.againCount +
      sessionStats.hardCount +
      sessionStats.goodCount +
      sessionStats.easyCount;
    const successRate =
      totalRated > 0
        ? Math.round(
            ((sessionStats.goodCount + sessionStats.easyCount) / totalRated) * 100
          )
        : 100;

    return (
      <div className="max-w-md mx-auto space-y-6 text-center animate-in fade-in-50 pt-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="text-xs">
            Sessão Diária Concluída
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Parabéns! Revisão Finalizada
          </h1>
          <p className="text-xs text-slate-300">
            Você revisou todos os {totalCards} cartões programados para hoje pelo algoritmo FSRS.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <span className="text-xs text-slate-400 font-semibold">Taxa de Acertos</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{successRate}%</div>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-400 font-semibold">Ofensiva Mantida</span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5" /> 14 Dias
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link href="/flashcards">
            <Button variant="primary" size="lg" className="w-full text-xs sm:text-sm">
              Voltar ao Deck Geral
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full text-xs sm:text-sm">
              Ir para o Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <Link href="/flashcards">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <ChevronLeft className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </Link>

        <span className="text-xs font-bold text-slate-400">
          Cartão {currentIdx + 1} de {totalCards}
        </span>

        <span className="text-xs text-indigo-400 font-semibold">
          {currentCard.subject}
        </span>
      </div>

      <Progress value={progressPct} max={100} indicatorClassName="bg-indigo-500" />

      {/* Interactive 3D Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[380px] sm:min-h-[420px] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 shadow-2xl transition-all cursor-pointer flex flex-col justify-between relative group"
      >
        {/* Card Header Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-[10px]">
              {currentCard.cardType}
            </Badge>
            {currentCard.isContinuousRevision && (
              <Badge variant="cyan" className="text-[10px]">
                Revisão Contínua
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Estágio: <strong className="text-slate-200">{currentCard.stage}</strong>
          </span>
        </div>

        {/* Card Content (Front vs Back) */}
        <div className="my-auto py-4 space-y-4 text-center">
          {!isFlipped ? (
            <div className="space-y-3 animate-in fade-in-50">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
                Pergunta / Desafio Conceitual
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentCard.frontContent}
              </h2>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in-50 text-left">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                  Resposta Explicativa:
                </span>
                <p className="text-sm sm:text-base text-slate-100 whitespace-pre-line leading-relaxed">
                  {currentCard.backContent}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Flip Hint Footer */}
        <div className="text-center pt-3 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" />
            <span>
              {isFlipped
                ? "Clique ou pressione 1-4 para avaliar sua memória"
                : "Clique no cartão ou pressione [Espaço] para ver a resposta"}
            </span>
          </span>
        </div>
      </div>

      {/* 4 FSRS Rating Buttons (Active when flipped) */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-2 animate-in fade-in-50">
          <button
            onClick={() => handleRate(1)}
            className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
          >
            <span className="text-xs font-black block">1. Errei</span>
            <span className="text-[10px] text-rose-400/80 font-mono block mt-0.5">&lt; 1 dia</span>
          </button>

          <button
            onClick={() => handleRate(2)}
            className="p-3 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
          >
            <span className="text-xs font-black block">2. Difícil</span>
            <span className="text-[10px] text-amber-400/80 font-mono block mt-0.5">1.2 dias</span>
          </button>

          <button
            onClick={() => handleRate(3)}
            className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
          >
            <span className="text-xs font-black block">3. Bom</span>
            <span className="text-[10px] text-blue-400/80 font-mono block mt-0.5">3.0 dias</span>
          </button>

          <button
            onClick={() => handleRate(4)}
            className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
          >
            <span className="text-xs font-black block">4. Fácil</span>
            <span className="text-[10px] text-emerald-400/80 font-mono block mt-0.5">7.0 dias</span>
          </button>
        </div>
      ) : (
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsFlipped(true)}
            className="w-full text-xs sm:text-sm"
          >
            Mostrar Resposta [Espaço]
          </Button>
        </div>
      )}
    </div>
  );
}
