"use client";

import { useState, useEffect } from "react";
import { 
  FileCheck2, 
  Users, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { DashboardMetrics } from "@/types/contract";
import { ExpiringContractsAlertModal } from "./expiring-contracts-alert-modal";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Popup alert otomatis setiap pertama kali membuka dashboard pada sesi browser
  useEffect(() => {
    const expiringCount = metrics.expiringIn60Days || (metrics.expiringContractsList?.length ?? 0);
    if (expiringCount > 0) {
      const hasSeen = sessionStorage.getItem("has_seen_expiring_alert");
      if (!hasSeen) {
        setIsAlertOpen(true);
      }
    }
  }, [metrics.expiringIn60Days, metrics.expiringContractsList]);

  const cards = [
    {
      title: "Total Kontrak",
      value: formatNumber(metrics.totalContracts),
      icon: FileCheck2,
      color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/40",
      clickable: false,
    },
    {
      title: "Total Mitra Aktif",
      value: formatNumber(metrics.totalActiveVendors),
      icon: Users,
      color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400",
      border: "border-violet-100 dark:border-violet-900/40",
      clickable: false,
    },
    {
      title: "Kontrak Active",
      value: formatNumber(metrics.validContracts),
      icon: CheckCircle2,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/40",
      clickable: false,
    },
    {
      title: "Kontrak Expired",
      value: formatNumber(metrics.expiredContracts),
      icon: XCircle,
      color: "from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400",
      border: "border-rose-100 dark:border-rose-900/40",
      clickable: false,
    },
    {
      title: "Segera Berakhir",
      value: formatNumber(metrics.expiringIn60Days),
      icon: Clock,
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800/60 ring-1 ring-amber-400/30",
      clickable: true,
      onClick: () => setIsAlertOpen(true),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              onClick={card.clickable ? card.onClick : undefined}
              className={`relative overflow-hidden border ${card.border} transition-all duration-200 group ${
                card.clickable
                  ? "cursor-pointer hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-0.5"
                  : "hover:shadow-md"
              }`}
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
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {card.value}
                    </h4>
                    {card.clickable && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
                        Lihat Alert
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Popup Alert Kontrak Segera Berakhir */}
      <ExpiringContractsAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        contracts={metrics.expiringContractsList || []}
      />
    </>
  );
}
