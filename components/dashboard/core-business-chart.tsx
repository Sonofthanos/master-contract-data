"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

interface CoreBusinessChartProps {
  data: { name: string; count: number }[];
}

const COLORS = [
  "#4F46E5",
  "#6366F1",
  "#818CF8",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#93C5FD",
];

export function CoreBusinessChart({ data }: CoreBusinessChartProps) {
  return (
    <Card className="flex flex-col h-full shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Distribusi Top 7 Core Business
            </CardTitle>
            <CardDescription className="text-xs">
              Konsentrasi bidang usaha mitra kerja TBIG
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={130}
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickFormatter={(val) => (val.length > 18 ? `${val.slice(0, 18)}...` : val)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </p>
                        <p className="mt-1 text-indigo-600 dark:text-indigo-400 font-medium">
                          {item.count} Kontrak
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
