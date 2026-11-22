"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BOOKING_STATUS_LABEL } from "@/lib/status";
import { formatCurrency } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  requested: "#3b82f6",
  accepted: "#6366f1",
  "in-progress": "#f59e0b",
  completed: "#10b981",
  rejected: "#f43f5e",
  cancelled: "#94a3b8",
};

const countConfig = {
  count: { label: "Jobs", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function JobsBarChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const chartData = data.map((item) => ({
    ...item,
    label: BOOKING_STATUS_LABEL[item.status as keyof typeof BOOKING_STATUS_LABEL] ?? item.status,
  }));

  return (
    <ChartContainer config={countConfig} className="h-[230px] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fontSize: 10 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[7, 7, 0, 0]} maxBarSize={40}>
          {chartData.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? "var(--chart-1)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

const revenueConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function RevenueAreaChart({
  data,
  label = "Revenue",
}: {
  data: { month: string; amount: number }[];
  label?: string;
}) {
  return (
    <ChartContainer config={revenueConfig} className="h-[230px] w-full">
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(value: number) => `$${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-mono font-semibold">
                  {formatCurrency(Number(value))}
                </span>
              )}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="amount"
          name={label}
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#revenue-fill)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

const categoryConfig = {
  count: { label: "Services", color: "var(--chart-2)" },
} satisfies ChartConfig;

const DONUT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8b5cf6",
  "#0ea5e9",
];

export function CategoryDonut({
  data,
}: {
  data: { category: string; count: number }[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ChartContainer config={categoryConfig} className="h-[210px] w-full max-w-[220px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            innerRadius={48}
            outerRadius={78}
            paddingAngle={3}
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={DONUT_COLORS[index % DONUT_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="grid flex-1 gap-2">
        {data.map((entry, index) => (
          <li
            key={entry.category}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">
                {entry.category}
              </span>
            </span>
            <span className="font-semibold tabular-nums">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
