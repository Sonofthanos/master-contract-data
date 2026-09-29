import { getDashboardMetrics } from "@/lib/actions/contract-actions";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { CoreBusinessChart } from "@/components/dashboard/core-business-chart";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { Sparkles, Database } from "lucide-react";

export const revalidate = 0; // Selalu dapatkan data terbaru

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Supabase Notification Banner if not connected */}
      {!metrics.isConnectedToSupabase && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 mt-0.5">
              <Database className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                Mode Master Dataset Excel Aktif ({metrics.totalContracts} Kontrak Terbaca)
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Vendor Contract Dashboard
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Monitoring kontrak mitra, tenggat waktu, dan status kontrak.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <section>
        <KpiCards metrics={metrics} />
      </section>

      {/* Visualisasi Grafik (Recharts) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CoreBusinessChart data={metrics.coreBusinessDistribution} />
        <StatusDonutChart data={metrics.contractStatusComposition} />
      </section>
    </div>
  );
}
