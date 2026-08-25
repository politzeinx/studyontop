"use client";

import Link from "next/link";
import {
  Layers,
  Sparkles,
  RotateCw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Filter,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";

export default function FlashcardsPage() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

  const flashcardStats = isDemo
    ? [
        { title: "Para Revisar Hoje", count: 18, badge: "Urgente", color: "text-amber-400" },
        { title: "Novos do Último Simulado", count: 8, badge: "Novos", color: "text-indigo-400" },
        { title: "Consolidando", count: 42, badge: "Em curso", color: "text-blue-400" },
        { title: "Dominados / Manutenção", count: 115, badge: "Retenção", color: "text-emerald-400" },
      ]
    : [
        { title: "Para Revisar Hoje", count: 0, badge: "Em dia", color: "text-emerald-400" },
        { title: "Novos do Último Simulado", count: 0, badge: "Aguardando", color: "text-slate-400" },
        { title: "Consolidando", count: 0, badge: "Aguardando", color: "text-slate-400" },
        { title: "Dominados / Manutenção", count: 0, badge: "Aguardando", color: "text-slate-400" },
      ];

  const focusDecks = isDemo
    ? [
        {
          subject: "Química Orgânica",
          reason: "Revisão Contínua Obrigatória (Mesmo em Domínio Alto)",
          dueCount: 6,
          totalCount: 34,
          retention: "91%",
          badge: "Revisão Contínua",
        },
        {
          subject: "Física — Termodinâmica",
          reason: "Gerados a partir de 2 erros no Simulado Recente",
          dueCount: 4,
          totalCount: 16,
          retention: "68%",
          badge: "Lacuna Identificada",
        },
        {
          subject: "Matemática — Geometria Espacial",
          reason: "Conceitos & Fórmulas Críticas (Prismas e Troncos)",
          dueCount: 8,
          totalCount: 22,
          retention: "54%",
          badge: "Prioridade Máxima",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            Flashcards Inteligentes & Repetição Espaçada (SRS)
          </h1>
          <p className="text-sm text-slate-400">
            Cartões gerados automaticamente a partir de erros reais e lacunas conceituais detectadas no ENEM
          </p>
        </div>

        {isDemo ? (
          <Link href="/flashcards/revisar">
            <Button variant="glow" size="lg" className="gap-2">
              <Play className="w-4 h-4 fill-white" />
              <span>Começar Revisão de Hoje (18)</span>
            </Button>
          </Link>
        ) : (
          <Link href="/simulados/novo">
            <Button variant="primary" size="lg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Fazer Simulado para Gerar Cards</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {flashcardStats.map((stat, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{stat.title}</span>
              <Badge variant="secondary" className="text-[10px]">{stat.badge}</Badge>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {stat.count}
            </div>
          </Card>
        ))}
      </div>

      {/* Decks by Priority */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Conjuntos de Estudo</h2>

        {focusDecks.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-indigo-400/60" />
            <p className="text-xs sm:text-sm max-w-md mx-auto">
              Você ainda não possui flashcards pendentes. Seus decks serão gerados sob medida automaticamente conforme seus erros e necessidades de revisão.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {focusDecks.map((deck, idx) => (
              <Card key={idx} interactive className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={deck.badge === "Prioridade Máxima" ? "destructive" : "default"} className="text-[10px]">
                      {deck.badge}
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-400">Retenção {deck.retention}</span>
                  </div>
                  <h3 className="font-bold text-white text-base">{deck.subject}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{deck.reason}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Pendentes para hoje:</span>
                    <span className="font-bold text-indigo-400">{deck.dueCount} de {deck.totalCount}</span>
                  </div>
                  <Link href={`/flashcards/revisar?subject=${encodeURIComponent(deck.subject)}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Revisar este Assunto
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
