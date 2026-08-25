"use client";

import { useState, useEffect } from "react";
import { Settings, User, Sliders, CheckCircle2, X, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAuth,
  QuotaType,
  QUOTA_LABELS,
  estimateSisuCutoffScore,
} from "@/context/auth-context";

export default function ConfiguracoesPage() {
  const { user, updateProfile, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || "Luis Teles");
  const [targetCourse, setTargetCourse] = useState(user?.targetCourse || "Engenharia de Software");
  const [targetCollege, setTargetCollege] = useState(user?.targetCollege || "USP");
  const [quotaType, setQuotaType] = useState<QuotaType>(user?.quotaType || "AMPLA");
  const [targetScore, setTargetScore] = useState(user?.targetScore || 765);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(user?.studyHoursPerDay || 3);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(user?.studyDaysPerWeek || 7);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Puxa sempre a versão mais recente do servidor ao entrar na página
  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTargetCourse(user.targetCourse || "Engenharia de Software");
      setTargetCollege(user.targetCollege || "USP");
      setQuotaType(user.quotaType || "AMPLA");
      setTargetScore(user.targetScore || 765);
      setStudyHoursPerDay(user.studyHoursPerDay || 3);
      setStudyDaysPerWeek(user.studyDaysPerWeek || 7);
    }
  }, [
    user?.name,
    user?.targetCourse,
    user?.targetCollege,
    user?.quotaType,
    user?.targetScore,
    user?.studyHoursPerDay,
    user?.studyDaysPerWeek,
  ]);

  // Recalcula a nota de corte estimada se o curso ou a cota mudar
  const handleCourseChange = (newCourse: string) => {
    setTargetCourse(newCourse);
    setTargetScore(estimateSisuCutoffScore(newCourse, quotaType));
  };

  const handleQuotaChange = (newQuota: QuotaType) => {
    setQuotaType(newQuota);
    setTargetScore(estimateSisuCutoffScore(targetCourse, newQuota));
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setIsRefreshing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    await updateProfile({
      name,
      targetCourse,
      targetCollege,
      quotaType,
      targetScore,
      studyHoursPerDay,
      studyDaysPerWeek,
    });

    setIsSaving(false);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            Configurações da Conta & Preferências
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Personalize seu objetivo ENEM, modalidade de cotas, horas de estudo diárias e nota de corte
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Sincronizando..." : "Sincronizar com Nuvem"}</span>
        </Button>
      </div>

      {/* Floating Toast Notification visível em Celular e Desktop */}
      {isSaved && (
        <div className="fixed bottom-20 lg:bottom-8 right-4 left-4 sm:left-auto sm:w-96 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 border border-emerald-400/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">Configurações Salvas!</p>
              <p className="text-[11px] text-emerald-100">
                Sincronizado com sucesso no PC e no Celular.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSaved(false)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Curso Desejado</label>
              <input
                type="text"
                required
                value={targetCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Universidade Alvo</label>
              <input
                type="text"
                required
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

          <Button
            type="submit"
            variant="primary"
            size="default"
            disabled={isSaving}
            className="w-full mt-4 gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando no Servidor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Salvar Todas as Configurações</span>
              </>
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
}
