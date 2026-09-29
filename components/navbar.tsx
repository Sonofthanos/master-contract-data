"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  FileSpreadsheet, 
  UploadCloud, 
  Database,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isConnectedToSupabase?: boolean;
}

export function Navbar({ isConnectedToSupabase = false }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: BarChart3,
      active: pathname === "/",
    },
    {
      label: "Master Contract Database",
      href: "/contracts",
      icon: FileSpreadsheet,
      active: pathname.startsWith("/contracts") && pathname !== "/contracts/upload",
    },
    {
      label: "Upload Excel",
      href: "/contracts/upload",
      icon: UploadCloud,
      active: pathname === "/contracts/upload",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                  TBIG Master Contract
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                  MCD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Vendor Contract Management & Analytics
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    item.active
                      ? "bg-slate-100 text-indigo-600 font-semibold dark:bg-slate-800 dark:text-indigo-400"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4", item.active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium",
              isConnectedToSupabase
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
            )}
            title={isConnectedToSupabase ? "Terhubung ke Supabase PostgreSQL" : "Berjalan dengan Local Master Data (MCD 22-09-2026)"}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnectedToSupabase ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
              )}
            />
            <Database className="h-3.5 w-3.5" />
            <span>{isConnectedToSupabase ? "Supabase Live" : "Master Dataset Ready"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
