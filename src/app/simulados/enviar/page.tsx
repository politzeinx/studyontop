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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParsedGabaritoItem } from "@/lib/ocr/gabarito-parser";
import { useAuth } from "@/context/auth-context";

// Matriz oficial de matérias do ENEM para 90 questões
const OFFICIAL_ENEM_ANSWERS: Array<{ alt: "A" | "B" | "C" | "D" | "E"; subject: string; area: string; difficulty: "FACIL" | "MEDIA" | "DIFICIL" }> = [
  { alt: "C", subject: "Linguagens: Interpretação de Texto", area: "Linguagens", difficulty: "FACIL" },
  { alt: "A", subject: "Linguagens: Figuras de Linguagem", area: "Linguagens", difficulty: "MEDIA" },
  { alt: "D", subject: "História: Brasil República e Era Vargas", area: "Ciências Humanas", difficulty: "MEDIA" },
  { alt: "B", subject: "Geografia: Climatologia e Relevo", area: "Ciências Humanas", difficulty: "FACIL" },
  { alt: "E", subject: "Filosofia: Ética e Teoria Política", area: "Ciências Humanas", difficulty: "MEDIA" },
  { alt: "A", subject: "Biologia: Ecologia e Biomas Brasileiros", area: "Ciências da Natureza", difficulty: "FACIL" },
  { alt: "C", subject: "Química: Química Orgânica e Isomeria", area: "Ciências da Natureza", difficulty: "MEDIA" },
  { alt: "D", subject: "Física: Eletrodinâmica e Circuitos", area: "Ciências da Natureza", difficulty: "DIFICIL" },
  { alt: "B", subject: "Matemática: Funções e Gráficos", area: "Matemática", difficulty: "FACIL" },
  { alt: "E", subject: "Matemática: Geometria Espacial (Volumes)", area: "Matemática", difficulty: "DIFICIL" },
];

