"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  stroke: "#2563eb",
  fill: "#93c5fd",
};

//////////////////////////////////////////////////////////////

export default function EnrollmentChart({ data = [], loading = false }) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="h-5 w-52 animate-pulse rounded bg-neutral-200" />

          <div className="mt-2 h-4 w-36 animate-pulse rounded bg-neutral-100" />
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
          <CardTitle>Enrollment Trend</CardTitle>

          <CardDescription>Monthly student registrations</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-neutral-500">
            No enrollment data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Enrollment Trend</CardTitle>

        <CardDescription>Monthly academy registrations</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="enrollmentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={COLORS.fill} stopOpacity={0.6} />

                  <stop
                    offset="100%"
                    stopColor={COLORS.fill}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="month" tickLine={false} axisLine={false} />

              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

              <Tooltip
                cursor={{
                  strokeDasharray: "4 4",
                }}
                formatter={(value) => [value, "Enrollments"]}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.stroke}
                strokeWidth={3}
                fill="url(#enrollmentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
