"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { AuthProvider, useAuth } from "@/context/auth-context";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";

  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      router.replace("/login");
    }
  }, [user, isLoading, isAuthPage, router]);

  if (isLoading && !isAuthPage) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-center">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex overflow-x-hidden">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 w-full">
        {/* Desktop Header */}
        <Header />

        {/* Mobile Header and Bottom Bar */}
        <MobileNav />

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pt-16 lg:pt-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-300 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
}
