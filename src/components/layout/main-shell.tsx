"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { AuthProvider } from "@/context/auth-context";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";

  return (
    <AuthProvider>
      {isAuthPage ? (
        <main className="min-h-screen bg-[#0B0F19] text-slate-100">{children}</main>
      ) : (
        <div className="min-h-screen bg-[#0B0F19] flex">
          {/* Sidebar Desktop */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
            {/* Desktop Header */}
            <Header />

            {/* Mobile Header and Bottom Bar */}
            <MobileNav />

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 lg:pt-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-300">
              {children}
            </main>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}
