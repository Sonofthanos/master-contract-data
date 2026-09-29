import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TBIG Partner Contract Master Database & Vendor Contract Dashboard",
  description:
    "Sistem Master Database & Vendor Contract Dashboard Mitra PT Tower Bersama Group",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isConnected = isSupabaseServerConfigured();

  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50/60 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <Navbar isConnectedToSupabase={isConnected} />
        <main className="flex-1 pb-12">
          {children}
        </main>
        <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
          <p>© 2026 PT Tower Bersama Infrastructure Tbk (TBIG). Master Control Database (MCD) - Vendor Contract Management.</p>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
