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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationLinks } from "./sidebar";

export function MobileNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainBottomTabs = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Simulados", href: "/simulados", icon: FileCheck2 },
    { title: "Scanner", href: "/scanner", icon: ScanLine, isCentral: true },
    { title: "Cards", href: "/flashcards", icon: Layers, badge: "18" },
    { title: "Plano", href: "/plano-estudos", icon: CalendarDays },
  ];

  return (
    <>
      {/* Mobile Drawer (Menu Completo) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#0B0F19] h-full border-r border-slate-800 flex flex-col z-50 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base">StudyOnTop</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Streak mini */}
            <div className="my-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">14 Dias de Ofensiva</span>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto space-y-4 py-2 custom-scrollbar">
              {navigationLinks.map((group) => (
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
                            "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium",
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
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
        </div>
      )}

      {/* Top Bar on Mobile */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 z-30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-base tracking-tight text-white">
            Study<span className="gradient-text-primary">OnTop</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>14</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            LT
          </div>
        </div>
      </header>

      {/* Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/90 z-30 px-2 flex items-center justify-around">
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
                "flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors relative min-w-[54px]",
                isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">{tab.title}</span>
              {tab.badge && (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
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
