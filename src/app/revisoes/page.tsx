"use client";

import { History, Clock, CheckCircle2, RotateCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RevisoesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-indigo-400" />
          Revisões Espaçadas (SRS)
        </h1>
        <p className="text-sm text-slate-400">
          Algoritmo FSRS / SM-2 programando intervalos ideais contra a curva do esquecimento
        </p>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Taxa Geral de Retenção</span>
          <div className="text-3xl font-black text-emerald-400 my-2">91.4%</div>
          <p className="text-xs text-slate-400">Alta fixação na memória de longo prazo</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Intervalo Médio Atual</span>
          <div className="text-3xl font-black text-white my-2">14.2 dias</div>
          <p className="text-xs text-slate-400">Estabilidade média dos cartões dominados</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Próximos 7 Dias</span>
          <div className="text-3xl font-black text-indigo-400 my-2">64 revisões</div>
          <p className="text-xs text-slate-400">Distribuição suave sem sobrecarga</p>
        </Card>
      </div>
    </div>
  );
}
