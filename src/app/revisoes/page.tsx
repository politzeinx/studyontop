"use client";

import { History, Clock, CheckCircle2, RotateCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export default function RevisoesPage() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

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
          <div className="text-3xl font-black text-emerald-400 my-2">
            {isDemo ? "91.4%" : "100%"}
          </div>
          <p className="text-xs text-slate-400">
            {isDemo ? "Alta fixação na memória de longo prazo" : "Sua retenção será calibrada conforme suas revisões"}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Intervalo Médio Atual</span>
          <div className="text-3xl font-black text-white my-2">
            {isDemo ? "14.2 dias" : "---"}
          </div>
          <p className="text-xs text-slate-400">
            {isDemo ? "Estabilidade média dos cartões dominados" : "Aguardando primeiros flashcards"}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Próximos 7 Dias</span>
          <div className="text-3xl font-black text-indigo-400 my-2">
            {isDemo ? "64 revisões" : "0 revisões"}
          </div>
          <p className="text-xs text-slate-400">
            {isDemo ? "Distribuição suave sem sobrecarga" : "Nenhum cartão agendado no momento"}
          </p>
        </Card>
      </div>
    </div>
  );
}