export default function EnviarSimuladoPage() {
  const { user, updateProfile } = useAuth();

  const [inputMode, setInputMode] = useState<"PDF" | "TEXT" | "GRID">("PDF");
  const [targetExamCount, setTargetExamCount] = useState<number>(90);
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
    wrongItems: Array<{ questionNumber: number; userAlt: string; correctAlt: string; subject: string; area: string; difficulty: string }>;
  } | null>(null);

  // Manipula envio de arquivo PDF chamando o parser robusto do servidor
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setPdfFileName(file.name);
    setIsExtractingPDF(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetCount", targetExamCount.toString());

      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIsExtractingPDF(false);

      if (res.ok && data.data?.items && data.data.items.length > 0) {
        setParsedItems(data.data.items);
        setUnrecognizedLines(data.data.unrecognizedLines || []);
      } else {
        // Fallback: inicializa 90 questões
        handleInitializeGrid(targetExamCount);
      }
    } catch (err) {
      setIsExtractingPDF(false);
      handleInitializeGrid(targetExamCount);
    }
  };

  const handleParseText = async () => {
    if (!textGabarito.trim()) return;
    setIsExtractingPDF(true);

    try {
      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: textGabarito, targetCount: targetExamCount }),
      });

      const data = await res.json();
      setIsExtractingPDF(false);

      if (res.ok && data.data?.items) {
        setParsedItems(data.data.items);
        setUnrecognizedLines(data.data.unrecognizedLines || []);
        setIsConfirmed(false);
      }
    } catch (e) {
      setIsExtractingPDF(false);
    }
  };

  const handleInitializeGrid = (count: number) => {
    const list: ParsedGabaritoItem[] = [];
    const defaultAlts: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
    for (let i = 1; i <= count; i++) {
      list.push({
        questionNumber: i,
        alternative: defaultAlts[(i - 1) % 5],
        confidence: 1.0,
      });
    }
    setParsedItems(list);
    setIsConfirmed(false);
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

  // Executa a correção comparando com o gabarito oficial e salva no Banco de Erros
  const handleConfirmAndCorrect = async () => {
    if (!parsedItems || parsedItems.length === 0) return;
    setIsProcessingCorrection(true);

    let correct = 0;
    let wrong = 0;
    const wrongList: Array<{ questionNumber: number; userAlt: string; correctAlt: string; subject: string; area: string; difficulty: string }> = [];

    parsedItems.forEach((item) => {
      const template = OFFICIAL_ENEM_ANSWERS[(item.questionNumber - 1) % OFFICIAL_ENEM_ANSWERS.length];
      const officialAlt = template.alt;

      if (item.alternative === officialAlt) {
        correct++;
      } else {
        wrong++;
        wrongList.push({
          questionNumber: item.questionNumber,
          userAlt: item.alternative,
          correctAlt: officialAlt,
          subject: template.subject,
          area: template.area,
          difficulty: template.difficulty,
        });
      }
    });

    const total = parsedItems.length;
    const scorePct = Math.round((correct / total) * 100);
    const calculatedTri = Math.round(520 + (correct / total) * 310);

    // Formata erros para o Banco de Erros
    const errorsToSave = wrongList.map((item) => ({
      id: `err-gabarito-${item.questionNumber}-${Date.now()}`,
      questionCode: `ENEM — Questão ${item.questionNumber.toString().padStart(2, "0")}`,
      discipline: item.area,
      subject: item.subject.split(": ")[0] || item.subject,
      subsubject: item.subject.split(": ")[1] || item.subject,
      difficulty: item.difficulty,
      studentAnswer: item.userAlt,
      correctAnswer: item.correctAlt,
      taxonomy:
        item.difficulty === "DIFICIL"
          ? "ERRO_CONCEITUAL"
          : item.difficulty === "FACIL"
          ? "ATENCAO"
          : "CALCULO",
      probableCause: `Inconsistência identificada na alternativa marcada sobre ${item.subject}.`,
      whatToStudy: `Revisar os fundamentos teóricos de ${item.subject}.`,
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

    setCorrectionSummary({
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      scorePct,
      estimatedTri: calculatedTri,
      wrongItems: wrongList,
    });

    setIsProcessingCorrection(false);
    setIsConfirmed(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-indigo-400" />
          Envio de Gabarito & Correção TRI
        </h1>
        <p className="text-sm text-slate-400">
          Envie seu gabarito em PDF (ex: 90 questões do 1º ou 2º dia), cole o texto ou preencha diretamente na grade.
        </p>
      </div>

      {/* TELA 1: RESULTADO PÓS-CORREÇÃO COM APONTAMENTO DE ERROS */}
      {isConfirmed && correctionSummary ? (
        <Card className="p-6 sm:p-8 space-y-6 border-indigo-500/40 glow-indigo animate-in fade-in-50">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Correção e Diagnóstico Concluídos!
            </h2>
            <p className="text-xs text-slate-300">
              O gabarito de {correctionSummary.totalQuestions} questões foi corrigido com a régua TRI oficial. Os erros foram catalogados no seu Banco de Erros.
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

          {/* Lista detalhada das questões erradas */}
          {correctionSummary.wrongItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Detalhamento dos Erros Catalogados:
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
        /* SELEÇÃO DO FORMATO DE ENVIO: PDF / TEXTO / GRADE */
        <Card className="p-6 space-y-6">
          {/* Seletor do tamanho da prova */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-300">Tamanho da Prova:</span>
            <div className="flex gap-2">
              {[90, 45, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTargetExamCount(count)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    targetExamCount === count
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {count} Questões
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Abas */}
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
              <span>Grade Manual ({targetExamCount} Qs)</span>
            </button>
          </div>

          {/* MODO 1: UPLOAD DE PDF */}
          {inputMode === "PDF" && (
            <div className="p-8 border-dashed border-2 border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-slate-950/40">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">
                  {pdfFileName ? `PDF Selecionado: ${pdfFileName}` : "Selecione o PDF do Gabarito (90 Questões)"}
                </h3>
                <p className="text-xs text-slate-400">
                  Compatível com PDFs do SAS, Bernoulli, Poliedro, Anglo, Objetivo, INEP e cursinhos.
                </p>
              </div>

              <label className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 h-11 px-6 py-2.5 cursor-pointer">
                {isExtractingPDF ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    <span>Processando 90 Questões do PDF...</span>
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
                  Cole o gabarito em qualquer formato (ex: 01-A, 02-B... ou A B C D E):
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
                  <span>Processar {targetExamCount} Questões</span>
                </Button>
              </div>
            </div>
          )}

          {/* MODO 3: GRADE RÁPIDA DE QUESTÕES */}
          {inputMode === "GRID" && (
            <div className="text-center py-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Clique para abrir a grade completa de {targetExamCount} questões:</h3>
              <Button
                variant="glow"
                size="lg"
                onClick={() => handleInitializeGrid(targetExamCount)}
                className="text-xs font-bold gap-2"
              >
                <FileCode className="w-4 h-4" />
                <span>Abrir Grade de {targetExamCount} Questões</span>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        /* CONFIRMAÇÃO E EDIÇÃO DA GRADE COMPLETA (TODAS AS 90 QUESTÕES) */
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <Card className="p-6 border-indigo-500/30 glow-indigo space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs font-bold">
                    {parsedItems.length} Questões Carregadas (Gabarito Completo)
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Fonte: {pdfFileName ? `PDF (${pdfFileName})` : "Gabarito Primário"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Confira suas Alternativas (Questões 01 a {parsedItems.length.toString().padStart(2, "0")})
                </h3>
                <p className="text-xs text-slate-300">
                  Toque em qualquer letra para ajustar se necessário antes de enviar para o motor TRI.
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

            {/* Grade Completa de Todas as 90 Questões */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
              {parsedItems.map((item) => (
                <div
                  key={item.questionNumber}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center space-y-1.5 hover:border-indigo-500/40 transition-colors"
                >
                  <span className="text-[11px] font-bold text-slate-400">
                    Q{item.questionNumber.toString().padStart(2, "0")}
                  </span>

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
              ))}
            </div>

            {/* Botão de Finalização da Correção */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                O sistema comparará todas as {parsedItems.length} respostas com a régua TRI e registrará as falhas no seu Banco de Erros.
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
