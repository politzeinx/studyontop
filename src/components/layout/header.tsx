"use client";

import { Bell, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? true;

  const targetCourse = isDemo ? "Medicina" : (user?.targetCourse || "Engenharia de Software");
  const targetCollege = user?.targetCollege ? ` (${user.targetCollege})` : "";
  const targetScore = isDemo ? 810 : (user?.targetScore || 750);

  return (
    <header className="hidden lg:flex h-18 items-center justify-between px-8 border-b border-slate-800/80 bg-[#0B0F19]/60 backdrop-blur-md sticky top-0 z-30">
      {/* Target and Status Pills */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Target className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">Objetivo:</span>
          <span>{targetCourse}{targetCollege} — Nota de Corte ~{targetScore}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">Motor Adaptativo Ativo</span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-3">
        <Link href="/scanner">
          <Button variant="outline" size="sm" className="gap-2 text-indigo-300 border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/50">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Digitalizar Prova</span>
          </Button>
        </Link>

        <Link href="/simulados/novo">
          <Button variant="primary" size="sm" className="gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Novo Simulado Adaptativo</span>
          </Button>
        </Link>

        <button className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative" aria-label="Notificações">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
}
