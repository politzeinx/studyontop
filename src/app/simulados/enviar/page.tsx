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
  Check,
  ArrowLeft,
  FileBadge,
  Sliders,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParsedGabaritoItem } from "@/lib/ocr/gabarito-parser";
import { useAuth } from "@/context/auth-context";
import { getEnemQuestionMetadata, EnemQuestionMeta } from "@/lib/data/enem-official-matrix";

type SelectionMode = "PRESET" | "CUSTOM_RANGE" | "SPECIFIC_COUNT";
type WizardStep = "STUDENT_ANSWERS" | "OFFICIAL_KEY" | "RESULT";

export default function EnviarSimuladoPage() {
  const { user, updateProfile } = useAuth();

  // Configuração da Seleção de Questões
  const [startQuestion, setStartQuestion] = useState<number>(1);
  const [endQuestion, setEndQuestion] = useState<number>(15);
  const [currentStep, setCurrentStep] = useState<WizardStep>("STUDENT_ANSWERS");

  // Etapa 1: Respostas do Aluno
  const [studentInputMode, setStudentInputMode] = useState<"GRID" | "PDF" | "TEXT">("GRID");
  const [studentPdfName, setStudentPdfName] = useState<string | null>(null);
  const [studentText, setStudentText] = useState("");
  const [studentAnswers, setStudentAnswers] = useState<ParsedGabaritoItem[] | null>(null);
  const [isExtractingStudent, setIsExtractingStudent] = useState(false);

  // Etapa 2: Gabarito Oficial da Prova
  const [officialKeyMode, setOfficialKeyMode] = useState<"DEFAULT_ENEM" | "UPLOAD_PDF" | "PASTE_TEXT">("DEFAULT_ENEM");
  const [officialPdfName, setOfficialPdfName] = useState<string | null>(null);
  const [officialText, setOfficialText] = useState("");
  const [officialAnswers, setOfficialAnswers] = useState<ParsedGabaritoItem[] | null>(null);
  const [isExtractingOfficial, setIsExtractingOfficial] = useState(false);

  // Etapa 3: Resultado da Correção
  const [isProcessingCorrection, setIsProcessingCorrection] = useState(false);
  const [correctionSummary, setCorrectionSummary] = useState<{
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    scorePct: number;
    estimatedTri: number;
    rangeLabel: string;
    wrongItems: Array<{
      questionNumber: number;
      userAlt: string;
      correctAlt: string;
      subject: string;
      area: string;
      difficulty: string;
    }>;
  } | null>(null);

  // Define os presets rápidos
  const handleApplyPreset = (start: number, end: number) => {
    setStartQuestion(start);
    setEndQuestion(end);
    setStudentAnswers(null);
  };

  const totalQuestionsCount = Math.max(1, endQuestion - startQuestion + 1);

  // Monta a grade estritamente para o intervalo selecionado
  const buildInitialGrid = (existingItems?: ParsedGabaritoItem[]): ParsedGabaritoItem[] => {
    const map = new Map<number, "A" | "B" | "C" | "D" | "E">();
    if (existingItems) {
      existingItems.forEach((i) => map.set(i.questionNumber, i.alternative));
    }

    const result: ParsedGabaritoItem[] = [];
    const defaultAlts: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];

    for (let q = startQuestion; q <= endQuestion; q++) {
      const existing = map.get(q);
      result.push({
        questionNumber: q,
        alternative: existing || defaultAlts[(q - 1) % 5],
        confidence: existing ? 1.0 : 0.8,
      });
    }
    return result;
  };

  // Etapa 1: Upload do PDF com as respostas do aluno
  const handleStudentPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setStudentPdfName(file.name);
    setIsExtractingStudent(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetCount", endQuestion.toString());

      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIsExtractingStudent(false);

      if (res.ok && data.data?.items && data.data.items.length > 0) {
        setStudentAnswers(buildInitialGrid(data.data.items));
      } else {
        setStudentAnswers(buildInitialGrid());
      }
    } catch (err) {
      setIsExtractingStudent(false);
      setStudentAnswers(buildInitialGrid());
    }
  };

  // Etapa 1: Processar texto digitado pelo aluno
  const handleStudentTextParse = async () => {
    if (!studentText.trim()) return;
    setIsExtractingStudent(true);

    try {
      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: studentText, targetCount: endQuestion }),
      });

      const data = await res.json();
      setIsExtractingStudent(false);

      if (res.ok && data.data?.items) {
        setStudentAnswers(buildInitialGrid(data.data.items));
      }
    } catch (e) {
      setIsExtractingStudent(false);
    }
  };

  // Etapa 2: Upload do PDF do Gabarito Oficial
  const handleOfficialPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setOfficialPdfName(file.name);
    setIsExtractingOfficial(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetCount", endQuestion.toString());

      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIsExtractingOfficial(false);

      if (res.ok && data.data?.items && data.data.items.length > 0) {
        setOfficialAnswers(buildInitialGrid(data.data.items));
      }
    } catch (err) {
      setIsExtractingOfficial(false);
    }
  };

  // Etapa 2: Processar texto do Gabarito Oficial
  const handleOfficialTextParse = async () => {
    if (!officialText.trim()) return;
    setIsExtractingOfficial(true);

    try {
      const res = await fetch("/api/gabarito/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: officialText, targetCount: endQuestion }),
      });

      const data = await res.json();
      setIsExtractingOfficial(false);

      if (res.ok && data.data?.items) {
        setOfficialAnswers(buildInitialGrid(data.data.items));
      }
    } catch (e) {
      setIsExtractingOfficial(false);
    }
  };

  const updateStudentAnswer = (qNum: number, alt: "A" | "B" | "C" | "D" | "E") => {
    if (!studentAnswers) return;
    setStudentAnswers(
      studentAnswers.map((item) =>
        item.questionNumber === qNum ? { ...item, alternative: alt } : item
      )
    );
  };

  // Executa a Correção Cruzando as Respostas do Aluno com o Gabarito Oficial
  const handleRunCorrection = async () => {
    if (!studentAnswers || studentAnswers.length === 0) return;
    setIsProcessingCorrection(true);

    const officialMap = new Map<number, "A" | "B" | "C" | "D" | "E">();

    if (officialAnswers && officialAnswers.length > 0) {
      officialAnswers.forEach((o) => officialMap.set(o.questionNumber, o.alternative));
    } else {
      studentAnswers.forEach((s) => {
        const meta = getEnemQuestionMetadata(s.questionNumber);
        officialMap.set(s.questionNumber, meta.officialKey);
      });
    }

    let correct = 0;
    let wrong = 0;
    const wrongList: Array<{
      questionNumber: number;
      userAlt: string;
      correctAlt: string;
      subject: string;
      area: string;
      difficulty: string;
    }> = [];

    studentAnswers.forEach((sItem) => {
      const meta = getEnemQuestionMetadata(sItem.questionNumber);
      const officialAlt = officialMap.get(sItem.questionNumber) || meta.officialKey;

      if (sItem.alternative === officialAlt) {
        correct++;
      } else {
        wrong++;
        wrongList.push({
          questionNumber: sItem.questionNumber,
          userAlt: sItem.alternative,
          correctAlt: officialAlt,
          subject: meta.subject,
          area: meta.area,
          difficulty: meta.difficulty,
        });
      }
    });

    const total = studentAnswers.length;
    const scorePct = Math.round((correct / total) * 100);
    const calculatedTri = Math.round(520 + (correct / total) * 310);

    // Salva no Banco de Erros
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
      probableCause: `Inconsistência identificada na questão de ${item.subject}.`,
      whatToStudy: `Revisar os tópicos essenciais de ${item.subject}.`,
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

    const rangeLabel = `Questões ${startQuestion.toString().padStart(2, "0")} a ${endQuestion.toString().padStart(2, "0")}`;

    setCorrectionSummary({
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      scorePct,
      estimatedTri: calculatedTri,
      rangeLabel,
      wrongItems: wrongList,
    });

    setIsProcessingCorrection(false);
    setCurrentStep("RESULT");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-indigo-400" />
          Envio de Gabarito & Correção Personalizada
        </h1>
        <p className="text-sm text-slate-400">
          Escolha exatamente quantas questões deseja corrigir (de 5 a 90 questões), envie suas respostas e cruze com o gabarito oficial.
        </p>
      </div>

      {/* Stepper Visual (Etapa 1 -> Etapa 2 -> Resultado) */}
      <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === "STUDENT_ANSWERS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : "bg-emerald-600 text-white"
            }`}
          >
            {currentStep !== "STUDENT_ANSWERS" ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <span
            className={`text-xs font-bold ${
              currentStep === "STUDENT_ANSWERS" ? "text-white" : "text-slate-400"
            }`}
          >
            Suas Respostas da Prova
          </span>
        </div>

        <div className="w-8 sm:w-16 h-0.5 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === "OFFICIAL_KEY"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : currentStep === "RESULT"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {currentStep === "RESULT" ? <Check className="w-4 h-4" /> : "2"}
          </div>
          <span
            className={`text-xs font-bold ${
              currentStep === "OFFICIAL_KEY" ? "text-white" : "text-slate-400"
            }`}
          >
            Gabarito Oficial
          </span>
        </div>

        <div className="w-8 sm:w-16 h-0.5 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === "RESULT"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            3
          </div>
          <span
            className={`text-xs font-bold ${
              currentStep === "RESULT" ? "text-white" : "text-slate-400"
            }`}
          >
            Relatório TRI & Erros
          </span>
        </div>
      </div>

      {/* =========================================================================
          ETAPA 1: SELEÇÃO DO INTERVALO E RESPOSTAS MARCADAS PELO ALUNO
          ========================================================================= */}
      {currentStep === "STUDENT_ANSWERS" && (
        <Card className="p-6 space-y-6">
          {/* Seletor Dinâmico de Quantidade / Intervalo de Questões */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                1. Quais questões você resolveu e deseja corrigir?
              </label>
              <Badge variant="cyan" className="text-xs font-bold">
                {totalQuestionsCount} Questões Selecionadas (Q{startQuestion.toString().padStart(2, "0")} até Q{endQuestion.toString().padStart(2, "0")})
              </Badge>
            </div>

            {/* Presets Rápidos */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(1, 10)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  startQuestion === 1 && endQuestion === 10
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                10 Questões (01 a 10)
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(1, 15)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  startQuestion === 1 && endQuestion === 15
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                15 Questões (01 a 15)
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(1, 20)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  startQuestion === 1 && endQuestion === 20
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                20 Questões (01 a 20)
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(1, 45)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  startQuestion === 1 && endQuestion === 45
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                1 Área (01 a 45)
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(46, 90)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  startQuestion === 46 && endQuestion === 90
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Humanas (46 a 90)
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(1, 90)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  startQuestion === 1 && endQuestion === 90
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                1º Dia Completo (01 a 90)
              </button>
            </div>

            {/* Ajuste Fino Manual do Intervalo */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <span className="text-slate-400 font-semibold">Ou personalize o intervalo exato:</span>
              <div className="flex items-center gap-2">
                <span>Da Questão:</span>
                <input
                  type="number"
                  min={1}
                  max={179}
                  value={startQuestion}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setStartQuestion(val);
                    if (val > endQuestion) setEndQuestion(val + 5);
                    setStudentAnswers(null);
                  }}
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span>Até a Questão:</span>
                <input
                  type="number"
                  min={startQuestion}
                  max={180}
                  value={endQuestion}
                  onChange={(e) => {
                    const val = Math.min(180, parseInt(e.target.value) || startQuestion);
                    setEndQuestion(Math.max(startQuestion, val));
                    setStudentAnswers(null);
                  }}
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {!studentAnswers ? (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">
                2. Como deseja inserir suas {totalQuestionsCount} respostas?
              </label>

              {/* Botões de Ação Imediata */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="glow"
                  size="default"
                  onClick={() => setStudentAnswers(buildInitialGrid())}
                  className="gap-2 text-xs font-bold"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Preencher Grade ({totalQuestionsCount} Questões)</span>
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setStudentInputMode(studentInputMode === "PDF" ? "GRID" : "PDF")}
                  className="gap-2 text-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>{studentInputMode === "PDF" ? "Ocultar PDF" : "Enviar Arquivo PDF"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setStudentInputMode(studentInputMode === "TEXT" ? "GRID" : "TEXT")}
                  className="gap-2 text-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{studentInputMode === "TEXT" ? "Ocultar Texto" : "Colar Texto"}</span>
                </Button>
              </div>

              {/* Upload de PDF opcional */}
              {studentInputMode === "PDF" && (
                <div className="p-6 border-dashed border-2 border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40">
                  <h4 className="text-xs font-bold text-white">
                    {studentPdfName ? `PDF: ${studentPdfName}` : `Selecione o PDF para extrair as ${totalQuestionsCount} questões`}
                  </h4>
                  <label className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-5 cursor-pointer">
                    {isExtractingStudent ? (
                      <>
                        <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                        <span>Lendo PDF...</span>
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
                      onChange={handleStudentPdfUpload}
                      disabled={isExtractingStudent}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Colar Texto opcional */}
              {studentInputMode === "TEXT" && (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    placeholder={"01-A\n02-C\n03-D\n04-B\n05-E\n06-A\n07-C..."}
                    value={studentText}
                    onChange={(e) => setStudentText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStudentTextParse}
                    disabled={isExtractingStudent}
                    className="text-xs"
                  >
                    Processar Texto
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Grade Dinâmica das Questões Selecionadas */
            <div className="space-y-6 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs font-bold">
                      {studentAnswers.length} Questões (Q{startQuestion.toString().padStart(2, "0")} a Q{endQuestion.toString().padStart(2, "0")})
                    </Badge>
                    <span className="text-xs text-slate-400">Suas Respostas Marcadas</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Confira ou ajuste suas alternativas
                  </h3>
                  <p className="text-xs text-slate-300">
                    Toque na letra correspondente para cada uma das {studentAnswers.length} questões.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStudentAnswers(null)}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Alterar Quantidade</span>
                </Button>
              </div>

              {/* Grid das Questões com Rolagem Suave */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 max-h-[440px] overflow-y-auto custom-scrollbar pr-2">
                {studentAnswers.map((item) => {
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
                        <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[55px]">
                          {meta.area.replace("Ciências ", "").slice(0, 5)}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {(["A", "B", "C", "D", "E"] as const).map((alt) => (
                          <button
                            key={alt}
                            type="button"
                            onClick={() => updateStudentAnswer(item.questionNumber, alt)}
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

              {/* Botão de Avanço para a Etapa 2 */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentStep("OFFICIAL_KEY")}
                  className="gap-2 font-bold text-xs sm:text-sm"
                >
                  <span>Avançar para o Gabarito Oficial ({studentAnswers.length} Qs)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          ETAPA 2: GABARITO OFICIAL DA PROVA PARA COMPARAÇÃO
          ========================================================================= */}
      {currentStep === "OFFICIAL_KEY" && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <Badge variant="default" className="text-xs font-bold">
                Etapa 2: Gabarito Oficial de Correção
              </Badge>
              <h3 className="text-lg font-bold text-white mt-1">
                Como deseja comparar suas {studentAnswers?.length} respostas?
              </h3>
              <p className="text-xs text-slate-300">
                Escolha o gabarito oficial de referência para as questões Q{startQuestion.toString().padStart(2, "0")} a Q{endQuestion.toString().padStart(2, "0")}.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep("STUDENT_ANSWERS")}
              className="text-xs gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Minhas Respostas</span>
            </Button>
          </div>

          {/* Opções de Gabarito Oficial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setOfficialKeyMode("DEFAULT_ENEM");
                setOfficialAnswers(null);
              }}
              className={`p-4 rounded-2xl text-left border transition-all ${
                officialKeyMode === "DEFAULT_ENEM"
                  ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-2">
                <FileBadge className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-white block">Gabarito Oficial ENEM</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Régua padrão oficial do INEP para essas {studentAnswers?.length} questões.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOfficialKeyMode("UPLOAD_PDF")}
              className={`p-4 rounded-2xl text-left border transition-all ${
                officialKeyMode === "UPLOAD_PDF"
                  ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-white block">Enviar PDF do Gabarito</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                PDF oficial da sua apostila/simulado do cursinho.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOfficialKeyMode("PASTE_TEXT")}
              className={`p-4 rounded-2xl text-left border transition-all ${
                officialKeyMode === "PASTE_TEXT"
                  ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white mb-2">
                <Edit3 className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-white block">Colar Gabarito em Texto</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Cole em formato 01-A, 02-B...
              </span>
            </button>
          </div>

          {/* Upload de PDF do Gabarito Oficial */}
          {officialKeyMode === "UPLOAD_PDF" && (
            <div className="p-6 border-dashed border-2 border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40">
              <h4 className="text-xs font-bold text-white">
                {officialPdfName ? `Gabarito PDF: ${officialPdfName}` : `Selecione o PDF do Gabarito Oficial (${studentAnswers?.length} Qs)`}
              </h4>
              <label className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-5 cursor-pointer">
                {isExtractingOfficial ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    <span>Lendo Gabarito Oficial...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    <span>Escolher PDF do Gabarito Oficial</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleOfficialPdfUpload}
                  disabled={isExtractingOfficial}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Colar Texto do Gabarito Oficial */}
          {officialKeyMode === "PASTE_TEXT" && (
            <div className="space-y-3">
              <textarea
                rows={5}
                placeholder={"01-A\n02-B\n03-C..."}
                value={officialText}
                onChange={(e) => setOfficialText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleOfficialTextParse}
                disabled={isExtractingOfficial}
                className="text-xs"
              >
                Processar Texto do Gabarito
              </Button>
            </div>
          )}

          {/* Comparação Preliminar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Pronto para corrigir as <strong>{studentAnswers?.length} questões</strong> (Q{startQuestion.toString().padStart(2, "0")} a Q{endQuestion.toString().padStart(2, "0")}).
            </span>
          </div>

          {/* Botão Final de Disparo da Correção */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Ao clicar, o sistema fará a correção e registrará as falhas no seu Banco de Erros.
            </span>
            <Button
              variant="primary"
              size="lg"
              onClick={handleRunCorrection}
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
                  <span>🎯 Realizar Correção ({studentAnswers?.length} Questões)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* =========================================================================
          ETAPA 3: RELATÓRIO PÓS-CORREÇÃO
          ========================================================================= */}
      {currentStep === "RESULT" && correctionSummary && (
        <Card className="p-6 sm:p-8 space-y-6 border-indigo-500/40 glow-indigo animate-in fade-in-50">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Correção de {correctionSummary.totalQuestions} Questões Concluída!
            </h2>
            <p className="text-xs text-slate-300">
              Intervalo corrigido: {correctionSummary.rangeLabel}. As questões incorretas foram catalogadas no Banco de Erros.
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

          {/* Lista detalhada dos erros */}
          {correctionSummary.wrongItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Detalhamento dos Erros Catalogados ({correctionSummary.rangeLabel}):
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
                        <span className="text-slate-400 block text-[10px]">Gabarito Oficial:</span>
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
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setCurrentStep("STUDENT_ANSWERS");
                setStudentAnswers(null);
                setOfficialAnswers(null);
                setCorrectionSummary(null);
              }}
              className="text-xs"
            >
              Nova Correção
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
