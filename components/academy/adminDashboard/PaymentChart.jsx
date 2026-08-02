"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

//////////////////////////////////////////////////////////////

const BAR_COLOR = "#16a34a";

//////////////////////////////////////////////////////////////

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

//////////////////////////////////////////////////////////////

export default function PaymentChart({ data = [], loading = false }) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />

          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-neutral-100" />
        </CardHeader>

        <CardContent>
          <div className="h-[320px] animate-pulse rounded-xl bg-neutral-100" />
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

          <CardDescription>Academy payment collections</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-neutral-500">
            No payment data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>

        <CardDescription>Payments collected per month</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
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
                  fill: "#f5f5f5",
                }}
              />

              <Bar
                dataKey="amount"
                fill={BAR_COLOR}
                radius={[8, 8, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
