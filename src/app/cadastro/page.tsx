"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useAuth,
  QuotaType,
  QUOTA_LABELS,
  estimateSisuCutoffScore,
} from "@/context/auth-context";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetCourse, setTargetCourse] = useState("Engenharia de Software");
  const [targetCollege, setTargetCollege] = useState("USP");
  const [quotaType, setQuotaType] = useState<QuotaType>("AMPLA");
  const [targetScore, setTargetScore] = useState<number>(765);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(3);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  // Recalcula a nota de corte estimada sempre que o curso ou a cota mudar
  useEffect(() => {
    const estimated = estimateSisuCutoffScore(targetCourse, quotaType);
    setTargetScore(estimated);
  }, [targetCourse, quotaType]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsLoading(true);
    await register({
      name,
      email,
      targetCourse,
      targetCollege,
      quotaType,
      targetScore,
      studyHoursPerDay,
      studyDaysPerWeek,
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 mx-auto">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Criar Minha Conta Real
          </h1>
          <p className="text-xs text-slate-400">
            Configure seu curso, modalidade de concorrência e rotina para calibrar a nota de corte
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-800 bg-slate-900/90 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Luis Teles"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Criar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Curso e Faculdade Alvo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Curso Alvo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Engenharia de Software, Medicina, Direito..."
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Universidade / Estado
                </label>
                <input
                  type="text"
                  placeholder="Ex: USP, UNICAMP, UFMG, UFRJ..."
                  value={targetCollege}
                  onChange={(e) => setTargetCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modalidade de Concorrência / Cotas */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Modalidade de Concorrência (Cotas / Ampla)
              </label>
              <select
                value={quotaType}
                onChange={(e) => setQuotaType(e.target.value as QuotaType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {Object.entries(QUOTA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nota de Corte Calculada Dinâmica */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Nota de Corte SISU Estimada
                </span>
                <span className="text-xs text-indigo-300">
                  Calculada para {targetCourse} ({QUOTA_LABELS[quotaType].split(" - ")[0]})
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-indigo-400">
                  ~{targetScore} pts
                </span>
              </div>
            </div>

            {/* Horas e Dias de Estudo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Horas por Dia
                </label>
                <select
                  value={studyHoursPerDay}
                  onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value={1}>1 hora / dia</option>
                  <option value={2}>2 horas / dia</option>
                  <option value={3}>3 horas / dia</option>
                  <option value={4}>4 horas / dia</option>
                  <option value={5}>5 horas / dia</option>
                  <option value={6}>6 horas / dia</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Dias por Semana
                </label>
                <select
                  value={studyDaysPerWeek}
                  onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value={5}>5 dias (Seg a Sex)</option>
                  <option value={6}>6 dias (Seg a Sáb)</option>
                  <option value={7}>7 dias (Segunda a Domingo)</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              disabled={isLoading}
              className="w-full text-xs sm:text-sm gap-2 mt-3"
            >
              {isLoading ? "Criando Conta..." : "Começar Minha Preparação"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>

        {/* Footer: Back to Login */}
        <div className="text-center text-xs text-slate-400">
          Já possui cadastro?{" "}
          <Link href="/login" className="text-indigo-400 font-bold hover:underline">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
