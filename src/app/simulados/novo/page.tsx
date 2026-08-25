"use client";

import { useState } from "react";
import { Sparkles, Zap, Sliders, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NovoSimuladoPage() {
  const [selectedArea, setSelectedArea] = useState<string>("TODAS");
  const [questionCount, setQuestionCount] = useState<number>(45);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-indigo-400" />
          Configurar Novo Simulado Adaptativo
        </h1>
        <p className="text-sm text-slate-400">
          Personalize a área, quantidade de questões e deixe o algoritmo selecionar a melhor calibragem
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Area Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white block">Área do Conhecimento</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "MATEMATICA", label: "Matemática" },
              { id: "NATUREZA", label: "Natureza" },
              { id: "HUMANAS", label: "Humanas" },
              { id: "LINGUAGENS", label: "Linguagens" },
            ].map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedArea(area.id)}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  selectedArea === area.id
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white block">Quantidade de Questões</label>
          <div className="flex gap-3">
            {[15, 30, 45, 90].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  questionCount === count
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {count} questões
              </button>
            ))}
          </div>
        </div>

        {/* Calibragem Info */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Calibragem Adaptativa Automática</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            O simulado mesclará 60% de questões de alta prioridade de ganho, 25% de consolidação e 15% de manutenção, reproduzindo a curva TRI real do ENEM.
          </p>
        </div>

        <Button variant="primary" size="lg" className="w-full gap-2 text-sm">
          <span>Gerar e Iniciar Simulado</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}
