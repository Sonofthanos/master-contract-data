"use client";

import { 
  FileCheck2, 
  Users, 
  CheckCircle2,
  XCircle,
  Clock 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { DashboardMetrics } from "@/types/contract";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Kontrak Terdaftar",
      value: formatNumber(metrics.totalContracts),
      description: "Seluruh kontrak & amandemen mitra",
      icon: FileCheck2,
      trend: "Master Database",
      color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/40",
    },
    {
      title: "Total Mitra Aktif",
      value: formatNumber(metrics.totalActiveVendors),
      description: "Entitas vendor unik terafiliasi",
      icon: Users,
      trend: "Mitra Unik",
      color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400",
      border: "border-violet-100 dark:border-violet-900/40",
    },
    {
      title: "Kontrak Active",
      value: formatNumber(metrics.validContracts),
      description: `${Math.round((metrics.validContracts / (metrics.totalContracts || 1)) * 100)}% dari total kontrak`,
      icon: CheckCircle2,
      trend: "Aktif Berjalan",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/40",
    },
    {
      title: "Kontrak Expired",
      value: formatNumber(metrics.expiredContracts),
      description: `${Math.round((metrics.expiredContracts / (metrics.totalContracts || 1)) * 100)}% telah lewat jatuh tempo`,
      icon: XCircle,
      trend: "Perlu Amandemen",
      color: "from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400",
      border: "border-rose-100 dark:border-rose-900/40",
    },
    {
      title: "Segera Berakhir (≤ 60 Hari)",
      value: formatNumber(metrics.expiringIn60Days),
      description: "Tenggat waktu 60 hari ke depan",
      icon: Clock,
      trend: "Prioritas Review",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`relative overflow-hidden border ${card.border} hover:shadow-md transition-all duration-200 group`}
          >
            <div className={`absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-gradient-to-br ${card.color} blur-2xl group-hover:scale-110 transition-transform`} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
