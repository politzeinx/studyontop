"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Check,
  ScanLine,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getErrorTaxonomyConfig } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export interface ErrorItem {
  id: string;
  questionCode: string;
  discipline: string;
  subject: string;
  subsubject: string;
  difficulty: "FACIL" | "MEDIA" | "DIFICIL";
  studentAnswer: string;
  correctAnswer: string;
  taxonomy: string;
  probableCause: string;
  whatToStudy: string;
  reviewCount: number;
  isResolved: boolean;
  date: string;
}

const DEMO_ERRORS: ErrorItem[] = [
  {
    id: "err-1",
    questionCode: "ENEM 2024 — Q148 (Matemática)",
    discipline: "Matemática",
    subject: "Geometria Espacial",
    subsubject: "Tronco de Pirâmide e Proporcionalidade",
    difficulty: "DIFICIL",
    studentAnswer: "C",
    correctAnswer: "A",
    taxonomy: "CALCULO",
    probableCause: "Erro ao simplificar a razão de semelhança k³ para volumes.",
    whatToStudy: "Fórmula de volume do tronco e propriedades de proporcionalidade espacial (k³ para volumes).",
    reviewCount: 2,
    isResolved: false,
    date: "Ontem",
  },
  {
    id: "err-2",
    questionCode: "ENEM 2024 — Q112 (Física)",
    discipline: "Física",
    subject: "Termodinâmica",
    subsubject: "Rendimento de Carnot e Escalas Térmicas",
    difficulty: "DIFICIL",
    studentAnswer: "B",
    correctAnswer: "D",
    taxonomy: "FALTA_CONHECIMENTO",
    probableCause: "Confusão entre temperatura em Celsius e conversão mandatória para Kelvin.",
    whatToStudy: "Segunda Lei da Termodinâmica e conversão estrita T(K) = t(°C) + 273.",
    reviewCount: 3,
    isResolved: false,
    date: "22/08/2026",
  },
  {
    id: "err-3",
    questionCode: "ENEM 2024 — Q095 (Biologia)",
    discipline: "Biologia",
    subject: "Ecologia",
    subsubject: "Ciclos Biogeoquímicos e Eutrofização",
    difficulty: "FACIL",
    studentAnswer: "A",
    correctAnswer: "B",
    taxonomy: "ATENCAO",
    probableCause: "Leitura apressada confundiu a consequência final com o primeiro evento desencadeador.",
    whatToStudy: "Sequência cronológica da Eutrofização em mananciais aquáticos.",
    reviewCount: 1,
    isResolved: false,
    date: "20/08/2026",
  },
  {
    id: "err-4",
    questionCode: "ENEM 2023 — Q064 (História)",
    discipline: "História",
    subject: "História do Brasil",
    subsubject: "Estado Novo e Cidadania Regulada",
    difficulty: "MEDIA",
    studentAnswer: "E",
    correctAnswer: "B",
    taxonomy: "INTERPRETACAO",
    probableCause: "Interpretação da legislação trabalhista dissociada do controle corporativista de sindicatos.",
    whatToStudy: "Estrutura sindical corporativista da Era Vargas e conceito de Cidadania Regulada.",
    reviewCount: 4,
    isResolved: true,
    date: "14/08/2026",
  },
];

