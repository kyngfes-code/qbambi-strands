"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

//////////////////////////////////////////////////////////////

const COLORS = {
  stroke: "#16a34a",
  fill: "#86efac",
};

//////////////////////////////////////////////////////////////

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

//////////////////////////////////////////////////////////////

export default function MonthlyRevenueChart({
  data = [],
  growth = 0,
  loading = false,
}) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-36 animate-pulse rounded bg-neutral-100" />
        </CardHeader>

        <CardContent>
          <div className="h-[340px] animate-pulse rounded-xl bg-neutral-100" />
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  if (!data.length) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>

          <CardDescription>Academy income trend</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-[340px] items-center justify-center rounded-xl border border-dashed text-sm text-neutral-500">
            No revenue data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  const latestRevenue = data[data.length - 1]?.amount || 0;

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>Monthly Revenue</CardTitle>

          <CardDescription>Academy revenue trend over time</CardDescription>
        </div>

        <div className="text-right">
          <h3 className="text-2xl font-bold">
            {formatCurrency(latestRevenue)}
          </h3>

          <div
            className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              growth >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {growth >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(1)}%
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="monthlyRevenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={COLORS.fill} stopOpacity={0.5} />

                  <stop
                    offset="95%"
                    stopColor={COLORS.fill}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="month" tickLine={false} axisLine={false} />

              <YAxis
                tickFormatter={(value) =>
                  `₦${(Number(value) / 1000).toFixed(0)}k`
                }
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                cursor={{
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="amount"
                stroke={COLORS.stroke}
                strokeWidth={3}
                fill="url(#monthlyRevenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
