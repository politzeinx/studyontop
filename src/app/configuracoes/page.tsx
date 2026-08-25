"use client";

import { useState, useEffect } from "react";
import { Settings, User, Sliders, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAuth,
  QuotaType,
  QUOTA_LABELS,
  estimateSisuCutoffScore,
} from "@/context/auth-context";

export default function ConfiguracoesPage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "Luis Teles");
  const [targetCourse, setTargetCourse] = useState(user?.targetCourse || "Engenharia de Software");
  const [targetCollege, setTargetCollege] = useState(user?.targetCollege || "USP");
  const [quotaType, setQuotaType] = useState<QuotaType>(user?.quotaType || "AMPLA");
  const [targetScore, setTargetScore] = useState(user?.targetScore || 765);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(user?.studyHoursPerDay || 3);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(user?.studyDaysPerWeek || 7);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTargetCourse(user.targetCourse);
      setTargetCollege(user.targetCollege);
      setQuotaType(user.quotaType || "AMPLA");
      setTargetScore(user.targetScore);
      setStudyHoursPerDay(user.studyHoursPerDay);
      setStudyDaysPerWeek(user.studyDaysPerWeek);
    }
  }, [user]);

  // Recalcula a nota de corte estimada se o curso ou a cota mudar
  const handleCourseChange = (newCourse: string) => {
    setTargetCourse(newCourse);
    setTargetScore(estimateSisuCutoffScore(newCourse, quotaType));
  };

  const handleQuotaChange = (newQuota: QuotaType) => {
    setQuotaType(newQuota);
    setTargetScore(estimateSisuCutoffScore(targetCourse, newQuota));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      targetCourse,
      targetCollege,
      quotaType,
      targetScore,
      studyHoursPerDay,
      studyDaysPerWeek,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          Configurações da Conta & Preferências
        </h1>
        <p className="text-sm text-slate-400">
          Personalize seu objetivo ENEM, modalidade de cotas, horas de estudo diárias e nota de corte
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configurações salvas e cronograma recalculado com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil & Meta */}
        <Card className="p-6 space-y-4 border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Perfil & Meta ENEM
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Seu Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Curso Desejado</label>
              <input
                type="text"
                value={targetCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Universidade Alvo</label>
              <input
                type="text"
                value={targetCollege}
                onChange={(e) => setTargetCollege(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Modalidade de Concorrência (Cotas)
              </label>
              <select
                value={quotaType}
                onChange={(e) => handleQuotaChange(e.target.value as QuotaType)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              >
                {Object.entries(QUOTA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Nota de Corte Estimada:</span>
              <span className="text-base font-black text-indigo-400">~{targetScore} pts</span>
            </div>
          </div>
        </Card>

        {/* Parâmetros do Plano de Estudo */}
        <Card className="p-6 space-y-4 border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Parâmetros do Plano de Estudo
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Horas Disponíveis por Dia
                </label>
                <select
                  value={studyHoursPerDay}
                  onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value={1}>1 hora / dia</option>
                  <option value={2}>2 horas / dia</option>
                  <option value={3}>3 horas / dia</option>
                  <option value={4}>4 horas / dia</option>
                  <option value={5}>5 horas / dia</option>
                  <option value={6}>6 horas / dia</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Dias de Estudo por Semana
                </label>
                <select
                  value={studyDaysPerWeek}
                  onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value={5}>5 dias (Seg a Sex)</option>
                  <option value={6}>6 dias (Seg a Sáb)</option>
                  <option value={7}>7 dias (Segunda a Domingo)</option>
                </select>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <span>Carga Horária Semanal Total: </span>
                <strong className="text-white">{studyHoursPerDay * studyDaysPerWeek}h / semana</strong>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="default" className="w-full mt-4">
            Salvar Todas as Configurações
          </Button>
        </Card>
      </form>
    </div>
  );
}
