"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  ScanLine,
  Layers,
  Menu,
  X,
  CalendarDays,
  Flame,
  GraduationCap,
  UploadCloud,
  History,
  AlertTriangle,
  BookOpen,
  LineChart,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function MobileNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout, loginAsDemo } = useAuth();
  const isDemo = user?.isDemo ?? true;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SO";

  const mainBottomTabs = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Simulados", href: "/simulados", icon: FileCheck2 },
    { title: "Scanner", href: "/scanner", icon: ScanLine, isCentral: true },
    { title: "Cards", href: "/flashcards", icon: Layers, badge: isDemo ? "18" : undefined },
    { title: "Plano", href: "/plano-estudos", icon: CalendarDays },
  ];

  const drawerNavigation = [
    {
      category: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Plano de Estudos", href: "/plano-estudos", icon: CalendarDays },
        { title: "Simulados", href: "/simulados", icon: FileCheck2 },
        { title: "Scanner de Provas", href: "/scanner", icon: ScanLine },
        { title: "Enviar Simulado", href: "/simulados/enviar", icon: UploadCloud },
      ],
    },
    {
      category: "Aprendizado & Revisão",
      items: [
        { title: "Flashcards", href: "/flashcards", icon: Layers, badge: isDemo ? "18" : undefined },
        { title: "Revisões (SRS)", href: "/revisoes", icon: History },
        { title: "Banco de Erros", href: "/banco-erros", icon: AlertTriangle },
        { title: "Mapa de Assuntos", href: "/assuntos", icon: BookOpen },
      ],
    },
    {
      category: "Inteligência & Metas",
      items: [
        { title: "Desempenho & TRI", href: "/desempenho", icon: LineChart },
        { title: "ENEM Recente (2023+)", href: "/enem-recente", icon: Sparkles },
        { title: "Configurações & Cotas", href: "/configuracoes", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer (Menu Completo Lateral no Celular) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in-50 duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#0B0F19] h-full border-r border-slate-800 flex flex-col z-50 p-4 justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-white text-base">StudyOnTop</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Streak Widget */}
              <div className="my-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300 font-medium">
                    {isDemo ? 14 : (user?.streakDays || 1)} Dias Seguidos
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  {isDemo ? "TRI 748" : "TRI ---"}
                </span>
              </div>

              {/* Links */}
              <nav className="space-y-4 py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {drawerNavigation.map((group) => (
                  <div key={group.category} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group.category}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsDrawerOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                              isActive
                                ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer Profile & Logout */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user?.name || "Estudante"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {isDemo ? "Modo Demonstração" : user?.targetCourse}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    logout();
                  }}
                  title="Sair"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {isDemo ? (
                <Link
                  href="/cadastro"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block text-center text-[10px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 rounded-lg py-1.5"
                >
                  Criar Minha Conta Real
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    loginAsDemo();
                  }}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-white py-1 block"
                >
                  Ver dados de exemplo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar on Mobile */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 z-30 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">
              Study<span className="gradient-text-primary">OnTop</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold">
            <span className="truncate max-w-[120px]">{user?.targetCourse || "ENEM"}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/90 z-30 px-2 flex items-center justify-around pb-safe">
        {mainBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

          if (tab.isCentral) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 border",
                    isActive
                      ? "bg-indigo-500 shadow-indigo-500/50 border-indigo-300"
                      : "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-indigo-600/40 border-indigo-400/40"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-indigo-300 mt-1">
                  {tab.title}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors relative min-w-[52px]",
                isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">{tab.title}</span>
              {tab.badge && (
                <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
