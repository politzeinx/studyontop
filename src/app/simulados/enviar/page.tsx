"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseTextGabarito, ParsedGabaritoItem } from "@/lib/ocr/gabarito-parser";

export default function EnviarSimuladoPage() {
  const [textGabarito, setTextGabarito] = useState(
    "01-A\n02-C\n03-D\n04-B\n05-E\n06-A\n07-C\n08-B\n09-D\n10-E"
  );
  const [parsedItems, setParsedItems] = useState<ParsedGabaritoItem[] | null>(null);
  const [unrecognizedLines, setUnrecognizedLines] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleParse = () => {
    const result = parseTextGabarito(textGabarito);
    setParsedItems(result.items);
    setUnrecognizedLines(result.unrecognizedLines);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-indigo-400" />
          Envio & Confirmação do Gabarito do Aluno
        </h1>
        <p className="text-sm text-slate-400">
          Envie o gabarito em qualquer formato. Suas respostas serão a fonte primária e confirmadas antes da correção.
        </p>
      </div>

      {!parsedItems ? (
        /* Input Screen */
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white block">
              Cole ou digite seu Gabarito/Respostas
            </label>
            <span className="text-xs text-slate-400">
              Formatos aceitos: 01-A, 1.C, 01:D, 1=B, tabelas CSV
            </span>
          </div>

          <textarea
            rows={10}
            placeholder={"Exemplo:\n01-A\n02-C\n03-D\n04-B\n05-E\n06-A\n07-C\n08-B\n09-D\n10-E..."}
            value={textGabarito}
            onChange={(e) => setTextGabarito(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none custom-scrollbar"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400">
              O gabarito fornecido pelo usuário é a fonte primária para o cálculo da TRI.
            </span>
            <Button variant="primary" size="lg" onClick={handleParse} className="gap-2 w-full sm:w-auto">
              <Sparkles className="w-4 h-4" />
              <span>Processar Gabarito</span>
            </Button>
          </div>
        </Card>
      ) : (
        /* Confirmation Screen */
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <Card className="p-6 border-indigo-500/30 glow-indigo">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    {parsedItems.length} Questões Identificadas
                  </Badge>
                  <span className="text-xs text-slate-400">Fonte: Entrada Primária</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Confirmação de Respostas antes da Correção
                </h3>
                <p className="text-xs text-slate-300">
                  Verifique suas alternativas. Clique em qualquer letra para ajustar se necessário.
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
                  <span>Editar Texto</span>
                </Button>
              </div>
            </div>

            {/* Unrecognized lines alert if any */}
            {unrecognizedLines.length > 0 && (
              <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Linhas não reconhecidas:</strong>
                  <span>{unrecognizedLines.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Question Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5 my-6">
              {parsedItems.map((item) => (
                <div
                  key={item.questionNumber}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center space-y-1.5 hover:border-indigo-500/40 transition-colors"
                >
                  <span className="text-[11px] font-bold text-slate-400">
                    Q{item.questionNumber.toString().padStart(2, "0")}
                  </span>

                  {/* Alternative Selector */}
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

            {/* Final Confirmation Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Ao confirmar, o sistema comparará com o gabarito oficial e recalculará sua TRI e mapa de domínio.
              </span>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsConfirmed(true)}
                className="gap-2 w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Realizar Correção</span>
              </Button>
            </div>
          </Card>

          {isConfirmed && (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3 animate-in fade-in-50">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Gabarito Confirmado com Sucesso!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                O gabarito foi registrado. O diagnóstico pedagógico e a nota TRI foram recalculados.
              </p>
              <Button variant="success" size="default" className="text-xs gap-2">
                <span>Ver Relatório Completo Pós-Simulado</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
