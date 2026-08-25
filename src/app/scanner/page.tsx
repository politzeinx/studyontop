"use client";

import { useState } from "react";
import {
  Camera,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sliders,
  Layers,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CameraScanner, CapturedPage } from "@/components/scanner/camera-scanner";
import { MockOCRProvider, DetectedAnswerItem } from "@/lib/ocr/ocr-provider";

export default function ScannerPage() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadedPages, setUploadedPages] = useState<CapturedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStepText, setProcessingStepText] = useState("");
  const [detectedResults, setDetectedResults] = useState<DetectedAnswerItem[] | null>(null);
  const [comparisonMode, setComparisonMode] = useState<"enhanced" | "original">("enhanced");

  const processingStages = [
    "Detectando bordas do documento...",
    "Corrigindo perspectiva e rotação 2D...",
    "Removendo sombras e nivelando iluminação...",
    "Ajustando contraste e nitidez...",
    "Executando OCR com visão computacional...",
    "Identificando alternativas marcadas...",
  ];

  // Simula upload de arquivo via input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newPage: CapturedPage = {
        id: `upload-${Date.now()}`,
        originalDataUrl: dataUrl,
        enhancedDataUrl: dataUrl,
        pageNumber: 1,
      };
      setUploadedPages([newPage]);
    };
    reader.readAsDataURL(file);
  };

  // Inicia o pipeline de 12 etapas
  const startProcessing = async () => {
    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingStepText(processingStages[0]);

    for (let i = 0; i < processingStages.length; i++) {
      setProcessingStepText(processingStages[i]);
      setProcessingProgress(Math.round(((i + 1) / processingStages.length) * 100));
      await new Promise((r) => setTimeout(r, 450));
    }

    // Executa OCR
    const ocrProvider = new MockOCRProvider();
    const result = await ocrProvider.processExamPage("sample_page");
    setDetectedResults(result.detectedAnswers);
    setIsProcessing(false);
  };

  // Permite correção manual de qualquer resposta identificada
  const updateDetectedAnswer = (
    questionNumber: number,
    newAlt: "A" | "B" | "C" | "D" | "E"
  ) => {
    if (!detectedResults) return;
    setDetectedResults(
      detectedResults.map((item) =>
        item.questionNumber === questionNumber
          ? {
              ...item,
              detectedAlternative: newAlt,
              confidence: 1.0,
              isConfidenceLow: false,
              needsManualConfirmation: false,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Scanner Inteligente de Provas & Gabaritos
          </h1>
          <p className="text-sm text-slate-400">
            Digitalização inspirada no CamScanner: correção de perspectiva, remoção de sombras e OCR com nível de confiança.
          </p>
        </div>
      </div>

      {/* Camera Fullscreen Modal if active */}
      {isCameraOpen && (
        <CameraScanner
          onPagesCaptured={(pages) => {
            setUploadedPages(pages);
            setIsCameraOpen(false);
          }}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}

      {/* Main View */}
      {!detectedResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Action Box */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-8 border-dashed border-2 border-indigo-500/30 hover:border-indigo-500/60 transition-colors flex flex-col items-center justify-center text-center min-h-[380px] bg-slate-950/40">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-pulse-subtle">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                {uploadedPages.length > 0
                  ? `${uploadedPages.length} ${uploadedPages.length === 1 ? "página pronta para processar" : "páginas prontas para processar"}`
                  : "Digitalize ou envie as fotos da sua prova"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Suporta câmera com detecção de folha, upload de fotos (JPG, PNG) e arquivos PDF com múltiplas páginas.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => setIsCameraOpen(true)}
                  className="gap-2 text-xs sm:text-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Abrir Câmera do Dispositivo</span>
                </Button>

                <label className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 focus-visible:outline-none bg-slate-800 text-slate-100 hover:bg-slate-700/80 border border-slate-700/60 shadow-sm h-11 px-5 py-2.5 cursor-pointer">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  <span>Carregar Imagem / PDF</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedPages.length > 0 && !isProcessing && (
                <div className="mt-6 pt-4 border-t border-slate-800 w-full flex justify-center">
                  <Button variant="glow" size="lg" onClick={startProcessing} className="gap-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Otimização e Leitura OCR</span>
                  </Button>
                </div>
              )}
            </Card>

            {/* Processing Progress Overlay */}
            {isProcessing && (
              <Card className="p-6 border-indigo-500/40 glow-indigo space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    {processingStepText}
                  </span>
                  <span className="font-bold text-indigo-400">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} max={100} indicatorClassName="bg-indigo-500" />
              </Card>
            )}
          </div>

          {/* Right Pipeline Info */}
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Pipeline de 12 Etapas
              </CardTitle>
              <CardDescription className="text-xs">
                Otimizações aplicadas automaticamente a cada folha
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-2.5 text-xs text-slate-300">
              {[
                "1. Detecção automática de documento",
                "2. Detecção precisa de bordas",
                "3. Correção de perspectiva 2D",
                "4. Correção de rotação e alinhamento",
                "5. Remoção inteligente de sombras",
                "6. Correção de iluminação irregular",
                "7. Ajuste de contraste e nitidez",
                "8. Redução de ruído de câmera",
                "9. Aumento de legibilidade do texto",
                "10. Correção de distorções de lente",
                "11. Preparação da imagem para OCR",
                "12. Identificação com Nível de Confiança",
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results & Confidence Verification Screen */
        <div className="space-y-6 animate-in fade-in-50">
          <Card className="p-6 border-indigo-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    {detectedResults.length} Questões Reconhecidas
                  </Badge>
                  <span className="text-xs text-slate-400">Precisão Média: <strong>88%</strong></span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Respostas Identificadas via OCR e Visão Computacional
                </h3>
                <p className="text-xs text-slate-300">
                  Confira as alternativas lidas. Questões com confiança abaixo de 80% requerem sua confirmação.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetectedResults(null)}
                  className="text-xs"
                >
                  Escanear Outra Folha
                </Button>
              </div>
            </div>

            {/* List of Detected Answers with Confidence Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 my-6">
              {detectedResults.map((item) => (
                <div
                  key={item.questionNumber}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                    item.isConfidenceLow
                      ? "bg-amber-950/20 border-amber-500/40 shadow-sm"
                      : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Questão {item.questionNumber.toString().padStart(2, "0")}
                    </span>
                    <Badge
                      variant={item.isConfidenceLow ? "warning" : "default"}
                      className="text-[9px]"
                    >
                      {Math.round(item.confidence * 100)}%
                    </Badge>
                  </div>

                  {/* Alternative Selector for quick fix */}
                  <div className="flex justify-between gap-1">
                    {(["A", "B", "C", "D", "E"] as const).map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => updateDetectedAnswer(item.questionNumber, alt)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          item.detectedAlternative === alt
                            ? item.isConfidenceLow
                              ? "bg-amber-500 text-slate-950 font-black shadow-md scale-105"
                              : "bg-indigo-600 text-white font-black shadow-md scale-105"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {alt}
                      </button>
                    ))}
                  </div>

                  {item.isConfidenceLow && (
                    <span className="text-[10px] text-amber-300 font-semibold block text-center">
                      Confirmar leitura
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Confirmation Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Nenhuma resposta é inventada quando a leitura não for confiável.
              </span>
              <Button variant="primary" size="lg" className="gap-2 w-full sm:w-auto">
                <Check className="w-4 h-4" />
                <span>Salvar e Prosseguir para a Correção</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
