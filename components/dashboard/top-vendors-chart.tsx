"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface TopVendorsChartProps {
  data: { name: string; count: number; active: number; expired: number }[];
}

export function TopVendorsChart({ data }: TopVendorsChartProps) {
  // Format long vendor names to keep axes readable
  const formattedData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 22 ? d.name.slice(0, 20) + "..." : d.name,
  }));

  return (
    <Card className="flex flex-col h-full shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
            <Building2 className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Top 10 Mitra Kontrak Terbanyak
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                tickLine={false}
                axisLine={false}
                width={150}
                tick={{ fontSize: 11, fill: "#334155" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {row.name}
                        </p>
                        <p className="font-semibold text-slate-600 dark:text-slate-400">
                          Total: {row.count} Kontrak
                        </p>
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <span className="text-emerald-600 font-medium">
                            ● Active: {row.active}
                          </span>
                          <span className="text-rose-600 font-medium">
                            ● Expired: {row.expired}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />
              <Bar dataKey="active" name="Kontrak Active" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="expired" name="Kontrak Expired" stackId="a" fill="#F43F5E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
