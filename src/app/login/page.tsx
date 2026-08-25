"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || "E-mail ou senha incorretos.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 mx-auto">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Acessar o <span className="gradient-text-primary">StudyOnTop</span>
          </h1>
          <p className="text-xs text-slate-400">
            Plataforma de inteligência adaptativa e preparação para o ENEM
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-800 bg-slate-900/90 shadow-2xl">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Senha
                </label>
                <a href="#" className="text-[11px] text-indigo-400 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full text-xs sm:text-sm gap-2 mt-2"
            >
              {isLoading ? "Entrando..." : "Entrar na Minha Conta"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold absolute">
              ou
            </span>
          </div>

          {/* 1-Click Demo Mode Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={loginAsDemo}
              className="w-full p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-900/40 text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Explorar no Modo Demonstração (Dados de Exemplo)</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Permite navegar por todos os gráficos, erros e simulados já preenchidos.
            </p>
          </div>
        </Card>

        {/* Footer: Sign Up */}
        <div className="text-center text-xs text-slate-400">
          Não tem uma conta ainda?{" "}
          <Link href="/cadastro" className="text-indigo-400 font-bold hover:underline">
            Criar Conta Real (Começar do Zero)
          </Link>
        </div>
      </div>
    </div>
  );
}
