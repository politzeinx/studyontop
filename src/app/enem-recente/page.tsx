"use client";

import { Sparkles, TrendingUp, Info, BookOpen, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EnemRecentePage() {
  const recentTrends = [
    {
      area: "Matemática",
      subject: "Geometria Espacial & Escalas",
      trend: "Alta Recorrência",
      notes: "Questões mais voltadas para leitura de plantas, projeções ortogonais e cálculo de embalagens/volumes práticos.",
      editions: "2023, 2024, 2025",
    },
    {
      area: "Ciências da Natureza",
      subject: "Ecologia & Impactos Antrópicos",
      trend: "Altíssima Recorrência",
      notes: "Forte ênfase em ciclos do carbono/nitrogênio, transição energética e poluição hídrica com leitura de tabelas e gráficos.",
      editions: "2023, 2024, 2025",
    },
    {
      area: "Ciências da Natureza",
      subject: "Química Orgânica (Reações & Isomeria)",
      trend: "Recorrência Contínua",
      notes: "Presença constante de identificação de funções e processos orgânicos industriais/farmacológicos.",
      editions: "2023, 2024, 2025",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Análise Histórica do ENEM Recente (2023+)
        </h1>
        <p className="text-sm text-slate-400">
          Recorte prioritário do padrão contemporâneo do exame: recorrência, contextualização e competências
        </p>
      </div>

      {/* Recurrence Methodology Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong>Critério de Análise:</strong> O sistema utiliza 2023 em diante como recorte temporal definido para representar o padrão recente do exame.
          As edições anteriores (2019-2022) permanecem no banco histórico, porém fora do recorte principal de tendência.
          Tratamos os resultados como <strong className="text-indigo-300">"Tendência observada"</strong>, e nunca como garantia de conteúdo futuro.
        </p>
      </div>

      {/* Trends List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Tendências Observadas por Grande Área</h2>
        <div className="space-y-3">
          {recentTrends.map((item, idx) => (
            <Card key={idx} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400">{item.area}</span>
                  <span className="text-slate-500">•</span>
                  <h3 className="text-sm font-bold text-white">{item.subject}</h3>
                </div>
                <Badge variant="default" className="text-[10px]">
                  {item.trend}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">{item.notes}</p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                Edições com alta presença: <strong className="text-slate-200">{item.editions}</strong>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
