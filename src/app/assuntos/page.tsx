"use client";

import { BookOpen, Search, Target, Filter, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";

export default function AssuntosPage() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

  const subjectsMap = isDemo
    ? [
        {
          area: "Matemática",
          subject: "Geometria Espacial",
          domain: 35,
          level: "PRIORIDADE",
          gainPotential: "MUITO ALTO",
          isContinuousRevision: false,
        },
        {
          area: "Ciências da Natureza",
          subject: "Química Orgânica",
          domain: 74,
          level: "ALTO",
          gainPotential: "ALTO",
          isContinuousRevision: true,
        },
        {
          area: "Ciências da Natureza",
          subject: "Termodinâmica",
          domain: 48,
          level: "ATENCAO",
          gainPotential: "ALTO",
          isContinuousRevision: false,
        },
        {
          area: "Matemática",
          subject: "Porcentagem & Matemática Financeira",
          domain: 91,
          level: "ALTO",
          gainPotential: "BAIXO",
          isContinuousRevision: false,
        },
      ]
    : [
        {
          area: "Matemática",
          subject: "Geometria Espacial",
          domain: 0,
          level: "A CALIBRAR",
          gainPotential: "MUITO ALTO",
          isContinuousRevision: false,
        },
        {
          area: "Ciências da Natureza",
          subject: "Química Orgânica",
          domain: 0,
          level: "A CALIBRAR",
          gainPotential: "ALTO",
          isContinuousRevision: true,
        },
        {
          area: "Ciências da Natureza",
          subject: "Termodinâmica",
          domain: 0,
          level: "A CALIBRAR",
          gainPotential: "ALTO",
          isContinuousRevision: false,
        },
        {
          area: "Matemática",
          subject: "Porcentagem & Matemática Financeira",
          domain: 0,
          level: "A CALIBRAR",
          gainPotential: "MÉDIO",
          isContinuousRevision: false,
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          Mapa de Domínio por Assunto (0 a 100)
        </h1>
        <p className="text-sm text-slate-400">
          Diagnóstico contínuo do seu nível de domínio em cada microtópico da Matriz do ENEM
        </p>
      </div>

      {!isDemo && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <p>
            O seu nível de domínio em cada microtópico será calculado de 0 a 100% conforme você responder questões nos simulados ou escanear suas folhas de resposta.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjectsMap.map((sub, idx) => (
          <Card key={idx} interactive className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-400">{sub.area}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{sub.subject}</h3>
              </div>
              <Badge
                variant={
                  sub.level === "PRIORIDADE"
                    ? "destructive"
                    : sub.level === "ATENCAO"
                    ? "warning"
                    : sub.level === "A CALIBRAR"
                    ? "outline"
                    : "success"
                }
                className="text-[10px]"
              >
                {sub.level}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Nível de Domínio</span>
                <span className="font-bold text-white">
                  {sub.domain === 0 && !isDemo ? "0% (Não Avaliado)" : `${sub.domain}%`}
                </span>
              </div>
              <Progress
                value={sub.domain}
                max={100}
                indicatorClassName={
                  sub.domain < 50
                    ? "bg-rose-500"
                    : sub.domain < 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <span>Potencial de Ganho: <strong className="text-white">{sub.gainPotential}</strong></span>
              {sub.isContinuousRevision && (
                <span className="text-indigo-300 font-medium">Revisão Contínua</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
