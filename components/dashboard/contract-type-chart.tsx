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
import { Layers } from "lucide-react";

interface ContractTypeChartProps {
  data: {
    category: string;
    P: number;
    B: number;
    Amandemen: number;
    Other: number;
  }[];
}

export function ContractTypeChart({ data }: ContractTypeChartProps) {
  return (
    <Card className="flex flex-col h-full shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
            <Layers className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Tipe Kontrak per Kategori Vendor
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                          Kategori: {label}
                        </p>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
              <Bar dataKey="P" name="Perpanjangan (P)" stackId="a" fill="#6366F1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="B" name="Baru (B)" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Amandemen" name="Amandemen (AMD)" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Other" name="Lainnya" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
