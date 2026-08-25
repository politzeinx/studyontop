"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  ScanLine,
  UploadCloud,
  AlertTriangle,
  Layers,
  CalendarDays,
  LineChart,
  History,
  Sparkles,
  BookOpen,
  Settings,
  Flame,
  GraduationCap,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: "rose" | "indigo";
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
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

  const navigationGroups: NavGroup[] = [
    {
      category: "Principal",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Plano de Estudos",
          href: "/plano-estudos",
          icon: CalendarDays,
          badge: isDemo ? "Hoje" : undefined,
        },
        {
          title: "Simulados",
          href: "/simulados",
          icon: FileCheck2,
        },
        {
          title: "Scanner Provas",
          href: "/scanner",
          icon: ScanLine,
        },
        {
          title: "Enviar Simulado",
          href: "/simulados/enviar",
          icon: UploadCloud,
        },
      ],
    },
    {
      category: "Aprendizado & Revisão",
      items: [
        {
          title: "Flashcards",
          href: "/flashcards",
          icon: Layers,
          badge: isDemo ? "18" : undefined,
        },
        {
          title: "Revisões (SRS)",
          href: "/revisoes",
          icon: History,
        },
        {
          title: "Banco de Erros",
          href: "/banco-erros",
          icon: AlertTriangle,
          badge: isDemo ? "3" : undefined,
          badgeColor: "rose",
        },
        {
          title: "Mapa de Assuntos",
          href: "/assuntos",
          icon: BookOpen,
        },
      ],
    },
    {
      category: "Inteligência & Estatísticas",
      items: [
        {
          title: "Desempenho & TRI",
          href: "/desempenho",
          icon: LineChart,
        },
        {
          title: "ENEM Recente (2023+)",
          href: "/enem-recente",
          icon: Sparkles,
          badge: "Novo",
        },
        {
          title: "Configurações",
          href: "/configuracoes",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300">
      {/* Brand Logo */}
      <div className="h-18 flex items-center justify-between px-6 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              Study<span className="gradient-text-primary font-black">OnTop</span>
            </span>
            <span className="text-[10px] text-indigo-400/90 font-semibold tracking-wider block -mt-1 uppercase">
              Inteligência ENEM
            </span>
          </div>
        </Link>
      </div>

      {/* Streak & Next Action Widget */}
      <div className="p-4 mx-4 my-3 rounded-xl bg-gradient-to-br from-indigo-950/50 via-slate-900/60 to-purple-950/40 border border-indigo-500/20 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Ofensiva de Estudos</span>
              <span className="text-[11px] text-amber-400 font-bold">
                {isDemo ? 14 : (user?.streakDays || 1)} Dias Seguidos
              </span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium">
            {isDemo ? "TRI 748" : "TRI ---"}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.category}
            </p>
            <div className="space-y-1 mt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                
                // Lógica estrita para evitar conflito de abas simultaneamente ativas
                let isActive = false;
                if (item.href === "/simulados") {
                  isActive = pathname === "/simulados" || pathname === "/simulados/novo" || (pathname.startsWith("/simulados/") && !pathname.startsWith("/simulados/enviar"));
                } else if (item.href === "/simulados/enviar") {
                  isActive = pathname === "/simulados/enviar";
                } else if (item.href === "/scanner") {
                  isActive = pathname === "/scanner";
                } else if (item.href === "/dashboard") {
                  isActive = pathname === "/dashboard";
                } else {
                  isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      isActive
                        ? "bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-indigo-400 font-bold"
                            : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                          item.badgeColor === "rose"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        )}
                      >
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

      {/* User Footer Profile & Account Switcher */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Estudante"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.isDemo ? "Modo Demonstração" : `Foco: ${user?.targetCourse || "ENEM"}`}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sair / Trocar de Conta"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {user?.isDemo ? (
          <Link
            href="/cadastro"
            className="block text-center text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 rounded-lg py-1 transition-colors"
          >
            Começar Minha Conta Real
          </Link>
        ) : (
          <button
            type="button"
            onClick={loginAsDemo}
            className="w-full text-center text-[10px] text-slate-400 hover:text-white transition-colors block py-0.5"
          >
            Ver dados de exemplo
          </button>
        )}
      </div>
    </aside>
  );
}
