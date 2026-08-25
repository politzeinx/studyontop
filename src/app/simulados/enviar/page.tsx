"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Edit3,
  FileCode,
  FileCheck,
  LineChart,
  BookOpen,
  RotateCw,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParsedGabaritoItem } from "@/lib/ocr/gabarito-parser";
import { useAuth } from "@/context/auth-context";
import { getEnemQuestionMetadata, EnemQuestionMeta } from "@/lib/data/enem-official-matrix";

type ExamDayMode = "DIA_1" | "DIA_2" | "AREA_45";

export default function EnviarSimuladoPage() {
  const { user, updateProfile } = useAuth();

  const [examDay, setExamDay] = useState<ExamDayMode>("DIA_1");
  const [inputMode, setInputMode] = useState<"PDF" | "TEXT" | "GRID">("PDF");
  const [textGabarito, setTextGabarito] = useState("");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [isExtractingPDF, setIsExtractingPDF] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedGabaritoItem[] | null>(null);
  const [unrecognizedLines, setUnrecognizedLines] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessingCorrection, setIsProcessingCorrection] = useState(false);
  const [correctionSummary, setCorrectionSummary] = useState<{
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    scorePct: number;
    estimatedTri: number;
    dayLabel: string;
    wrongItems: Array<{ questionNumber: number; userAlt: string; correctAlt: string; subject: string; area: string; difficulty: string }>;
  } | null>(null);

  const startQuestionNum = examDay === "DIA_2" ? 91 : 1;
  const totalQuestionsCount = examDay === "AREA_45" ? 45 : 90;
  const endQuestionNum = startQuestionNum + totalQuestionsCount - 1;

  // Cria a grade vazia / inicializada com base no Dia selecionado
  const buildInitialGrid = (existingItems?: ParsedGabaritoItem[]): ParsedGabaritoItem[] => {
    const map = new Map<number, "A" | "B" | "C" | "D" | "E">();
    if (existingItems) {
      existingItems.forEach((i) => map.set(i.questionNumber, i.alternative));
    }

    const result: ParsedGabaritoItem[] = [];
    const defaultAlts: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];

    for (let q = startQuestionNum; q <= endQuestionNum; q++) {
      const existing = map.get(q);
      result.push({
        questionNumber: q,
        alternative: existing || defaultAlts[(q - 1) % 5],
        confidence: existing ? 1.0 : 0.8,
      });
    }
    return result;
  };

  // Upload e leitura do arquivo PDF
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setPdfFileName(file.name);
    setIsExtractingPDF(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetCount", totalQuestionsCount.toString());

      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIsExtractingPDF(false);

      if (res.ok && data.data?.items && data.data.items.length > 0) {
        const grid = buildInitialGrid(data.data.items);
        setParsedItems(grid);
        setUnrecognizedLines(data.data.unrecognizedLines || []);
      } else {
        setParsedItems(buildInitialGrid());
      }
    } catch (err) {
      setIsExtractingPDF(false);
      setParsedItems(buildInitialGrid());
    }
  };

  const handleParseText = async () => {
    if (!textGabarito.trim()) return;
    setIsExtractingPDF(true);

    try {
      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: textGabarito, targetCount: totalQuestionsCount }),
      });

      const data = await res.json();
      setIsExtractingPDF(false);

      if (res.ok && data.data?.items) {
        setParsedItems(buildInitialGrid(data.data.items));
        setUnrecognizedLines(data.data.unrecognizedLines || []);
        setIsConfirmed(false);
      }
    } catch (e) {
      setIsExtractingPDF(false);
    }
  };

  const handleUpdateAlternative = (
    questionNumber: number,
    newAlternative: "A" | "B" | "C" | "D" | "E"
  ) => {
    if (!parsedItems) return;
    setParsedItems(
      parsedItems.map((item) =>
        item.questionNumber === questionNumber
          ? { ...item, alternative: newAlternative }
          : item
      )
    );
  };

  // Correção oficial utilizando a matriz rigorosa do ENEM
  const handleConfirmAndCorrect = async () => {
    if (!parsedItems || parsedItems.length === 0) return;
    setIsProcessingCorrection(true);

    let correct = 0;
    let wrong = 0;
    const wrongList: Array<{ questionNumber: number; userAlt: string; correctAlt: string; subject: string; area: string; difficulty: string }> = [];

    parsedItems.forEach((item) => {
      const meta: EnemQuestionMeta = getEnemQuestionMetadata(item.questionNumber);
      const officialAlt = meta.officialKey;

      if (item.alternative === officialAlt) {
        correct++;
      } else {
        wrong++;
        wrongList.push({
          questionNumber: item.questionNumber,
          userAlt: item.alternative,
          correctAlt: officialAlt,
          subject: meta.subject,
          area: meta.area,
          difficulty: meta.difficulty,
        });
      }
    });

    const total = parsedItems.length;
    const scorePct = Math.round((correct / total) * 100);
    const calculatedTri = Math.round(520 + (correct / total) * 310);

    // Formata os erros com as disciplinas e matérias 100% corretas do ENEM
    const errorsToSave = wrongList.map((item) => ({
      id: `err-gabarito-${item.questionNumber}-${Date.now()}`,
      questionCode: `ENEM — Questão ${item.questionNumber.toString().padStart(2, "0")}`,
      discipline: item.area,
      subject: item.subject.split(":")[0] || item.subject,
      subsubject: item.subject.split(":")[1]?.trim() || item.subject,
      difficulty: item.difficulty,
      studentAnswer: item.userAlt,
      correctAnswer: item.correctAlt,
      taxonomy:
        item.difficulty === "DIFICIL"
          ? "ERRO_CONCEITUAL"
          : item.difficulty === "FACIL"
          ? "ATENCAO"
          : "CALCULO",
      probableCause: `Inconsistência na resolução da questão de ${item.subject}.`,
      whatToStudy: `Revisar os tópicos essenciais de ${item.subject} e resolver exercícios focados.`,
      reviewCount: 1,
      isResolved: false,
      date: "Hoje",
    }));

    try {
      const email = user?.email || "default";
      const stored = localStorage.getItem(`studyontop_errors_${email}`) || localStorage.getItem("studyontop_errors");
      const currentList = stored ? JSON.parse(stored) : [];
      const updatedList = [...errorsToSave, ...currentList];

      localStorage.setItem(`studyontop_errors_${email}`, JSON.stringify(updatedList));
      localStorage.setItem("studyontop_errors", JSON.stringify(updatedList));
    } catch (e) {}

    await updateProfile({
      currentTriScore: calculatedTri,
      streakDays: (user?.streakDays || 0) + 1,
    });

    const dayLabel =
      examDay === "DIA_1"
        ? "1º Dia (Linguagens e Ciências Humanas)"
        : examDay === "DIA_2"
        ? "2º Dia (Ciências da Natureza e Matemática)"
        : "Simulado 45 Questões";

    setCorrectionSummary({
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      scorePct,
      estimatedTri: calculatedTri,
      dayLabel,
      wrongItems: wrongList,
    });

    setIsProcessingCorrection(false);
    setIsConfirmed(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-indigo-400" />
          Envio de Gabarito & Correção TRI
        </h1>
        <p className="text-sm text-slate-400">
          Envie o gabarito oficial ou respostas do 1º ou 2º dia do ENEM para correção pedagógica e catálogo de erros.
        </p>
      </div>

      {/* TELA DE RESULTADO PÓS-CORREÇÃO COM APONTAMENTO DE ERROS RIGOROSO */}
      {isConfirmed && correctionSummary ? (
        <Card className="p-6 sm:p-8 space-y-6 border-indigo-500/40 glow-indigo animate-in fade-in-50">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Correção e Diagnóstico do {correctionSummary.dayLabel} Concluídos!
            </h2>
            <p className="text-xs text-slate-300">
              O gabarito de {correctionSummary.totalQuestions} questões foi processado. Todas as questões erradas foram catalogadas com as disciplinas oficiais no seu Banco de Erros.
            </p>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Nota TRI Estimada</span>
              <span className="text-2xl font-black text-indigo-400">{correctionSummary.estimatedTri} pts</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Acertos</span>
              <span className="text-2xl font-black text-emerald-400">{correctionSummary.correctCount} / {correctionSummary.totalQuestions}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Aproveitamento</span>
              <span className="text-2xl font-black text-white">{correctionSummary.scorePct}%</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Caderno de Erros</span>
              <span className="text-2xl font-black text-rose-400">+{correctionSummary.wrongCount} itens</span>
            </div>
          </div>

          {/* Lista Detalhada das Questões que o Aluno Errou */}
          {correctionSummary.wrongItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Detalhamento dos Erros Catalogados (Disciplinas do {correctionSummary.dayLabel}):
              </h3>
              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {correctionSummary.wrongItems.map((err) => (
                  <div
                    key={err.questionNumber}
                    className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-rose-300">
                          Questão {err.questionNumber.toString().padStart(2, "0")}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {err.area}
                        </Badge>
                        <Badge variant="destructive" className="text-[10px]">
                          {err.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-white">{err.subject}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Sua Resposta:</span>
                        <span className="font-bold text-rose-400 text-sm">{err.userAlt}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Gabarito:</span>
                        <span className="font-bold text-emerald-400 text-sm">{err.correctAlt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações pós-correção */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <Link href="/banco-erros" className="flex-1">
              <Button variant="outline" size="lg" className="w-full text-xs gap-2 text-rose-300 border-rose-500/30">
                <AlertTriangle className="w-4 h-4" />
                <span>Revisar Erros no Banco de Erros</span>
              </Button>
            </Link>
            <Link href="/desempenho" className="flex-1">
              <Button variant="primary" size="lg" className="w-full text-xs gap-2">
                <LineChart className="w-4 h-4" />
                <span>Acompanhar Evolução TRI</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : !parsedItems ? (
        /* SELEÇÃO DO DIA DO ENEM E FORMATO DE ENVIO */
        <Card className="p-6 space-y-6">
          {/* Seletor Oficial do Dia do ENEM */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              1. Selecione o Dia / Caderno do ENEM correspondente ao Gabarito:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setExamDay("DIA_1");
                  setParsedItems(null);
                }}
                className={`p-3 rounded-xl text-left border transition-all ${
                  examDay === "DIA_1"
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="font-bold text-xs block">1º DIA DO ENEM (Q01 a Q90)</span>
                <span className="text-[10px] opacity-80 block">Linguagens (1-45) & Humanas (46-90)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExamDay("DIA_2");
                  setParsedItems(null);
                }}
                className={`p-3 rounded-xl text-left border transition-all ${
                  examDay === "DIA_2"
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="font-bold text-xs block">2º DIA DO ENEM (Q91 a Q180)</span>
                <span className="text-[10px] opacity-80 block">Natureza (91-135) & Matemática (136-180)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExamDay("AREA_45");
                  setParsedItems(null);
                }}
                className={`p-3 rounded-xl text-left border transition-all ${
                  examDay === "AREA_45"
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="font-bold text-xs block">1 ÁREA ESPECÍFICA (45 Qs)</span>
                <span className="text-[10px] opacity-80 block">Simulado temático de 45 questões</span>
              </button>
            </div>
          </div>

          {/* Seletor de Modo de Envio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              2. Como deseja enviar o gabarito?
            </label>
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setInputMode("PDF")}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  inputMode === "PDF"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Enviar Arquivo PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("TEXT")}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  inputMode === "TEXT"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Colar Texto</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("GRID")}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  inputMode === "GRID"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Grade Manual ({totalQuestionsCount} Qs)</span>
              </button>
            </div>
          </div>

          {/* MODO 1: UPLOAD DE PDF */}
          {inputMode === "PDF" && (
            <div className="p-8 border-dashed border-2 border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-slate-950/40">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">
                  {pdfFileName ? `PDF Selecionado: ${pdfFileName}` : "Selecione o PDF do Gabarito"}
                </h3>
                <p className="text-xs text-slate-400">
                  O leitor extrai as questões do PDF e monta a grade de {totalQuestionsCount} questões correspondentes para sua conferência.
                </p>
              </div>

              <label className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 h-11 px-6 py-2.5 cursor-pointer">
                {isExtractingPDF ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    <span>Lendo PDF ({totalQuestionsCount} Questões)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    <span>Escolher Arquivo PDF</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={isExtractingPDF}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* MODO 2: DIGITAÇÃO DE TEXTO */}
          {inputMode === "TEXT" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Cole o gabarito (ex: 01-A, 02-B... ou sequência de letras):
                </label>
              </div>

              <textarea
                rows={8}
                placeholder={"01-A\n02-C\n03-D\n04-B\n05-E\n06-A\n07-C\n08-B\n09-D\n10-E..."}
                value={textGabarito}
                onChange={(e) => setTextGabarito(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs sm:text-sm focus:border-indigo-500 focus:outline-none custom-scrollbar"
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleParseText}
                  disabled={isExtractingPDF}
                  className="gap-2 text-xs font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Processar {totalQuestionsCount} Questões</span>
                </Button>
              </div>
            </div>
          )}

          {/* MODO 3: GRADE RÁPIDA DE QUESTÕES */}
          {inputMode === "GRID" && (
            <div className="text-center py-6 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Abrir grade de {totalQuestionsCount} questões (Questões {startQuestionNum.toString().padStart(2, "0")} a {endQuestionNum.toString().padStart(2, "0")}):
              </h3>
              <Button
                variant="glow"
                size="lg"
                onClick={() => setParsedItems(buildInitialGrid())}
                className="text-xs font-bold gap-2"
              >
                <FileCode className="w-4 h-4" />
                <span>Preencher Grade do {examDay === "DIA_1" ? "1º Dia" : examDay === "DIA_2" ? "2º Dia" : "Simulado"}</span>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        /* CONFIRMAÇÃO E EDIÇÃO DA GRADE COMPLETA (SEM CORREÇÃO FANTASMA) */
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <Card className="p-6 border-indigo-500/30 glow-indigo space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs font-bold">
                    {parsedItems.length} Questões (Q{startQuestionNum.toString().padStart(2, "0")} a Q{endQuestionNum.toString().padStart(2, "0")})
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Caderno: {examDay === "DIA_1" ? "1º Dia (Linguagens & Humanas)" : "2º Dia (Natureza & Matemática)"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Confira suas Alternativas antes de Realizar a Correção
                </h3>
                <p className="text-xs text-slate-300">
                  Toque em qualquer letra para ajustar se necessário. Nenhuma correção será realizada sem você conferir.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParsedItems(null)}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Trocar Arquivo / Voltar</span>
                </Button>
              </div>
            </div>

            {/* Alerta de linhas não reconhecidas se houver */}
            {unrecognizedLines.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Avisos do parser:</strong>
                  <span>{unrecognizedLines.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Grade Completa de Todas as Questões com as Disciplinas Reais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
              {parsedItems.map((item) => {
                const meta = getEnemQuestionMetadata(item.questionNumber);
                return (
                  <div
                    key={item.questionNumber}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center space-y-1.5 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-[11px] font-bold text-slate-300">
                        Q{item.questionNumber.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[45px]">
                        {meta.area.replace("Ciências ", "").slice(0, 4)}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {(["A", "B", "C", "D", "E"] as const).map((alt) => (
                        <button
                          key={alt}
                          type="button"
                          onClick={() => handleUpdateAlternative(item.questionNumber, alt)}
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            item.alternative === alt
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/50 scale-105"
                              : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão de Finalização da Correção */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Ao clicar, o sistema fará a correção oficial comparando com a matriz de {examDay === "DIA_1" ? "Linguagens e Humanas" : "Natureza e Matemática"}.
              </span>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirmAndCorrect}
                disabled={isProcessingCorrection}
                className="gap-2 w-full sm:w-auto cursor-pointer font-bold"
              >
                {isProcessingCorrection ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Calculando TRI e Diagnóstico...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar e Realizar Correção ({parsedItems.length} Qs)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
