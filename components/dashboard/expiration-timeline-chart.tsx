"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

interface ExpirationTimelineChartProps {
  data: { month: string; count: number }[];
}

export function ExpirationTimelineChart({ data }: ExpirationTimelineChartProps) {
  const totalUpcoming = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col h-full shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CalendarClock className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Proyeksi Jatuh Tempo (12 Bulan)
            </CardTitle>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900">
            {totalUpcoming} Kontrak
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 15, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                angle={-25}
                textAnchor="end"
                height={45}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Bulan {row.month}
                        </p>
                        <p className="font-bold text-amber-600 dark:text-amber-400">
                          {row.count} Kontrak Akan Berakhir
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {row.count > 0 ? "Perlu persiapan berkas amandemen/renewal" : "Tidak ada kontrak berakhir"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 100 ? "#EA580C" : entry.count > 20 ? "#F59E0B" : entry.count > 0 ? "#FBBF24" : "#E2E8F0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
