"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface PeriodTrendChartProps {
  data: { period: string; count: number }[];
}

export function PeriodTrendChart({ data }: PeriodTrendChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col h-full shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Tren Volume Kontrak per Periode
            </CardTitle>
            <CardDescription className="text-xs">
              Pertumbuhan aktivitas perjanjian kerja sama per tahun (2021 – 2026)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748B" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748B" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Tahun {label}
                        </p>
                        <p className="mt-1 font-medium text-indigo-600 dark:text-indigo-400">
                          {val} Kontrak ({pct}% total)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCount)"
                dot={{ r: 4, fill: "#4F46E5", strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 6, fill: "#4F46E5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
