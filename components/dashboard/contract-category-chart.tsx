"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";

export interface ContractCategoryChartProps {
  data: { name: string; value: number; color: string }[];
}

export function ContractCategoryChart({ data }: ContractCategoryChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col h-full shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Kategori Kontrak
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[280px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="46%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </p>
                        <p className="mt-1 font-medium text-slate-600 dark:text-slate-300">
                          {item.value} Kontrak ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Backward compatibility alias
export const SourcingStrategyChart = ContractCategoryChart;