export default function BancoErrosPage() {
  const { user } = useAuth();
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>("TODAS");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("PENDING");
  const [errors, setErrors] = useState<ErrorItem[]>([]);

  useEffect(() => {
    if (user?.isDemo) {
      setErrors(DEMO_ERRORS);
    } else if (user) {
      // Carrega erros reais da conta do usuário
      const stored = localStorage.getItem(`studyontop_errors_${user.id}`);
      if (stored) {
        setErrors(JSON.parse(stored));
      } else {
        setErrors([]);
      }
    }
  }, [user]);

  const toggleResolved = (id: string) => {
    const updated = errors.map((e) =>
      e.id === id ? { ...e, isResolved: !e.isResolved } : e
    );
    setErrors(updated);
    if (user && !user.isDemo) {
      localStorage.setItem(`studyontop_errors_${user.id}`, JSON.stringify(updated));
    }
  };

  const taxonomyTypes = [
    { id: "TODAS", label: "Todas as Causas" },
    { id: "FALTA_CONHECIMENTO", label: "Falta de Conhecimento" },
    { id: "ERRO_CONCEITUAL", label: "Erro Conceitual" },
    { id: "INTERPRETACAO", label: "Interpretação" },
    { id: "CALCULO", label: "Cálculo" },
    { id: "ATENCAO", label: "Atenção" },
    { id: "TEMPO", label: "Gestão do Tempo" },
  ];

  const filteredErrors = errors.filter((item) => {
    if (selectedTaxonomy !== "TODAS" && item.taxonomy !== selectedTaxonomy) return false;
    if (statusFilter === "PENDING" && item.isResolved) return false;
    if (statusFilter === "RESOLVED" && !item.isResolved) return false;
    if (
      searchQuery &&
      !item.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.subsubject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.questionCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pendingCount = errors.filter((e) => !e.isResolved).length;

  // Estado Vazio para Conta Real Nova (Sem erros ainda)
  if (!user?.isDemo && errors.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
              Banco de Erros Inteligente
            </h1>
            <p className="text-sm text-slate-400">
              Diagnóstico de causa raiz de cada questão errada e orientações de estudo
            </p>
          </div>
          <Badge variant="default" className="text-xs">
            Conta Real: {user?.name}
          </Badge>
        </div>

        {/* Empty State Banner */}
        <Card className="p-8 sm:p-12 text-center space-y-5 border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white">Nenhum erro registrado ainda!</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Sua conta real está pronta e limpa. Conforme você realizar simulados ou escanear gabaritos, as questões que você errar serão classificadas aqui automaticamente com o motivo provável e o plano de revisão.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/simulados/novo">
              <Button variant="glow" size="lg" className="w-full sm:w-auto text-xs sm:text-sm gap-2">
                <FileCheck2 className="w-4 h-4" />
                <span>Fazer Primeiro Simulado</span>
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs sm:text-sm gap-2">
                <ScanLine className="w-4 h-4 text-indigo-400" />
                <span>Escanear Folha de Prova</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            Banco de Erros Inteligente
          </h1>
          <p className="text-sm text-slate-400">
            Diagnóstico de causa raiz de cada questão errada, o que estudar e geração de revisões automáticas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.isDemo && (
            <Badge variant="cyan" className="text-[10px]">
              Modo Demonstração
            </Badge>
          )}
          <Badge variant="destructive" className="text-xs">
            {pendingCount} Erros em Análise
          </Badge>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por assunto, subassunto ou código da questão..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 shrink-0">
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "PENDING"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pendentes ({errors.filter((e) => !e.isResolved).length})
            </button>
            <button
              onClick={() => setStatusFilter("RESOLVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "RESOLVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Superados ({errors.filter((e) => e.isResolved).length})
            </button>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ALL"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Taxonomy Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {taxonomyTypes.map((tax) => (
            <button
              key={tax.id}
              onClick={() => setSelectedTaxonomy(tax.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all cursor-pointer ${
                selectedTaxonomy === tax.id
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tax.label}
            </button>
          ))}
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-4">
        {filteredErrors.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-xs">
            Nenhum erro encontrado com os filtros selecionados.
          </Card>
        ) : (
          filteredErrors.map((item) => {
            const taxConfig = getErrorTaxonomyConfig(item.taxonomy);

            return (
              <Card
                key={item.id}
                className={`p-5 sm:p-6 space-y-4 border transition-all ${
                  item.isResolved
                    ? "opacity-60 bg-slate-950/40 border-slate-800"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.questionCode}</span>
                    <Badge className={taxConfig.color}>{taxConfig.label}</Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">
                      Sua resposta: <strong className="text-rose-400">{item.studentAnswer}</strong>
                    </span>
                    <span className="text-slate-400">
                      Gabarito: <strong className="text-emerald-400">{item.correctAnswer}</strong>
                    </span>
                  </div>
                </div>

                {/* Probable Cause Box */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                      Motivo Provável do Erro:
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed">{item.probableCause}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-indigo-400 font-semibold block text-[11px] uppercase tracking-wider">
                      O que estudar:
                    </span>
                    <p className="text-indigo-200 mt-0.5 leading-relaxed font-medium">
                      {item.whatToStudy}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Assunto: <strong className="text-white">{item.subject}</strong></span>
                    <span>•</span>
                    <span>Revisado: <strong>{item.reviewCount}x</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleResolved(item.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        item.isResolved
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{item.isResolved ? "Superado" : "Marcar como Superado"}</span>
                    </button>

                    <Link href={`/flashcards?subject=${encodeURIComponent(item.subject)}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 text-indigo-300 border-indigo-500/30">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Estudar este assunto</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
