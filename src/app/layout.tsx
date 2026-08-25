import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainShell } from "@/components/layout/main-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyOnTop — Plataforma Inteligente de Preparação para o ENEM",
  description:
    "Plataforma inteligente e adaptativa de preparação para o ENEM com TRI, OCR, Visão Computacional, Repetição Espaçada, Análise do ENEM Recente e Diagnóstico de Erros.",
  keywords: [
    "ENEM",
    "TRI",
    "Simulados ENEM",
    "Flashcards ENEM",
    "Inteligência Artificial",
    "Scanner de Provas",
    "Repetição Espaçada",
    "Plano de Estudos",
  ],
  authors: [{ name: "StudyOnTop Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyOnTop",
  },
  openGraph: {
    title: "StudyOnTop — Plataforma Inteligente ENEM",
    description:
      "Preparação adaptativa para o ENEM com TRI 3PL, Scanner OCR, Flashcards FSRS e Diagnóstico Pedagógico.",
    type: "website",
    locale: "pt_BR",
    siteName: "StudyOnTop",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <MainShell>{children}</MainShell>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
